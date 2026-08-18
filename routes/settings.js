const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/settings — Get user settings
router.get('/', auth, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      dailyTarget: user.dailyTarget,
      startDate: user.startDate,
      targetDate: user.targetDate,
      totalSheetProblems: user.totalSheetProblems,
      manualSolvedCount: user.manualSolvedCount,
      leetcodeUsername: user.leetcodeUsername,
      githubUsername: user.githubUsername,
      githubStriverRepo: user.githubStriverRepo,
      githubLeetcodeRepo: user.githubLeetcodeRepo,
      onboardingComplete: user.onboardingComplete,
      striverBreakdown: user.striverBreakdown || {},
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/settings — Update settings
router.put('/', auth, async (req, res) => {
  try {
    const allowedFields = [
      'dailyTarget', 'startDate', 'targetDate', 'totalSheetProblems',
      'manualSolvedCount', 'leetcodeUsername', 'githubUsername',
      'githubStriverRepo', 'githubLeetcodeRepo', 'name', 'striverBreakdown'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await req.user.constructor.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Server error updating settings.' });
  }
});

// POST /api/settings/onboarding — Complete onboarding
router.post('/onboarding', auth, async (req, res) => {
  try {
    const {
      leetcodeUsername, githubUsername, githubStriverRepo, githubLeetcodeRepo,
      dailyTarget, startDate, targetDate, totalSheetProblems, manualSolvedCount,
    } = req.body;

    const updates = {
      onboardingComplete: true,
    };

    if (leetcodeUsername !== undefined) updates.leetcodeUsername = leetcodeUsername;
    if (githubUsername !== undefined) updates.githubUsername = githubUsername;
    if (githubStriverRepo !== undefined) updates.githubStriverRepo = githubStriverRepo;
    if (githubLeetcodeRepo !== undefined) updates.githubLeetcodeRepo = githubLeetcodeRepo;
    if (dailyTarget !== undefined) updates.dailyTarget = dailyTarget;
    if (startDate !== undefined) updates.startDate = startDate;
    if (targetDate !== undefined) updates.targetDate = targetDate;
    if (totalSheetProblems !== undefined) updates.totalSheetProblems = totalSheetProblems;
    if (manualSolvedCount !== undefined) updates.manualSolvedCount = manualSolvedCount;

    const user = await req.user.constructor.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Server error completing onboarding.' });
  }
});

module.exports = router;
