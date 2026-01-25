const express = require('express');
const Journal = require('../models/Journal');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper function to get days in month
const getDaysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
};

// @route   GET /api/analytics/journal/:year/:month
// @desc    Get journal analytics for a specific month
// @access  Private
router.get('/journal/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const userId = req.user._id;

    const journal = await Journal.findOne({ userId, year: parseInt(year), month: parseInt(month) });

    if (!journal) {
      return res.json({
        totalPossiblePoints: 0,
        pointsAchieved: 0,
        disciplinePercentage: 0,
        completedDays: 0,
        totalDays: getDaysInMonth(parseInt(month), parseInt(year))
      });
    }

    const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
    const today = new Date();
    const currentDay = today.getDate();
    const isCurrentMonth = today.getFullYear() === parseInt(year) && today.getMonth() + 1 === parseInt(month);
    const daysToCount = isCurrentMonth ? currentDay : daysInMonth;

    let totalPossiblePoints = 0;
    let pointsAchieved = 0;
    let completedDays = 0;

    journal.goals.forEach(goal => {
      const goalPoints = goal.points || 1;
      totalPossiblePoints += goalPoints * daysToCount;
      
      goal.days.forEach((day, index) => {
        if (index < daysToCount) {
          if (day) {
            pointsAchieved += goalPoints;
            completedDays++;
          }
        }
      });
    });

    const disciplinePercentage = totalPossiblePoints > 0 
      ? Math.round((pointsAchieved / totalPossiblePoints) * 100) 
      : 0;

    res.json({
      totalPossiblePoints,
      pointsAchieved,
      disciplinePercentage,
      completedDays,
      totalDays: daysToCount,
      totalGoals: journal.goals.length
    });
  } catch (error) {
    console.error('Get journal analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/analytics/history
// @desc    Get historical data for multiple months
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { months = 6 } = req.query; // Default to last 6 months

    const today = new Date();
    const results = [];

    for (let i = 0; i < parseInt(months); i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleString('default', { month: 'long' });

      const journal = await Journal.findOne({ userId, year, month });

      const daysInMonth = getDaysInMonth(month, year);
      let totalPossiblePoints = 0;
      let pointsAchieved = 0;
      let completedDays = 0;

      if (journal) {
        journal.goals.forEach(goal => {
          const goalPoints = goal.points || 1;
          totalPossiblePoints += goalPoints * daysInMonth;
          
          goal.days.forEach(day => {
            if (day) {
              pointsAchieved += goalPoints;
              completedDays++;
            }
          });
        });
      }

      const disciplinePercentage = totalPossiblePoints > 0 
        ? Math.round((pointsAchieved / totalPossiblePoints) * 100) 
        : 0;

      results.push({
        year,
        month,
        monthName,
        totalPossiblePoints,
        pointsAchieved,
        disciplinePercentage,
        completedDays,
        totalDays: daysInMonth,
        totalGoals: journal?.goals.length || 0
      });
    }

    // Find best month
    const bestMonth = results.reduce((best, current) => 
      current.disciplinePercentage > (best?.disciplinePercentage || 0) ? current : best,
      null
    );

    // Find most consistent month (highest completed days)
    const mostConsistentMonth = results.reduce((best, current) => 
      current.completedDays > (best?.completedDays || 0) ? current : best,
      null
    );

    res.json({
      history: results.reverse(), // Reverse to show oldest first
      bestMonth,
      mostConsistentMonth
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

