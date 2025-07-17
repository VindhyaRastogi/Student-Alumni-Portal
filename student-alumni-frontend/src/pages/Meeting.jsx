// src/pages/Meeting.jsx
// import './Meeting.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Meeting = () => {
  const [meetings, setMeetings] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [alumniEmail, setAlumniEmail] = useState('');

  const fetchMeetings = async () => {
    try {
      const res = await axios.get('/api/meetings');
      console.log('Meeting data:', res.data);

      const fetchedMeetings = Array.isArray(res.data)
        ? res.data
        : res.data.meetings || [];

      setMeetings(fetchedMeetings);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setMeetings([]);
    }
  };

  const fetchAvailableSlots = async (email) => {
    try {
      // Assuming backend route supports email query or param instead of ID
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/alumni/slots?email=${encodeURIComponent(email)}`
      );
      const slots = Array.isArray(res.data) ? res.data : [];
      console.log('Available slots:', slots);
      setAvailableSlots(slots);
      setAlumniEmail(email);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setAvailableSlots([]);
    }
  };

  const scheduleMeeting = async () => {
    try {
      await axios.post('/api/meetings', {
        alumniEmail, // changed from alumniId to alumniEmail
        slot: selectedSlot,
      });
      setSelectedSlot('');
      setAvailableSlots([]);
      fetchMeetings();
    } catch (err) {
      console.error(err);
    }
  };

  const cancelMeeting = async (id) => {
    try {
      await axios.delete(`/api/meetings/${id}`);
      fetchMeetings();
    } catch (err) {
      console.error('Failed to cancel meeting:', err);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <div className="meeting-container">
      <h2>Your Scheduled Meetings</h2>

      <ul className="meeting-list">
        {Array.isArray(meetings) && meetings.length > 0 ? (
          meetings.map((meeting) => (
            <li key={meeting._id} className="meeting-item">
              <span>
                With: <strong>{meeting.alumniName || 'Unknown'}</strong> at{' '}
                <strong>{meeting.slot}</strong> - Status:{' '}
                <em>{meeting.status}</em>
              </span>
              {meeting.status === 'Scheduled' && (
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
    </div>
  );
};
 
export default Meeting;
