// src/pages/AlumniPublicProfile.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";   // ✅ added useNavigate
import axios from "axios";
import "./AlumniProfileView.css";

const AlumniPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();  // ✅ navigation hook
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
        if (data.profilePicture && !data.profilePicture.startsWith("http")) {
          data.profilePicture = `${import.meta.env.VITE_API_BASE_URL}/uploads/${data.profilePicture}`;
        } else if (!data.profilePicture) {
          data.profilePicture = "/default-avatar.png";
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
          onError={(e) => (e.target.src = "/default-avatar.png")}
        />
      </div>

      <p><strong>Full Name:</strong> {profile.fullName}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Gender:</strong> {profile.gender}</p>

      <h3>Academic Qualifications</h3>
      {profile.degrees?.map((deg, idx) => (
        <div key={idx} className="degree-block">
          <p><strong>Degree:</strong> {deg.degree}</p>
          <p><strong>Specialization:</strong> {deg.specialization}</p>
          <p><strong>Institute:</strong> {deg.institute}</p>
          <p><strong>Batch:</strong> {deg.batch}</p>
        </div>
      ))}

      <p><strong>Areas of Interest:</strong> {profile.areasOfInterest}</p>
      <p><strong>Hours per Week:</strong> {profile.hoursPerWeek}</p>
      <p><strong>Mentees Capacity:</strong> {profile.menteesCapacity}</p>
      <p><strong>Preferred Contact:</strong> {profile.preferredContact}</p>
      <p><strong>Job Title:</strong> {profile.jobTitle}</p>
      <p><strong>Company:</strong> {profile.company}</p>
      <p>
        <strong>Location:</strong>{" "}
        {profile.location?.city}, {profile.location?.state}, {profile.location?.country}
      </p>

      {/* ✅ Request Meeting Button */}
      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <button
          onClick={handleRequestMeeting}
          className="request-meeting-btn"
        >
          Request Meeting
        </button>
      </div>
    </div>
  );
};

export default AlumniPublicProfile;
