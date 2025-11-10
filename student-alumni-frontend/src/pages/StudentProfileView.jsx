import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./StudentProfile.css";

const StudentProfileView = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If we received an updated profile via navigation state from the edit page,
    // prefer that (so user sees changes immediately) and clear the state.
    if (location && location.state && location.state.updatedProfile) {
      setProfile(location.state.updatedProfile);
      // clear state to avoid reusing it on refresh/navigation
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/student/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // ✅ Extract correct data from response
        const data = res.data.user || res.data;

        // ✅ Fix image path if it's stored as relative URL
        if (data.profilePicture && !data.profilePicture.startsWith("http")) {
          data.profilePicture = `${import.meta.env.VITE_API_BASE_URL.replace(
            "/api",
            ""
          )}${data.profilePicture}`;
        }

        setProfile(data);
      } catch (err) {
        console.error("Error fetching student profile:", err);
      }
    };

    fetchProfile();
  }, [location, navigate]);

  if (!profile)
    return (
      <p style={{ textAlign: "center", marginTop: "2rem" }}>
        Loading profile...
      </p>
    );

  return (
    <div className="student-profile-container">
      <h2>👨‍🎓 My Profile</h2>

      <div className="profile-pic-section">
        <img
          src={profile.profilePicture || "/default-avatar.svg"}
          alt="Profile"
          className="profile-pic-preview"
        />
      </div>

      <div className="profile-details">
        <p>
          <strong>Full Name:</strong> {profile.name || profile.fullName}
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
          <strong>Area of Interest:</strong> {profile.areaOfInterest}
        </p>
        <p>
          <strong>LinkedIn:</strong>{" "}
          {profile.linkedin ? (
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              {profile.linkedin}
            </a>
          ) : (
            "Not added"
          )}
        </p>
      </div>

      <div className="button-container" style={{ marginTop: "1.5rem" }}>
        <button onClick={() => navigate("/student/edit-profile")}>
          ✏️ Edit Profile
        </button>
      </div>
    </div>
  );
};

export default StudentProfileView;
