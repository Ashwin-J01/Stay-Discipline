const express = require('express');
const Journal = require('../models/Journal');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper function to get days in month
const getDaysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
};

// Helper function to initialize days array
const initializeDaysArray = (daysInMonth) => {
  return new Array(daysInMonth).fill(false);
};

// @route   GET /api/journal/:year/:month
// @desc    Get journal for specific month
// @access  Private
router.get('/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const userId = req.user._id;

    let journal = await Journal.findOne({ userId, year: parseInt(year), month: parseInt(month) });

    if (!journal) {
      // Create new journal for this month
      const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
      journal = new Journal({
        userId,
        year: parseInt(year),
        month: parseInt(month),
        goals: []
      });
      await journal.save();
    } else {
      // Ensure all goals have correct number of days
      const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
      journal.goals = journal.goals.map(goal => {
        if (goal.days.length !== daysInMonth) {
          // Adjust days array to match current month
          const newDays = [...goal.days];
          while (newDays.length < daysInMonth) {
            newDays.push(false);
          }
          while (newDays.length > daysInMonth) {
            newDays.pop();
          }
          goal.days = newDays;
        }
        return goal;
      });
      await journal.save();
    }

    res.json(journal);
  } catch (error) {
    console.error('Get journal error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/journal/:year/:month/goal
// @desc    Add a new goal
// @access  Private
router.post('/:year/:month/goal', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const { goalName, points } = req.body;
    const userId = req.user._id;

    if (!goalName || goalName.trim() === '') {
      return res.status(400).json({ message: 'Goal name is required' });
    }

    const goalPoints = points && points > 0 ? parseInt(points) : 1;

    let journal = await Journal.findOne({ userId, year: parseInt(year), month: parseInt(month) });

    if (!journal) {
      const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
      journal = new Journal({
        userId,
        year: parseInt(year),
        month: parseInt(month),
        goals: []
      });
    }

    const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
    journal.goals.push({
      goalName: goalName.trim(),
      points: goalPoints,
      days: initializeDaysArray(daysInMonth)
    });

    await journal.save();
    res.json(journal);
  } catch (error) {
    console.error('Add goal error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/journal/:year/:month/goal/:goalId
// @desc    Update goal name and/or points
// @access  Private
router.put('/:year/:month/goal/:goalId', auth, async (req, res) => {
  try {
    const { year, month, goalId } = req.params;
    const { goalName, points } = req.body;
    const userId = req.user._id;

    const journal = await Journal.findOne({ userId, year: parseInt(year), month: parseInt(month) });

    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    const goal = journal.goals.id(goalId);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goalName !== undefined && goalName.trim() !== '') {
      goal.goalName = goalName.trim();
    }

    if (points !== undefined && points > 0) {
      goal.points = parseInt(points);
    }

    await journal.save();

    res.json(journal);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/journal/:year/:month/goal/:goalId
// @desc    Delete a goal
// @access  Private
router.delete('/:year/:month/goal/:goalId', auth, async (req, res) => {
  try {
    const { year, month, goalId } = req.params;
    const userId = req.user._id;

    const journal = await Journal.findOne({ userId, year: parseInt(year), month: parseInt(month) });

    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    journal.goals.id(goalId).remove();
    await journal.save();

    res.json(journal);
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/journal/:year/:month/goal/:goalId/day/:day
// @desc    Toggle day completion
// @access  Private
router.put('/:year/:month/goal/:goalId/day/:day', auth, async (req, res) => {
  try {
    const { year, month, goalId, day } = req.params;
    const userId = req.user._id;
    const dayIndex = parseInt(day) - 1; // Convert to 0-based index

    const journal = await Journal.findOne({ userId, year: parseInt(year), month: parseInt(month) });

    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    const goal = journal.goals.id(goalId);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const daysInMonth = getDaysInMonth(parseInt(month), parseInt(year));
    if (dayIndex < 0 || dayIndex >= daysInMonth) {
      return res.status(400).json({ message: 'Invalid day' });
    }

    // Ensure days array has correct length
    if (goal.days.length !== daysInMonth) {
      const newDays = [...goal.days];
      while (newDays.length < daysInMonth) {
        newDays.push(false);
      }
      while (newDays.length > daysInMonth) {
        newDays.pop();
      }
      goal.days = newDays;
    }

    // Toggle the day
    goal.days[dayIndex] = !goal.days[dayIndex];
    await journal.save();

    res.json(journal);
  } catch (error) {
    console.error('Toggle day error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

