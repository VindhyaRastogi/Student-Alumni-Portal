import '../Dashboard.css';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Welcome, Student!</h1>
      <div className="card-grid">
        <div className="dashboard-card">
          <Link to="/student/alumni-list">Find Mentors</Link>
        </div>
        <div className="dashboard-card">
          <Link to="/student/meetings">Your Meetings</Link>
        </div>
        <div className="dashboard-card">
          <Link to="/student/history">History</Link>
        </div>
        <div className="dashboard-card">
          <Link to="/student/chats">Messages</Link>
        </div>
        <div className="dashboard-card">
          <Link to="/student/profile">Your Profile</Link>
        </div>
        <div className="dashboard-card">
          <Link to="/student/report">Report / Block</Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
