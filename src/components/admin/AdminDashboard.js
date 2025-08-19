// src/components/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useWebSocket } from '../../hooks/useWebSocket';
import analytics from '../../services/analytics';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({});
  const { data: realtimeMetrics } = useWebSocket('admin/metrics');

  useEffect(() => {
    // Load comprehensive metrics
    const unsubscribe = onSnapshot(
      query(collection(db, 'admin_metrics')),
      (snapshot) => {
        const data = snapshot.docs.reduce((acc, doc) => {
          return { ...acc, [doc.id]: doc.data() };
        }, {});
        setMetrics(data);
      }
    );

    return unsubscribe;
  }, []);

  const stats = [
    { label: 'Total Users', value: metrics.totalUsers || 0 },
    { label: 'Active Courses', value: metrics.activeCourses || 0 },
    { label: 'Monthly Revenue', value: `$${metrics.monthlyRevenue || 0}` },
    { label: 'Completion Rate', value: `${metrics.completionRate || 0}%` }
  ];

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="stats-grid">
        {stats.map(stat => (
          <div key={stat.label} className="stat-card">
            <h3>{stat.label}</h3>
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>

      {realtimeMetrics && (
        <div className="realtime-metrics">
          <h3>Real-time Metrics</h3>
          <div className="metrics-grid">
            <div>Current Users: {realtimeMetrics.currentUsers}</div>
            <div>Active Sessions: {realtimeMetrics.activeSessions}</div>
            <div>Course Completions Today: {realtimeMetrics.completionsToday}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
