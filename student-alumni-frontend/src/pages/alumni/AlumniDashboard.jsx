import '../Dashboard.css';
import { Link } from 'react-router-dom';

const AlumniDashboard = () => {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Welcome, Alumni!</h1>
      <div className="card-grid">
        <div className="dashboard-card">
          <Link to="/alumni/chats">Chats</Link>
        </div>
        <div className="dashboard-card">
          <Link to="/alumni/meetings">Meetings</Link>
        </div>
        <div className="dashboard-card">
          <Link to="/alumni/history">History</Link>
        </div>
        <div className="dashboard-card">
          <Link to="/alumni/profile">Your Profile</Link>
        </div>
        <div className="dashboard-card">
          <Link to="/alumni/report">Report / Block</Link>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;
