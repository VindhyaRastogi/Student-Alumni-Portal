// src/pages/AlumniProfileView.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AlumniProfileView.css";

const AlumniProfileView = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/alumni/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        let updatedProfile = res.data;

        // ✅ Fix image path (prepend /uploads if only filename is given)
        if (updatedProfile.profilePicture) {
          const pic = updatedProfile.profilePicture;
          if (!pic.startsWith("http")) {
            updatedProfile.profilePicture = `${
              import.meta.env.VITE_API_BASE_URL
            }/uploads/${pic}`;
          }
        } else {
          updatedProfile.profilePicture = "/default-avatar.png";
        }

        setProfile(updatedProfile);
      } catch (err) {
        console.error(
          "Error fetching profile:",
          err.response?.data || err.message
        );
      }
    };

    fetchProfile();
  }, []);

  if (!profile) return <p className="loading">Loading profile...</p>;

  return (
    <div className="profile-container">
      <h2>My Alumni Profile</h2>

      <div className="profile-picture">
        <img
          src={profile.profilePicture}
          alt="Profile"
          onError={(e) => {
            e.target.src = "/default-avatar.png"; // fallback if broken
          }}
        />
      </div>

      <p>
        <strong>Full Name:</strong> {profile.fullName}
      </p>
      <p>
        <strong>Email:</strong> {profile.email}
      </p>
      <p>
        <strong>Gender:</strong> {profile.gender}
      </p>

      <h3>Academic Qualifications</h3>
      {profile.degrees?.map((deg, idx) => (
        <div key={idx} className="degree-block">
          <p>
            <strong>Degree:</strong> {deg.degree}
          </p>
          <p>
            <strong>Specialization:</strong> {deg.specialization}
          </p>
          <p>
            <strong>Institute:</strong> {deg.institute}
          </p>
          <p>
            <strong>Batch:</strong> {deg.batch}
          </p>
        </div>
      ))}

      <p>
        <strong>Areas of Interest:</strong> {profile.areasOfInterest}
      </p>
      <p>
        <strong>Hours per Week:</strong> {profile.hoursPerWeek}
      </p>
      <p>
        <strong>Mentees Capacity:</strong> {profile.menteesCapacity}
      </p>
      <p>
        <strong>Preferred Contact:</strong> {profile.preferredContact}
      </p>
      <p>
        <strong>Job Title:</strong> {profile.jobTitle}
      </p>
      <p>
        <strong>Company:</strong> {profile.company}
      </p>
      <p>
        <strong>Location:</strong> {profile.location?.city},{" "}
        {profile.location?.state}, {profile.location?.country}
      </p>

      <div className="button-container">
        <button onClick={() => navigate("/alumni/edit-profile")}>
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default AlumniProfileView;
