// src/pages/AlumniProfileView.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AlumniProfileView.css";

const AlumniProfileView = () => {
  const [profile, setProfile] = useState(null);
  const { state } = useLocation();
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

        // compute API root (strip trailing /api if present)
  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
  const apiRoot = apiBase.replace(/\/api\/?$/i, "");
        if (updatedProfile.profilePicture) {
          const pic = updatedProfile.profilePicture;
          if (!pic.startsWith("http")) {
            updatedProfile.profilePicture = `${apiRoot}/uploads/${pic}`;
          }
        } else {
          updatedProfile.profilePicture = "/default-avatar.png";
        }

        // If fullName missing on alumni doc, fall back to user stored in localStorage
        if (!updatedProfile.fullName) {
          const stored = localStorage.getItem("user");
          if (stored) {
            const storedUser = JSON.parse(stored);
            if (storedUser && storedUser.fullName) {
              updatedProfile.fullName = storedUser.fullName;
            }
          }
        }

        setProfile(updatedProfile);
      } catch (err) {
        console.error(
          "Error fetching profile:",
          err.response?.data || err.message
        );
      }
    };

    // If profile was passed via navigation state (immediately after save), use it
    if (state && state.profile) {
      // compute image path and fallback fullName similar to fetch path
      let updatedProfile = state.profile;
      const apiBase = import.meta.env.VITE_API_BASE_URL || "";
      const apiRoot = apiBase.replace(/\/api\/?$/i, "");
      if (updatedProfile.profilePicture && !updatedProfile.profilePicture.startsWith("http")) {
        updatedProfile.profilePicture = `${apiRoot}/uploads/${updatedProfile.profilePicture}`;
      } else if (!updatedProfile.profilePicture) {
        updatedProfile.profilePicture = "/default-avatar.png";
      }
      if (!updatedProfile.fullName) {
        const stored = localStorage.getItem("user");
        if (stored) {
          const storedUser = JSON.parse(stored);
          if (storedUser && storedUser.fullName) updatedProfile.fullName = storedUser.fullName;
        }
      }
      setProfile(updatedProfile);
    } else {
      fetchProfile();
    }
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
            // avoid infinite onError loops
            try {
              e.target.onerror = null;
            } catch (err) {}
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
      {profile.preferredContact === "Phone" && profile.phone && (
        <p><strong>Phone:</strong> {profile.phone}</p>
      )}
      {profile.preferredContact === "LinkedIn" && profile.linkedin && (
        <p><strong>LinkedIn:</strong> <a href={profile.linkedin} target="_blank" rel="noreferrer">{profile.linkedin}</a></p>
      )}
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
