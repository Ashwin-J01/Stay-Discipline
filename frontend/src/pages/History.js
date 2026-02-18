import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { FiCalendar, FiTrendingUp, FiAward, FiTarget } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './History.css';

const History = () => {
  const [history, setHistory] = useState([]);
  const [bestMonth, setBestMonth] = useState(null);
  const [mostConsistentMonth, setMostConsistentMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/analytics/history?months=12');
      setHistory(response.data.history);
      setBestMonth(response.data.bestMonth);
      setMostConsistentMonth(response.data.mostConsistentMonth);
      setError('');
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to load history data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleMonthSelect = (monthData) => {
    setSelectedMonth(selectedMonth?.year === monthData.year && selectedMonth?.month === monthData.month ? null : monthData);
  };

  if (loading) {
    return (
      <div className="app">
        <Navbar />
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const disciplineData = history.map(h => ({
    month: h.monthName.substring(0, 3),
    discipline: h.disciplinePercentage,
    points: h.pointsAchieved
  }));

  return (
    <div className="app">
      <Navbar />
      <div className="history-container">
        <div className="history-header">
          <h1>History & Analytics</h1>
          <p className="history-subtitle">Track your progress over time</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {bestMonth && mostConsistentMonth && (
          <div className="insights-section">
            <div className="insight-card best-month">
              <FiAward className="insight-icon" />
              <div className="insight-content">
                <h3>Best Performance Month</h3>
                <p className="insight-value">{bestMonth.monthName} {bestMonth.year}</p>
                <p className="insight-detail">{bestMonth.disciplinePercentage}% Discipline</p>
              </div>
            </div>
            <div className="insight-card consistent-month">
              <FiTarget className="insight-icon" />
              <div className="insight-content">
                <h3>Most Consistent Month</h3>
                <p className="insight-value">{mostConsistentMonth.monthName} {mostConsistentMonth.year}</p>
                <p className="insight-detail">{mostConsistentMonth.completedDays} Days Completed</p>
              </div>
            </div>
          </div>
        )}

        <div className="charts-section">
          <div className="chart-card">
            <h2>
              <FiTrendingUp className="chart-icon" />
              Discipline Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={disciplineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="discipline" stroke="#818cf8" strokeWidth={2} name="Discipline %" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h2>
              <FiCalendar className="chart-icon" />
              Points Achieved
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={disciplineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="points" fill="#34d399" name="Points" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="history-list">
          <h2>Monthly History</h2>
          <div className="history-grid">
            {history.map((monthData) => (
              <div
                key={`${monthData.year}-${monthData.month}`}
                className={`history-card ${selectedMonth?.year === monthData.year && selectedMonth?.month === monthData.month ? 'selected' : ''}`}
                onClick={() => handleMonthSelect(monthData)}
              >
                <div className="history-card-header">
                  <h3>{monthData.monthName} {monthData.year}</h3>
                  <div className="history-badge" style={{
                    backgroundColor: monthData.disciplinePercentage >= 80 ? 'rgba(52, 211, 153, 0.2)' :
                                     monthData.disciplinePercentage >= 60 ? 'rgba(251, 191, 36, 0.2)' :
                                     'rgba(248, 113, 113, 0.2)'
                  }}>
                    {monthData.disciplinePercentage}%
                  </div>
                </div>
                <div className="history-card-body">
                  <div className="history-stat">
                    <span className="stat-label">Points Achieved</span>
                    <span className="stat-value">{monthData.pointsAchieved} / {monthData.totalPossiblePoints}</span>
                  </div>
                  <div className="history-stat">
                    <span className="stat-label">Days Completed</span>
                    <span className="stat-value">{monthData.completedDays} / {monthData.totalDays}</span>
                  </div>
                  <div className="history-stat">
                    <span className="stat-label">Total Goals</span>
                    <span className="stat-value">{monthData.totalGoals}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedMonth && (
          <div className="selected-month-details">
            <h2>Details for {selectedMonth.monthName} {selectedMonth.year}</h2>
            <div className="details-grid">
              <div className="detail-card">
                <span className="detail-label">Discipline Percentage</span>
                <span className="detail-value">{selectedMonth.disciplinePercentage}%</span>
              </div>
              <div className="detail-card">
                <span className="detail-label">Points Achieved</span>
                <span className="detail-value">{selectedMonth.pointsAchieved}</span>
              </div>
              <div className="detail-card">
                <span className="detail-label">Total Possible Points</span>
                <span className="detail-value">{selectedMonth.totalPossiblePoints}</span>
              </div>
              <div className="detail-card">
                <span className="detail-label">Days Completed</span>
                <span className="detail-value">{selectedMonth.completedDays}</span>
              </div>
              <div className="detail-card">
                <span className="detail-label">Total Days</span>
                <span className="detail-value">{selectedMonth.totalDays}</span>
              </div>
              <div className="detail-card">
                <span className="detail-label">Total Goals</span>
                <span className="detail-value">{selectedMonth.totalGoals}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;

