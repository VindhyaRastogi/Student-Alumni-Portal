// src/pages/RequestMeeting.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const RequestMeeting = () => {
  const { alumniId } = useParams(); // alumni id from URL
  const navigate = useNavigate();

  const [alumni, setAlumni] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user")); // logged-in student
  const token = localStorage.getItem("token"); // ✅ get JWT token

  useEffect(() => {
    const fetchAlumniData = async () => {
      try {
        // Fetch alumni profile (protected route, needs token)
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/alumni/${alumniId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ add token
            },
          }
        );
        setAlumni(res.data);

        // Fetch alumni slots
        const slotRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/slots/${alumniId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ add token
            },
          }
        );
        setSlots(slotRes.data.slots || []);
      } catch (error) {
        console.error("Error fetching alumni data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumniData();
  }, [alumniId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return alert("Please select a slot!");

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/meetings/request`,
        {
          studentId: user?._id,
          alumniId,
          slot: selectedSlot,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ add token
          },
        }
      );

      alert("✅ Meeting request sent successfully!");
      navigate("/student/meetings");
    } catch (error) {
      console.error("Error requesting meeting:", error);
      alert("❌ Failed to send request. Try again!");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!alumni) return <p>Alumni not found</p>;

  return (
    <div className="request-meeting-container">
      <h2>Request Meeting with {alumni.fullName}</h2>

      <div className="alumni-info">
        <p><strong>Email:</strong> {alumni.email}</p>
        <p><strong>Area of Interest:</strong> {alumni.areaOfInterest || "N/A"}</p>
      </div>

      <form onSubmit={handleSubmit} className="meeting-form">
        <label htmlFor="slot">Select Available Slot:</label>
        <select
          id="slot"
          value={selectedSlot}
          onChange={(e) => setSelectedSlot(e.target.value)}
        >
          <option value="">-- Select --</option>
          {slots.map((slot, index) => (
            <option key={index} value={slot}>
              {slot}
            </option>
          ))}
        </select>

        <button type="submit" className="btn-confirm">
          Confirm Request
        </button>
      </form>
    </div>
  );
};

export default RequestMeeting;
