import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const StudentMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proposeTarget, setProposeTarget] = useState(null);
  const [proposedStart, setProposedStart] = useState("");
  const [proposedEnd, setProposedEnd] = useState("");
  const token = localStorage.getItem('token');

  const participantKey = (meeting) => {
    const studentId = meeting.studentId?._id || meeting.studentId || '';
    const alumniId = meeting.alumniId?.profile?._id || meeting.alumniId?._id || meeting.alumniId || '';
    return `${studentId}::${alumniId}`;
  }

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/meetings/my`, { headers: { Authorization: `Bearer ${token}` } });
      setMeetings(res.data.meetings || []);
    } catch (err) {
      console.error('Error fetching meetings', err?.response?.status, err?.response?.data || err?.message || err);
      // Helpful hint for 403: token may be missing/expired or user lacks permissions.
      if (err?.response?.status === 403) {
        console.warn('Got 403 from /meetings/my — check Authorization header, token validity, and backend role checks.');
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const cancel = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/meetings/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetch();
    } catch (err) { console.error(err); alert('Cancel failed'); }
  }

  const accept = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/meetings/${id}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetch();
    } catch (err) { console.error(err); alert('Accept failed'); }
  }

  const propose = async (id) => {
    if (!proposedStart || !proposedEnd) return alert('Select start and end to propose');
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/meetings/${id}/reschedule`, { start: proposedStart, end: proposedEnd, message: '' }, { headers: { Authorization: `Bearer ${token}` } });
      setProposeTarget(null);
      setProposedStart('');
      setProposedEnd('');
      fetch();
    } catch (err) { console.error(err); alert('Reschedule failed'); }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>My Meetings</h2>
      {loading && <p>Loading...</p>}
      {!loading && meetings.length === 0 && <p>No meetings yet.</p>}

      <ul>
        {meetings.map(m => (
          <li key={m._id} style={{ marginBottom: 12, border: '1px solid #ddd', padding: 12 }}>
            <div>
              <strong>With:</strong>{' '}
              {m.alumniId ? (
                // meetings store alumni as User._id and the Alumni profile is populated into user.profile
                // prefer linking to the Alumni document id so the public profile route can load correctly
                <Link to={`/student/alumni/${m.alumniId?.profile?._id || m.alumniId?._id || m.alumniId}`}> 
                  {m.alumniId.fullName || m.alumniId._doc?.fullName || 'Alumni'}
                </Link>
              ) : (
                'Alumni'
              )}
            </div>
            <div><strong>When:</strong> {new Date(m.start).toLocaleString()} - {new Date(m.end).toLocaleString()}</div>
            {/* expired check: only show if no other future meeting exists between same participants */}
            {new Date(m.end) <= new Date() && (
              !meetings.some(other => other._id !== m._id && participantKey(other) === participantKey(m) && new Date(other.start) > new Date() && other.status !== 'cancelled') ? (
              <div style={{ marginTop: 8, color: '#b00' }}>
                <div><strong>Meeting date has been expired</strong></div>
                {/* Student will propose reschedule; remove the Schedule New Meeting button here */}
              </div>
            ) : null)}
            <div><strong>Status:</strong> {m.status}</div>
            {m.status === 'accepted' && new Date(m.end) > new Date() && (
              <div style={{ background: '#e6ffed', padding: 8, marginTop: 8, borderRadius: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div>Your meeting request has been accepted by the alumni.</div>
                  {m.googleMeetLink ? (
                    <a href={m.googleMeetLink} target="_blank" rel="noreferrer"><button>Join Now</button></a>
                  ) : (
                    <div style={{ fontStyle: 'italic' }}>Creating Meeting Link...</div>
                  )}
                </div>
              </div>
            )}

            {m.status === 'reschedule_requested' && (
              <div style={{ marginTop: 8 }}>
                <div>Proposed by: {m.proposer}</div>
                <div>Proposed slot: {m.proposedStart ? `${new Date(m.proposedStart).toLocaleString()} - ${new Date(m.proposedEnd).toLocaleString()}` : 'N/A'}</div>
                <div>Message: {m.rescheduleMessage}</div>
                {/* Student can accept the proposed new time, reject/cancel, or propose another reschedule */}
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => accept(m._id)}>Accept Proposed</button>
                  <button onClick={() => cancel(m._id)}>Reject / Cancel</button>
                </div>
              </div>
            )}

            {/* Controls by status */}
            {m.status === 'pending' && (
              <div style={{ marginTop: 8 }}>
                <button onClick={() => cancel(m._id)}>Cancel</button>
                <button onClick={() => setProposeTarget(m._id)}>Propose Reschedule</button>
              </div>
            )}

            {m.status === 'accepted' && new Date(m.end) > new Date() && (
              <div style={{ marginTop: 8 }}>
                {/* accepted meetings: only allow cancel (Join handled above) */}
                <button onClick={() => cancel(m._id)}>Cancel</button>
              </div>
            )}

            {proposeTarget === m._id && (
              <div style={{ marginTop: 8 }}>
                <label>New start: <input type="datetime-local" value={proposedStart} onChange={(e) => setProposedStart(e.target.value)} /></label>
                <label>New end: <input type="datetime-local" value={proposedEnd} onChange={(e) => setProposedEnd(e.target.value)} /></label>
                <div>
                  <button onClick={() => propose(m._id)}>Send Proposal</button>
                  <button onClick={() => { setProposeTarget(null); setProposedStart(''); setProposedEnd(''); }}>Cancel</button>
                </div>
              </div>
            )}

          </li>
        ))}
      </ul>
    </div>
  );
}

export default StudentMeetings;
