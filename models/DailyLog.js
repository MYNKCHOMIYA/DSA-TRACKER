const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true, // Format: 'YYYY-MM-DD'
  },
  questionsDone: {
    type: Number,
    default: 0,
  },
  targetForDay: {
    type: Number,
    default: 5,
  },
  notes: {
    type: String,
    default: '',
  },
  topics: [{
    type: String,
  }],
}, {
  timestamps: true,
});

// Compound unique index: one log per user per day
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
