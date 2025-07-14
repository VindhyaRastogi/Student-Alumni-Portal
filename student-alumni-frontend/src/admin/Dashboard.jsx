import { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    blockedUsers: 0
  });

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="stat-cards">
        <div className="stat-card">👥 Total Users: {stats.totalUsers}</div>
        <div className="stat-card">📝 Total Reports: {stats.totalReports}</div>
        <div className="stat-card">🚫 Blocked Users: {stats.blockedUsers}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
