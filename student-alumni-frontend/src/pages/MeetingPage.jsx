import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MeetingPage = () => {
  const { user } = useAuth();
  const token = user?.token;

  const [alumniId, setAlumniId] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [myMeetings, setMyMeetings] = useState([]);

  const handleSearchSlots = async () => {
    if (!alumniId) return alert('Please enter Alumni ID');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/meetings/slots/${alumniId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableSlots(res.data);
    } catch (err) {
      alert('Failed to fetch slots');
    }
  };

  const handleBook = async (slot) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/meetings/book`,
        { alumniId, timeSlot: slot },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Meeting booked!');
      setAvailableSlots(prev => prev.filter(s => s !== slot));
      fetchMyMeetings();
    } catch (err) {
      alert('Booking failed');
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/meetings/cancel/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Meeting cancelled');
      fetchMyMeetings();
    } catch (err) {
      alert('Cancel failed');
    }
  };

  const fetchMyMeetings = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/meetings/my-meetings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyMeetings(res.data);
    } catch (err) {
      alert('Error loading meetings');
    }
  };

  useEffect(() => {
    fetchMyMeetings();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Book a Meeting with Alumni</h2>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter Alumni ID"
          value={alumniId}
          onChange={(e) => setAlumniId(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <button onClick={handleSearchSlots}>Search Slots</button>
      </div>

      <h4>Available Slots</h4>
      {availableSlots.length === 0 ? <p>No slots available</p> : (
        availableSlots.map((slot, idx) => (
          <div key={idx} style={{ marginBottom: '8px' }}>
            {new Date(slot).toLocaleString()} {' '}
            <button onClick={() => handleBook(slot)}>Book</button>
          </div>
        ))
      )}

      <hr style={{ margin: '2rem 0' }} />

      <h3>My Meetings</h3>
      {myMeetings.length === 0 ? <p>No meetings found</p> : (
        myMeetings.map((m) => (
          <div key={m._id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            <p><strong>Alumni:</strong> {m.alumniId.name}</p>
            <p><strong>Time:</strong> {new Date(m.timeSlot).toLocaleString()}</p>
            <p><strong>Status:</strong> {m.status}</p>
            {m.status === 'scheduled' && (
              <button onClick={() => handleCancel(m._id)}>Cancel</button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MeetingPage;
