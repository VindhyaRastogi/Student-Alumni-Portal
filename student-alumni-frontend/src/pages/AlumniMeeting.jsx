// src/pages/AlumniMeeting.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const AlumniMeeting = () => {
  const [meetings, setMeetings] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch meetings scheduled with this alumni
  const fetchMeetings = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/meetings/alumni`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeetings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching meetings:", err);
      setMeetings([]);
    }
  };

  // Confirm meeting
  const confirmMeeting = async (meetingId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/meetings/${meetingId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMeetings();
    } catch (err) {
      console.error("Error confirming meeting:", err);
    }
  };

  // Cancel meeting
  const cancelMeeting = async (meetingId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/meetings/${meetingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMeetings();
    } catch (err) {
      console.error("Error cancelling meeting:", err);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <div className="meeting-container">
      <h2>Meeting Requests from Students</h2>
      <ul className="meeting-list">
        {meetings.length > 0 ? (
          meetings.map((meeting) => (
            <li key={meeting._id} className="meeting-item">
              <span>
                Student: <strong>{meeting.studentName || "Unknown"}</strong> <br />
                Scheduled Slot: <strong>{meeting.slot}</strong> <br />
                Status: <em>{meeting.status}</em>
              </span>
              <div className="meeting-actions">
                {meeting.status === "Scheduled" && (
                  <>
                    <button onClick={() => confirmMeeting(meeting._id)}>
                      Confirm
                    </button>
                    <button onClick={() => cancelMeeting(meeting._id)}>
                      Cancel
                    </button>
                  </>
                )}
                {meeting.status === "Confirmed" && (
                  <button onClick={() => cancelMeeting(meeting._id)}>
                    Cancel
                  </button>
                )}
              </div>
            </li>
          ))
        ) : (
          <li>No meeting requests yet.</li>
        )}
      </ul>
    </div>
  );
};

export default AlumniMeeting;
