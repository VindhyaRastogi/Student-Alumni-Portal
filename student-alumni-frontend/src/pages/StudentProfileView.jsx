// src/pages/StudentProfileView.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import "./Student.css";

const StudentProfileView = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        console.log("🔑 Token:", token);

        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/student/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("✅ Profile data:", res.data);

        const data = res.data;

        // ✅ Fix relative profile picture path
        if (data.profilePicture && !data.profilePicture.startsWith("http")) {
          data.profilePicture = `${import.meta.env.VITE_API_BASE_URL.replace(
            "/api",
            ""
          )}${data.profilePicture}`;
        }

        setProfile(data);
      } catch (err) {
        console.error(
          "Error fetching student profile:",
          err.response?.data || err.message
        );
      }
    };

    fetchProfile();
  }, []);

  if (!profile)
    return (
      <p style={{ textAlign: "center", marginTop: "2rem" }}>
        Loading profile...
      </p>
    );

  return (
    <div className="profile-container">
      <h2 className="profile-title">👨‍🎓 My Profile</h2>

      <div className="profile-picture">
        <img
          src={profile.profilePicture || "/default-avatar.png"}
          alt="Profile"
          style={{ width: "150px", height: "150px", borderRadius: "50%" }}
        />
      </div>

      <div className="profile-info">
        <p>
          <strong>Full Name:</strong> {profile.fullName}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
        <p>
          <strong>Gender:</strong> {profile.gender}
        </p>
        <p>
          <strong>Degree:</strong> {profile.degree}
        </p>
        <p>
          <strong>Specialization:</strong> {profile.specialization}
        </p>
        <p>
          <strong>Batch:</strong> {profile.batch}
        </p>
        <p>
          <strong>LinkedIn:</strong>{" "}
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            {profile.linkedin}
          </a>
        </p>
      </div>

      <div className="button-container" style={{ marginTop: "1.5rem" }}>
        <button onClick={() => navigate("/student/edit-profile")}>
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default StudentProfileView;
