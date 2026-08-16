const express = require('express');
const auth = require('../middleware/auth');
const DailyLog = require('../models/DailyLog');

const router = express.Router();

// GET /api/logs — Get all logs (with optional date range)
router.get('/', auth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = { userId: req.user._id };

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }

    const logs = await DailyLog.find(filter).sort({ date: -1 }).limit(365);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching logs.' });
  }
});

// GET /api/logs/today — Get today's log
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let log = await DailyLog.findOne({ userId: req.user._id, date: today });

    if (!log) {
      log = { date: today, questionsDone: 0, targetForDay: req.user.dailyTarget, notes: '', topics: [] };
    }

    res.json({ log });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching today\'s log.' });
  }
});

// POST /api/logs — Create or update a daily log
router.post('/', auth, async (req, res) => {
  try {
    const { date, questionsDone, notes, topics } = req.body;
    const logDate = date || new Date().toISOString().split('T')[0];

    let log = await DailyLog.findOne({ userId: req.user._id, date: logDate });

    if (log) {
      // Update existing
      if (questionsDone !== undefined) log.questionsDone = questionsDone;
      if (notes !== undefined) log.notes = notes;
      if (topics !== undefined) log.topics = topics;
      log.targetForDay = req.user.dailyTarget;
      await log.save();
    } else {
      // Create new
      log = new DailyLog({
        userId: req.user._id,
        date: logDate,
        questionsDone: questionsDone || 0,
        targetForDay: req.user.dailyTarget,
        notes: notes || '',
        topics: topics || [],
      });
      await log.save();
    }

    res.json({ log });
  } catch (error) {
    console.error('Log save error:', error);
    res.status(500).json({ error: 'Server error saving log.' });
  }
});

// GET /api/logs/stats — Aggregated statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const logs = await DailyLog.find({ userId: req.user._id });

    const totalDays = logs.length;
    const totalQuestions = logs.reduce((sum, l) => sum + l.questionsDone, 0);
    const avgPerDay = totalDays > 0 ? (totalQuestions / totalDays).toFixed(1) : 0;
    const bestDay = logs.reduce((max, l) => l.questionsDone > max.count
      ? { date: l.date, count: l.questionsDone }
      : max, { date: '', count: 0 });
    const targetMetDays = logs.filter(l => l.questionsDone >= l.targetForDay).length;

    // Calculate streak
    let streak = 0;
    const sortedLogs = logs.sort((a, b) => b.date.localeCompare(a.date));
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayLog = sortedLogs.find(l => l.date === dateStr);
      if (dayLog && dayLog.questionsDone > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today might not have a log yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }

    res.json({
      stats: {
        totalDays,
        totalQuestions,
        avgPerDay: parseFloat(avgPerDay),
        bestDay,
        targetMetDays,
        targetMetRate: totalDays > 0 ? Math.round((targetMetDays / totalDays) * 100) : 0,
        streak,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error calculating stats.' });
  }
});

module.exports = router;
