import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { FiCheck, FiX, FiEdit2, FiTrash2, FiPlus, FiSave, FiXCircle } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import './Journal.css';

const Journal = () => {
  const [journal, setJournal] = useState(null);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalPoints, setNewGoalPoints] = useState(1);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editingGoalName, setEditingGoalName] = useState('');
  const [editingGoalPoints, setEditingGoalPoints] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = now.toLocaleString('default', { month: 'long' });

  useEffect(() => {
    fetchJournal();
  }, [year, month]);

  const fetchJournal = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/journal/${year}/${month}`);
      setJournal(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching journal:', error);
      setError('Failed to load journal data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoalName.trim()) return;

    try {
      const response = await axios.post(`/api/journal/${year}/${month}/goal`, {
        goalName: newGoalName.trim(),
        points: newGoalPoints || 1
      });
      setJournal(response.data);
      setNewGoalName('');
      setNewGoalPoints(1);
      setError('');
    } catch (error) {
      console.error('Error adding goal:', error);
      setError('Failed to add goal');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    try {
      const response = await axios.delete(`/api/journal/${year}/${month}/goal/${goalId}`);
      setJournal(response.data);
      setError('');
    } catch (error) {
      console.error('Error deleting goal:', error);
      setError('Failed to delete goal');
    }
  };

  const handleStartEdit = (goalId, currentName, currentPoints) => {
    setEditingGoalId(goalId);
    setEditingGoalName(currentName);
    setEditingGoalPoints(currentPoints || 1);
  };

  const handleCancelEdit = () => {
    setEditingGoalId(null);
    setEditingGoalName('');
    setEditingGoalPoints(1);
  };

  const handleSaveEdit = async (goalId) => {
    if (!editingGoalName.trim()) return;

    try {
      const response = await axios.put(`/api/journal/${year}/${month}/goal/${goalId}`, {
        goalName: editingGoalName.trim(),
        points: editingGoalPoints || 1
      });
      setJournal(response.data);
      setEditingGoalId(null);
      setEditingGoalName('');
      setEditingGoalPoints(1);
      setError('');
    } catch (error) {
      console.error('Error updating goal:', error);
      setError('Failed to update goal');
    }
  };

  const handleToggleDay = async (goalId, day) => {
    try {
      const response = await axios.put(`/api/journal/${year}/${month}/goal/${goalId}/day/${day}`);
      setJournal(response.data);
      setError('');
    } catch (error) {
      console.error('Error toggling day:', error);
      setError('Failed to update day');
    }
  };

  // Calculate total points for a goal
  const calculateGoalPoints = (goal) => {
    const completedDays = goal.days.filter(day => day).length;
    return completedDays * (goal.points || 1);
  };

  if (loading) {
    return (
      <div className="app">
        <Navbar />
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar />
      <div className="journal-container">
        <div className="journal-header">
          <h1>Goal - {monthName} {year}</h1>
          <p className="journal-subtitle">Track your daily goals for this month</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="add-goal-section">
          <form onSubmit={handleAddGoal} className="add-goal-form">
            <div className="input-wrapper">
              <FiPlus className="input-icon" />
              <input
                type="text"
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                placeholder="Enter goal name..."
                className="goal-input"
              />
            </div>
            <div className="points-input-wrapper">
              <input
                type="number"
                value={newGoalPoints}
                onChange={(e) => setNewGoalPoints(parseInt(e.target.value) || 1)}
                min="1"
                placeholder="Points"
                className="points-input"
              />
            </div>
            <button type="submit" className="add-goal-btn">
              <FiPlus />
              <span>Add Goal</span>
            </button>
          </form>
        </div>

        {journal && journal.goals.length === 0 ? (
          <div className="empty-state">
            <p>No goals yet. Add your first goal to get started!</p>
          </div>
        ) : (
          <div className="journal-grid-container">
            <div className="journal-table-wrapper">
              <table className="journal-table">
                <thead>
                  <tr>
                    <th className="goal-header">Goal</th>
                    <th className="points-header">Points</th>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <th key={i + 1} className="day-header">
                        {i + 1}
                      </th>
                    ))}
                    <th className="actions-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {journal?.goals.map((goal) => (
                    <tr key={goal._id}>
                      <td className="goal-cell">
                        {editingGoalId === goal._id ? (
                          <div className="edit-goal-form">
                            <input
                              type="text"
                              value={editingGoalName}
                              onChange={(e) => setEditingGoalName(e.target.value)}
                              className="edit-goal-input"
                              autoFocus
                            />
                            <input
                              type="number"
                              value={editingGoalPoints}
                              onChange={(e) => setEditingGoalPoints(parseInt(e.target.value) || 1)}
                              min="1"
                              className="edit-points-input"
                              placeholder="Points"
                            />
                            <div className="edit-actions">
                              <button
                                onClick={() => handleSaveEdit(goal._id)}
                                className="save-btn"
                                title="Save"
                              >
                                <FiSave />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="cancel-btn"
                                title="Cancel"
                              >
                                <FiXCircle />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="goal-name">{goal.goalName}</span>
                        )}
                      </td>
                      <td className="points-cell">
                        <span className="points-value">{goal.points || 1}</span>
                        <span className="points-earned">({calculateGoalPoints(goal)} earned)</span>
                      </td>
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const isCompleted = goal.days[i] || false;
                        return (
                          <td key={i + 1} className="day-cell">
                            <button
                              onClick={() => handleToggleDay(goal._id, day)}
                              className={`day-toggle ${isCompleted ? 'completed' : 'pending'}`}
                              title={`Day ${day} - ${isCompleted ? 'Completed' : 'Not done'}`}
                            >
                              {isCompleted ? <FiCheck /> : <FiX />}
                            </button>
                          </td>
                        );
                      })}
                      <td className="actions-cell">
                        {editingGoalId !== goal._id && (
                          <>
                            <button
                              onClick={() => handleStartEdit(goal._id, goal.goalName, goal.points)}
                              className="edit-btn"
                              title="Edit goal"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDeleteGoal(goal._id)}
                              className="delete-btn"
                              title="Delete goal"
                            >
                              <FiTrash2 />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
