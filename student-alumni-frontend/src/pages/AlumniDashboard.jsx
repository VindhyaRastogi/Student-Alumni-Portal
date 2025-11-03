import "./Dashboard.css";
import { Link } from "react-router-dom";

const AlumniDashboard = () => {
  const alumniMenu = [
    {
      title: "Chats",
      link: "/alumni/chats",
      img: "https://cdn-icons-png.flaticon.com/512/2950/2950611.png",
    },
    {
      title: "Meetings",
      link: "/alumni/meetings",
      img: "https://cdn-icons-png.flaticon.com/512/3094/3094853.png",
    },
    {
      title: "My Availability",
      link: "/alumni/slots",
      img: "https://cdn-icons-png.flaticon.com/512/123/123627.png",
    },
    {
      title: "History",
      link: "/alumni/history",
      img: "https://cdn-icons-png.flaticon.com/512/942/942748.png",
    },
    {
      title: "Your Profile",
      link: "/alumni/view-profile",
      img: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png",
    },
    {
      title: "Report / Block",
      link: "/alumni/report",
      img: "https://cdn-icons-png.flaticon.com/512/484/484662.png",
    },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">🏆 Welcome, Alumni!</h1>
      <div className="card-grid">
        {alumniMenu.map((item, index) => (
          <Link to={item.link} key={index} className="dashboard-card">
            <img src={item.img} alt={item.title} className="dashboard-icon" />
            <h3>{item.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AlumniDashboard;
