import "./Dashboard.css";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const adminMenu = [
    {
      title: "Manage Users",
      link: "/admin/users",
      img: "https://cdn-icons-png.flaticon.com/512/1250/1250689.png",
    },
    {
      title: "Review Reports",
      link: "/admin/reports",
      img: "https://cdn-icons-png.flaticon.com/512/2921/2921222.png",
    },
    {
      title: "Meetings Overview",
      link: "/admin/meetings",
      img: "https://cdn-icons-png.flaticon.com/512/3601/3601024.png",
    },
    {
      title: "Analytics / Logs",
      link: "/admin/analytics",
      img: "https://cdn-icons-png.flaticon.com/512/1828/1828919.png",
    },
    {
      title: "Your Profile",
      link: "/admin/view-profile",
      img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">👑 Welcome, Admin!</h1>
      <div className="card-grid">
        {adminMenu.map((item, index) => (
          <Link to={item.link} key={index} className="dashboard-card">
            <img src={item.img} alt={item.title} className="dashboard-icon" />
            <h3>{item.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
