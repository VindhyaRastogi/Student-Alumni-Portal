import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const AlumniMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleSlot, setRescheduleSlot] = useState(null);
  const token = localStorage.getItem('token');

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/meetings/my`, { headers: { Authorization: `Bearer ${token}` } });
      setMeetings(res.data.meetings || []);
    } catch (err) {
      console.error('Error fetching meetings', err);
    } finally { setLoading(false); }
  };

  const fetchMySlots = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/slots/my`, { headers: { Authorization: `Bearer ${token}` } });
      setSlots(res.data.slots || []);
    } catch (err) {
      console.error('Error fetching my slots', err);
      setSlots([]);
    }
  }

  useEffect(() => { fetch(); fetchMySlots(); }, []);

  const accept = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/meetings/${id}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetch();
    } catch (err) { console.error(err); alert('Accept failed'); }
  }

  const cancel = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/meetings/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetch();
    } catch (err) { console.error(err); alert('Cancel failed'); }
  }

  const propose = async (id) => {
    if (!rescheduleSlot) return alert('Select a slot to propose');
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/meetings/${id}/reschedule`, { start: rescheduleSlot.start, end: rescheduleSlot.end, message: '' }, { headers: { Authorization: `Bearer ${token}` } });
      setRescheduleTarget(null);
      setRescheduleSlot(null);
      fetch();
    } catch (err) { console.error(err); alert('Reschedule failed'); }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Incoming / My Meetings</h2>
      {meetings.length === 0 && <p>No meetings</p>}
      <ul>
        {meetings.map(m => (
          <li key={m._id} style={{ marginBottom: 12, border: '1px solid #ddd', padding: 12, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 56, height: 56, flex: '0 0 56px' }}>
              {(() => {
                const stu = m.studentId || m.studentId?._doc || {};
                const pic = stu.profile?.profilePicture || stu.profilePicture || stu.user?.profilePicture || stu._doc?.profilePicture || stu._doc?.profile?.profilePicture;
                return pic ? (
                  <img src={pic.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL}${pic}` : pic} alt="student" style={{ width: 56, height: 56, borderRadius: 28, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: 28, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{(stu.fullName || 'S').charAt(0)}</div>
                );
              })()}
            </div>
            <div style={{ flex: 1 }}>
              <div><strong>With:</strong> {m.studentId ? (<Link to={`/student/${m.studentId._id || m.studentId}`}>{m.studentId.fullName || m.studentId._doc?.fullName}</Link>) : 'Student'}</div>
              <div><strong>When:</strong> {new Date(m.start).toLocaleString()} - {new Date(m.end).toLocaleString()}</div>
              <div><strong>Status:</strong> {m.status}</div>
              <div><strong>Message:</strong> {m.message}</div>
            {m.status === 'accepted' && m.meetLink && (
              <div style={{ marginTop: 8, background: '#e6ffed', padding: 8, borderRadius: 4 }}>
                <strong>Meeting Link: </strong>
                <a href={m.meetLink} target="_blank" rel="noopener noreferrer" style={{ color: '#0366d6' }}>
                  Join Google Meet
                </a>
              </div>
            )}
            {m.status === 'pending' && (
              <div style={{ marginTop: 8 }}>
                <button onClick={() => accept(m._id)}>Accept</button>
                <button onClick={() => cancel(m._id)}>Cancel</button>
                <button onClick={async () => { setRescheduleTarget(m._id); await fetchMySlots(); }}>Propose Reschedule</button>
              </div>
            )}

            {m.status === 'reschedule_requested' && (
              <div style={{ marginTop: 8 }}>
                <div>Proposed by: {m.proposer}</div>
                <div>Proposed slot: {m.proposedStart ? `${new Date(m.proposedStart).toLocaleString()} - ${new Date(m.proposedEnd).toLocaleString()}` : 'N/A'}</div>
                <div>Message: {m.rescheduleMessage}</div>
                {/* If alumni, accept the proposed new time */}
                <div>
                  <button onClick={() => accept(m._id)}>Accept Proposed</button>
                  <button onClick={() => cancel(m._id)}>Reject / Cancel</button>
                </div>
              </div>
            )}

            </div>

            {rescheduleTarget === m._id && (
              <div style={{ marginTop: 8 }}>
                <h4>Select a slot to propose</h4>
                {slots.length === 0 && <p>No slots available to propose</p>}
                <ul>
                  {slots.map(s => (
                    <li key={s._id}>
                      <label>
                        <input type="radio" name="slot" onChange={() => setRescheduleSlot(s)} />
                        {`${new Date(s.start).toLocaleString()} - ${new Date(s.end).toLocaleString()}`}
                      </label>
                    </li>
                  ))}
                </ul>
                <button onClick={() => propose(m._id)}>Send Proposal</button>
                <button onClick={() => { setRescheduleTarget(null); setRescheduleSlot(null); }}>Cancel</button>
              </div>
            )}

          </li>
        ))}
      </ul>
    </div>
  );
}

export default AlumniMeetings;
