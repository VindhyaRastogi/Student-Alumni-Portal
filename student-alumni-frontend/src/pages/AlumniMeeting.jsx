// src/pages/AlumniMeeting.jsx
// import './Meeting.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

const AlumniMeeting = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [newSlot, setNewSlot] = useState('');
  const [meetings, setMeetings] = useState([]);

  // Fetch alumni available slots from backend
  const fetchAvailableSlots = async () => {
    try {
      const res = await axios.get('/api/alumni/slots'); // backend should return slots for logged-in alumni
      setAvailableSlots(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setAvailableSlots([]);
    }
  };

  // Add new available slot
  const addSlot = async () => {
    if (!newSlot) return;
    try {
      await axios.post('/api/alumni/slots', { slot: newSlot });
      setNewSlot('');
      fetchAvailableSlots();
    } catch (err) {
      console.error('Error adding slot:', err);
    }
  };

  // Delete an available slot
  const deleteSlot = async (slotToDelete) => {
    try {
      await axios.delete('/api/alumni/slots', { data: { slot: slotToDelete } });
      fetchAvailableSlots();
    } catch (err) {
      console.error('Error deleting slot:', err);
    }
  };

  // Fetch meetings scheduled with this alumni
  const fetchMeetings = async () => {
    try {
      const res = await axios.get('/api/meetings/alumni'); // backend returns meetings for logged-in alumni
      setMeetings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setMeetings([]);
    }
  };

  // Confirm meeting (change status to Confirmed)
  const confirmMeeting = async (meetingId) => {
    try {
      await axios.put(`/api/meetings/${meetingId}/confirm`);
      fetchMeetings();
    } catch (err) {
      console.error('Error confirming meeting:', err);
    }
  };

  // Cancel meeting (change status to Cancelled)
  const cancelMeeting = async (meetingId) => {
    try {
      await axios.put(`/api/meetings/${meetingId}/cancel`);
      fetchMeetings();
    } catch (err) {
      console.error('Error cancelling meeting:', err);
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
    fetchMeetings();
  }, []);

  return (
    <div className="meeting-container">
      <h2>Manage Your Available Slots</h2>
      <div className="slots-section">
        <input
          type="text"
          placeholder="Add a new slot (e.g. 2025-07-20 10:00 AM)"
          value={newSlot}
          onChange={(e) => setNewSlot(e.target.value)}
        />
        <button onClick={addSlot} disabled={!newSlot.trim()}>
          Add Slot
        </button>
      </div>

      <ul className="slot-list">
        {availableSlots.length > 0 ? (
          availableSlots.map((slot, idx) => (
            <li key={idx}>
              {slot}{' '}
              <button className="cancel-button" onClick={() => deleteSlot(slot)}>
                Delete
              </button>
            </li>
          ))
        ) : (
          <li>No available slots added yet.</li>
        )}
      </ul>

      <h2>Meeting Requests from Students</h2>
      <ul className="meeting-list">
        {meetings.length > 0 ? (
          meetings.map((meeting) => (
            <li key={meeting._id} className="meeting-item">
              <span>
                Student: <strong>{meeting.studentName || 'Unknown'}</strong> <br />
                Scheduled Slot: <strong>{meeting.slot}</strong> <br />
                Status: <em>{meeting.status}</em>
              </span>
              <div className="meeting-actions">
                {meeting.status === 'Scheduled' && (
                  <>
                    <button onClick={() => confirmMeeting(meeting._id)}>Confirm</button>
                    <button onClick={() => cancelMeeting(meeting._id)}>Cancel</button>
                  </>
                )}
                {(meeting.status === 'Confirmed' || meeting.status === 'Cancelled') && (
                  <button onClick={() => cancelMeeting(meeting._id)}>Cancel</button>
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
