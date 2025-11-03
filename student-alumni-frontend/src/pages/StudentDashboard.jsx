import "./Dashboard.css";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const studentMenu = [
    {
      title: "Find Mentors",
      link: "/student/alumni",
      img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    },
    {
      title: "Your Meetings",
      link: "/student/meetings",
      img: "https://cdn-icons-png.flaticon.com/512/3094/3094853.png",
    },
    // {
    //   title: "History",
    //   link: "/student/history",
    //   img: "https://cdn-icons-png.flaticon.com/512/942/942748.png",
    // },
    {
      title: "Messages",
      link: "/student/chats",
      img: "https://cdn-icons-png.flaticon.com/512/2950/2950611.png",
    },
    {
      title: "Your Profile",
      link: "/student/profile",
      img: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png",
    },
    // {
    //   title: "Report / Block",
    //   link: "/student/report",
    //   img: "https://cdn-icons-png.flaticon.com/512/484/484662.png",
    // },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">🎓 Welcome, Student!</h1>
      <div className="card-grid">
        {studentMenu.map((item, index) => (
          <Link to={item.link} key={index} className="dashboard-card">
            <img src={item.img} alt={item.title} className="dashboard-icon" />
            <h3>{item.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
