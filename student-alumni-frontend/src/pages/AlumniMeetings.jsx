import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AlumniMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleSlot, setRescheduleSlot] = useState(null);
  const [creatingLinkFor, setCreatingLinkFor] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const participantKey = (meeting) => {
    const studentId = meeting.studentId?._id || meeting.studentId || '';
    const alumniId = meeting.alumniId?.profile?._id || meeting.alumniId?._id || meeting.alumniId || '';
    return `${studentId}::${alumniId}`;
  }

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/meetings/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeetings(res.data.meetings || []);
    } catch (err) {
      console.error("Error fetching meetings", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySlots = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/slots/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSlots(res.data.slots || []);
    } catch (err) {
      console.error("Error fetching my slots", err);
      setSlots([]);
    }
  };

  useEffect(() => {
    fetch();
    fetchMySlots();
  }, []);

  const accept = async (id) => {
    try {
      setCreatingLinkFor(id);
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/meetings/${id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreatingLinkFor(null);
      fetch();
    } catch (err) {
      console.error(err);
      setCreatingLinkFor(null);
      alert("Accept failed");
    }
  };

  const cancel = async (id) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/meetings/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetch();
    } catch (err) {
      console.error(err);
      alert("Cancel failed");
    }
  };

  const propose = async (id) => {
    if (!rescheduleSlot) return alert("Select a slot to propose");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/meetings/${id}/reschedule`,
        { start: rescheduleSlot.start, end: rescheduleSlot.end, message: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRescheduleTarget(null);
      setRescheduleSlot(null);
      fetch();
    } catch (err) {
      console.error(err);
      alert("Reschedule failed");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Incoming / My Meetings</h2>
      {meetings.length === 0 && <p>No meetings</p>}
      <ul>
        {meetings.map(m => (
          <li key={m._id} style={{ marginBottom: 12, border: '1px solid #ddd', padding: 12 }}>
            <div>
              <strong>With:</strong>{' '}
              {m.studentId ? (
                <Link to={`/student/${m.studentId._id || m.studentId}`}>{m.studentId?._doc?.fullName || m.studentId?.fullName || 'Student'}</Link>
              ) : (
                'Student'
              )}
            </div>
            <div><strong>When:</strong> {new Date(m.start).toLocaleString()} - {new Date(m.end).toLocaleString()}</div>
            <div><strong>Status:</strong> {m.status}</div>
            <div><strong>Message:</strong> {m.message}</div>
            {((new Date(m.end) <= new Date()) && !meetings.some(other => other._id !== m._id && participantKey(other) === participantKey(m) && new Date(other.start) > new Date() && other.status !== 'cancelled')) ? (
              <div style={{ marginTop: 8, color: '#b00' }}>
                <div><strong>Meeting date has been expired</strong></div>
                <div style={{ marginTop: 8 }}>
                    <button onClick={async () => { setRescheduleTarget(m._id); await fetchMySlots(); }}>Schedule New Meeting</button>
                  </div>
              </div>
            ) : null}
                  {m.status === 'pending' && (
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => accept(m._id)}>Accept</button>
                      <button onClick={() => cancel(m._id)}>Cancel</button>
                      <button
                        onClick={async () => {
                          setRescheduleTarget(m._id);
                          await fetchMySlots();
                        }}
                      >
                        Propose Reschedule
                      </button>
                    </div>
                  )}

                  {m.status === 'accepted' && new Date(m.end) > new Date() && (
                    <div style={{ marginTop: 8 }}>
                      {m.googleMeetLink ? (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <div style={{ color: 'green', fontWeight: 'bold' }}>Meeting confirmed ✅</div>
                          <a href={m.googleMeetLink} target="_blank" rel="noreferrer"><button>Join Now</button></a>
                        </div>
                          ) : creatingLinkFor === m._id ? (
                            <div>Creating Meeting Link...</div>
                          ) : (
                            <div>
                              <button onClick={() => cancel(m._id)}>Cancel</button>
                            </div>
                          )}
                    </div>
                  )}

            {m.status === 'reschedule_requested' && (
              <div style={{ marginTop: 8 }}>
                <div>Proposed by: {m.proposer}</div>
                <div>Proposed slot: {m.proposedStart ? `${new Date(m.proposedStart).toLocaleString()} - ${new Date(m.proposedEnd).toLocaleString()}` : 'N/A'}</div>
                <div>Message: {m.rescheduleMessage}</div>
                {/* If alumni, accept the proposed new time */}
                <div>
                  <button onClick={() => cancel(m._id)}>Reject / Cancel</button>
                </div>
              </div>
            )}

            {rescheduleTarget === m._id && (
              <div style={{ marginTop: 8 }}>
                <h4>Select a slot to propose</h4>
                <div style={{ marginBottom: 8 }}>
                  <button
                    onClick={() => navigate("/alumni/slots")}
                    style={{ marginRight: 8 }}
                  >
                    Add New Slot
                  </button>
                </div>
                {slots.length === 0 && <p>No slots available to propose</p>}
                <ul>
                  {slots.map((s) => (
                    <li key={s._id}>
                      <label>
                        <input
                          type="radio"
                          name="slot"
                          onChange={() => setRescheduleSlot(s)}
                        />
                        {`${new Date(s.start).toLocaleString()} - ${new Date(
                          s.end
                        ).toLocaleString()}`}
                      </label>
                    </li>
                  ))}
                </ul>
                <button onClick={() => propose(m._id)}>Send Proposal</button>
                <button
                  onClick={() => {
                    setRescheduleTarget(null);
                    setRescheduleSlot(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlumniMeetings;
