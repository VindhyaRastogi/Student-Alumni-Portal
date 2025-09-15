// src/pages/Meeting.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./Meeting.css";

const Meeting = () => {
  const [meetings, setMeetings] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [alumniEmail, setAlumniEmail] = useState("");

  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType"); // 👈 stored at login (student / alumni)

  const fetchMeetings = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/meetings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeetings(res.data || []);
    } catch (err) {
      console.error("Error fetching meetings:", err);
      setMeetings([]);
    }
  };

  const fetchAvailableSlots = async (email) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/slots?email=${encodeURIComponent(
          email
        )}`
      );
      setAvailableSlots(res.data.slots || []);
      setAlumniEmail(email);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setAvailableSlots([]);
    }
  };

  const scheduleMeeting = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/meetings`,
        { alumniEmail, slot: selectedSlot },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedSlot("");
      setAvailableSlots([]);
      fetchMeetings();
    } catch (err) {
      console.error("Error scheduling meeting:", err);
    }
  };

  const cancelMeeting = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/meetings/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMeetings();
    } catch (err) {
      console.error("Failed to cancel meeting:", err);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <div className="meeting-container">
      <h2>Your Scheduled Meetings</h2>

      <ul className="meeting-list">
        {meetings.length > 0 ? (
          meetings.map((meeting) => (
            <li key={meeting._id} className="meeting-item">
              <span>
                With: <strong>{meeting.alumniName || "Unknown"}</strong> at{" "}
                <strong>{meeting.slot}</strong> - Status:{" "}
                <em>{meeting.status}</em>
              </span>
              {meeting.status === "Scheduled" && (
                <button
                  className="cancel-button"
                  onClick={() => cancelMeeting(meeting._id)}
                >
                  Cancel
                </button>
              )}
            </li>
          ))
        ) : (
          <li>No meetings scheduled yet.</li>
        )}
      </ul>

      {/* 👇 Only show scheduling section for students */}
      {userType === "student" && (
        <div className="schedule-section">
          <h3>Schedule a New Meeting</h3>

          <input
            type="email"
            placeholder="Enter Alumni Email"
            value={alumniEmail}
            onChange={(e) => setAlumniEmail(e.target.value)}
          />
          <button onClick={() => fetchAvailableSlots(alumniEmail)}>
            Check Available Slots
          </button>

          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
          >
            <option value="">Select a Slot</option>
            {availableSlots.map((slot, i) => (
              <option key={i} value={slot}>
                {slot}
              </option>
            ))}
          </select>

          <button
            onClick={scheduleMeeting}
            disabled={!selectedSlot || !alumniEmail}
          >
            Schedule Meeting
          </button>
        </div>
      )}
    </div>
  );
};

export default Meeting;
