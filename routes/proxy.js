const express = require('express');
const auth = require('../middleware/auth');
const fetch = require('node-fetch');

const router = express.Router();

const LEETCODE_API = 'https://alfa-leetcode-api.onrender.com';
const GITHUB_API = 'https://api.github.com';

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Helper: check if cache is fresh
function isCacheFresh(user) {
  return user.lastFetchedAt && (Date.now() - new Date(user.lastFetchedAt).getTime()) < CACHE_DURATION;
}

// GET /api/leetcode/profile
router.get('/leetcode/profile', auth, async (req, res) => {
  try {
    const username = req.user.leetcodeUsername;
    if (!username) return res.json({ data: null, message: 'No LeetCode username configured.' });

    if (isCacheFresh(req.user) && req.user.cachedLeetCode?.profile) {
      return res.json({ data: req.user.cachedLeetCode.profile, cached: true });
    }

    const response = await fetch(`${LEETCODE_API}/${username}`);
    if (!response.ok) throw new Error(`LeetCode API error: ${response.status}`);
    const data = await response.json();

    // Update cache
    const cached = req.user.cachedLeetCode || {};
    cached.profile = data;
    await req.user.constructor.findByIdAndUpdate(req.user._id, {
      cachedLeetCode: cached,
      lastFetchedAt: new Date(),
    });

    res.json({ data, cached: false });
  } catch (error) {
    console.error('LeetCode profile proxy error:', error.message);
    if (req.user.cachedLeetCode?.profile) {
      return res.json({ data: req.user.cachedLeetCode.profile, cached: true, stale: true });
    }
    res.status(502).json({ error: 'Failed to fetch LeetCode profile.' });
  }
});

// GET /api/leetcode/solved
router.get('/leetcode/solved', auth, async (req, res) => {
  try {
    const username = req.user.leetcodeUsername;
    if (!username) return res.json({ data: null, message: 'No LeetCode username configured.' });

    if (isCacheFresh(req.user) && req.user.cachedLeetCode?.solved) {
      return res.json({ data: req.user.cachedLeetCode.solved, cached: true });
    }

    const response = await fetch(`${LEETCODE_API}/${username}/solved`);
    if (!response.ok) throw new Error(`LeetCode API error: ${response.status}`);
    const data = await response.json();

    const cached = req.user.cachedLeetCode || {};
    cached.solved = data;
    await req.user.constructor.findByIdAndUpdate(req.user._id, {
      cachedLeetCode: cached,
      lastFetchedAt: new Date(),
    });

    res.json({ data, cached: false });
  } catch (error) {
    console.error('LeetCode solved proxy error:', error.message);
    if (req.user.cachedLeetCode?.solved) {
      return res.json({ data: req.user.cachedLeetCode.solved, cached: true, stale: true });
    }
    res.status(502).json({ error: 'Failed to fetch LeetCode solved data.' });
  }
});

// GET /api/leetcode/calendar
router.get('/leetcode/calendar', auth, async (req, res) => {
  try {
    const username = req.user.leetcodeUsername;
    if (!username) return res.json({ data: null, message: 'No LeetCode username configured.' });

    if (isCacheFresh(req.user) && req.user.cachedLeetCode?.calendar) {
      return res.json({ data: req.user.cachedLeetCode.calendar, cached: true });
    }

    const response = await fetch(`${LEETCODE_API}/${username}/calendar`);
    if (!response.ok) throw new Error(`LeetCode API error: ${response.status}`);
    const data = await response.json();

    const cached = req.user.cachedLeetCode || {};
    cached.calendar = data;
    await req.user.constructor.findByIdAndUpdate(req.user._id, {
      cachedLeetCode: cached,
      lastFetchedAt: new Date(),
    });

    res.json({ data, cached: false });
  } catch (error) {
    console.error('LeetCode calendar proxy error:', error.message);
    if (req.user.cachedLeetCode?.calendar) {
      return res.json({ data: req.user.cachedLeetCode.calendar, cached: true, stale: true });
    }
    res.status(502).json({ error: 'Failed to fetch LeetCode calendar.' });
  }
});

// GET /api/github/repo
router.get('/github/repo', auth, async (req, res) => {
  try {
    const { githubUsername, githubStriverRepo } = req.user;
    if (!githubUsername || !githubStriverRepo) {
      return res.json({ data: null, message: 'No GitHub repo configured.' });
    }

    if (isCacheFresh(req.user) && req.user.cachedGitHub?.repo) {
      return res.json({ data: req.user.cachedGitHub.repo, cached: true });
    }

    const repoInfoRes = await fetch(`${GITHUB_API}/repos/${githubUsername}/${githubStriverRepo}`, {
      headers: { 'User-Agent': 'DSA-Tracker' }
    });
    if (!repoInfoRes.ok) throw new Error(`GitHub Info error: ${repoInfoRes.status}`);
    const repoInfo = await repoInfoRes.json();
    const branch = repoInfo.default_branch || 'main';

    const response = await fetch(`${GITHUB_API}/repos/${githubUsername}/${githubStriverRepo}/git/trees/${branch}?recursive=1`, {
      headers: { 'User-Agent': 'DSA-Tracker' }
    });
    if (!response.ok) throw new Error(`GitHub Tree error: ${response.status}`);
    const treeData = await response.json();
    const data = treeData.tree || [];

    const cached = req.user.cachedGitHub || {};
    cached.repo = data;
    await req.user.constructor.findByIdAndUpdate(req.user._id, {
      cachedGitHub: cached,
      lastFetchedAt: new Date(),
    });

    res.json({ data, cached: false });
  } catch (error) {
    console.error('GitHub repo proxy error:', error.message);
    if (req.user.cachedGitHub?.repo) {
      return res.json({ data: req.user.cachedGitHub.repo, cached: true, stale: true });
    }
    res.status(502).json({ error: 'Failed to fetch GitHub repo.' });
  }
});

// GET /api/github/commits
router.get('/github/commits', auth, async (req, res) => {
  try {
    const { githubUsername, githubStriverRepo } = req.user;
    if (!githubUsername || !githubStriverRepo) {
      return res.json({ data: null, message: 'No GitHub repo configured.' });
    }

    if (isCacheFresh(req.user) && req.user.cachedGitHub?.commits) {
      return res.json({ data: req.user.cachedGitHub.commits, cached: true });
    }

    const response = await fetch(`${GITHUB_API}/repos/${githubUsername}/${githubStriverRepo}/commits?per_page=15`);
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    const data = await response.json();

    const cached = req.user.cachedGitHub || {};
    cached.commits = data;
    await req.user.constructor.findByIdAndUpdate(req.user._id, {
      cachedGitHub: cached,
      lastFetchedAt: new Date(),
    });

    res.json({ data, cached: false });
  } catch (error) {
    console.error('GitHub commits proxy error:', error.message);
    if (req.user.cachedGitHub?.commits) {
      return res.json({ data: req.user.cachedGitHub.commits, cached: true, stale: true });
    }
    res.status(502).json({ error: 'Failed to fetch GitHub commits.' });
  }
});

// POST /api/refresh — Force refresh all cached data
router.post('/refresh', auth, async (req, res) => {
  try {
    await req.user.constructor.findByIdAndUpdate(req.user._id, {
      lastFetchedAt: null,
      cachedLeetCode: null,
      cachedGitHub: null,
    });
    res.json({ message: 'Cache cleared. Data will be refreshed on next request.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error clearing cache.' });
  }
});

module.exports = router;
