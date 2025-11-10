// src/pages/AlumniPublicProfile.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // ✅ added useNavigate
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./AlumniProfileView.css";

const AlumniPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ navigation hook
  const { state } = useLocation();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/alumni/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        let data = res.data;

        // ✅ Fix image path
        const apiBase = import.meta.env.VITE_API_BASE_URL || "";
        const apiRoot = apiBase.replace(/\/api\/?$/i, "");
        if (data.profilePicture && !data.profilePicture.startsWith("http")) {
          data.profilePicture = `${apiRoot}/uploads/${data.profilePicture}`;
        } else if (!data.profilePicture) {
          data.profilePicture = "/default-avatar.svg";
        }

        setProfile(data);
      } catch (err) {
        console.error("Error fetching alumni profile:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, [id]);

  if (loading) return <p className="loading">Loading profile...</p>;
  if (!profile) return <p className="loading">Alumni profile not found.</p>;

  // ✅ Navigate to Meeting page with alumni email
  const handleRequestMeeting = () => {
    navigate("/meeting", { state: { alumniEmail: profile.email } });
  };

  return (
    <div className="profile-container">
      <h2>Alumni Profile</h2>

      <div className="profile-picture">
        <img
          src={profile.profilePicture}
          alt="Profile"
          onError={(e) => {
            try {
              e.target.onerror = null;
            } catch (err) {}
            e.target.src = "/default-avatar.svg";
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
      {profile.preferredContact === "Phone" && profile.phone && (
        <p>
          <strong>Phone:</strong> {profile.phone}
        </p>
      )}
      {profile.preferredContact === "LinkedIn" && profile.linkedin && (
        <p>
          <strong>LinkedIn:</strong>{" "}
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            {profile.linkedin}
          </a>
        </p>
      )}
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

      {/* ✅ Request Meeting Button (hidden when opened from admin) */}
      {!state?.fromAdmin && currentUser?.role === "student" && (
        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <button
            onClick={handleRequestMeeting}
            className="request-meeting-btn"
          >
            Request Meeting
          </button>
        </div>
      )}
    </div>
  );
};

export default AlumniPublicProfile;
