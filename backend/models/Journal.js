const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  goals: [{
    goalName: {
      type: String,
      required: true,
      trim: true
    },
    points: {
      type: Number,
      default: 1,
      min: 1
    },
    days: [{
      type: Boolean,
      default: false
    }]
  }]
}, {
  timestamps: true
});

// Compound index to ensure one journal per user per month/year
journalSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Journal', journalSchema);

