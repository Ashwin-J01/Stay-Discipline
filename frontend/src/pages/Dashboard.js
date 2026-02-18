import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  FiCalendar,
  FiClock,
  FiTarget,
  FiBarChart2,
  FiCheckCircle,
  FiTrendingUp,
  FiAward
} from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedDays: 0,
    pendingDays: 0,
    totalDays: 0,
    remainingDays: 0,
    totalPossiblePoints: 0,
    pointsAchieved: 0,
    disciplinePercentage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const [journalResponse, analyticsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/journal/${year}/${month}`),
        axios.get(`${API_URL}/api/analytics/journal/${year}/${month}`)
      ]);

      const journal = journalResponse.data;
      const analytics = analyticsResponse.data;

      const daysInMonth = new Date(year, month, 0).getDate();
      const today = now.getDate();
      const remainingDays = daysInMonth - today;

      let completedDays = 0;
      let pendingDays = 0;

      journal.goals.forEach(goal => {
        goal.days.forEach((day, index) => {
          if (index < today) {
            day ? completedDays++ : pendingDays++;
          }
        });
      });

      setStats({
        totalGoals: journal.goals.length,
        completedDays,
        pendingDays,
        totalDays: daysInMonth,
        remainingDays,
        totalPossiblePoints: analytics.totalPossiblePoints,
        pointsAchieved: analytics.pointsAchieved,
        disciplinePercentage: analytics.disciplinePercentage
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const monthName = new Date().toLocaleString('default', { month: 'long' });
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const chartData = [
    { name: 'Completed', value: stats.completedDays, color: '#4caf50' },
    { name: 'Pending', value: stats.pendingDays, color: '#ff9800' }
  ];

  if (loading) {
    return (
      <div className="app">
        <Navbar />
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-top-section">

          {/* ===== STATS GRID (2 x 3) ===== */}
          <div className="stats-grid">
            <Stat icon={<FiCalendar />} title="Current Month" value={monthName} />
            <Stat icon={<FiClock />} title="Today's Date" value={today} small />
            <Stat icon={<FiTarget />} title="Total Goals" value={stats.totalGoals} />
            <Stat icon={<FiBarChart2 />} title="Days in Month" value={stats.totalDays} />
            <Stat icon={<FiTrendingUp />} title="Remaining Days" value={stats.remainingDays} />
            <Stat icon={<FiCheckCircle />} title="Completed Days" value={stats.completedDays} />
          </div>

          {/* ===== PIE CHART ===== */}
          <div className="chart-card chart-top-right">
            <h2>Progress Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {chartData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* ===== POINTS SUMMARY ===== */}
        <div className="points-summary">
          <div className="points-card">
            <div className="points-header">
              <FiAward className="points-icon" />
              <h2>Monthly Score Summary</h2>
            </div>

            <div className="points-grid">
              <Point label="Total Possible Points" value={stats.totalPossiblePoints} />
              <Point label="Points Achieved" value={stats.pointsAchieved} highlight />
              <Point label="Discipline Percentage" value={`${stats.disciplinePercentage}%`} success />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const Stat = ({ icon, title, value, small }) => (
  <div className="stat-card">
    <div className="stat-icon-wrapper">{icon}</div>
    <div className="stat-content">
      <h3>{title}</h3>
      <p className={small ? 'stat-value-small' : 'stat-value'}>{value}</p>
    </div>
  </div>
);

const Point = ({ label, value, highlight, success }) => (
  <div className={`points-item ${success ? 'points-discipline' : ''}`}>
    <span className="points-label">{label}</span>
    <span className={`points-value ${highlight ? 'points-achieved' : ''}`}>
      {value}
    </span>
  </div>
);

export default Dashboard;
