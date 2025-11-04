import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AlumniProfileView.css";

const StudentMeetingRequest = () => {
  const { alumniId } = useParams();
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/alumni/${alumniId}`, { headers: { Authorization: `Bearer ${token}` } });
        const alum = res.data;
        if (!mounted) return;
        setAlumni(alum);

        // fetch slots by userId
        const userId = alum.userId || alum.user || alum.userId;
        if (userId) {
          const sres = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/slots/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
          if (mounted) {
            // only show future slots
            const now = new Date();
            const incoming = sres.data.slots || [];
            const future = incoming
              .filter((sl) => new Date(sl.start) > now)
              .sort((a, b) => new Date(a.start) - new Date(b.start));
            setSlots(future);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [alumniId]);

  const handleRequest = async () => {
    if (!selected) return alert("Please select a slot");
    try {
      console.log('Alumni data:', {
        alumni,
        userId: alumni?.userId,
        _id: alumni?._id,
        selectedSlot: selected
      });
      const token = localStorage.getItem("token");
      const payload = {
        // prefer the alumni.userId (references the User model). fall back to slot.userId or alumni._id
        alumniUserId: alumni?.userId || selected.userId || selected.user || alumni?._id,
        // ensure ISO strings are sent
        start: new Date(selected.start).toISOString(),
        end: new Date(selected.end).toISOString(),
        message,
      };
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/meetings`, payload, { headers: { Authorization: `Bearer ${token}` } });
      alert("Meeting requested — waiting for alumni to accept");
      navigate('/student/meetings');
    } catch (err) {
      const body = err?.response?.data;
      console.error('Request failed', body || err);
      const msg = body?.message || body?.error || err.message || 'Failed to request meeting';
      console.error('Meeting request failed:', {
        error: body || err,
        selectedSlot: selected,
        alumni,
        payload
      });
      alert(msg);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!alumni) return <p>Alumni not found</p>;

  return (
    <div className="profile-container">
      <h2>Request Meeting with {alumni.fullName || alumni.fullName}</h2>

      <p><strong>Areas of Interest:</strong> {alumni.areasOfInterest}</p>

      <h3>Available Slots</h3>
      {slots.length === 0 && <p>No available slots</p>}
      <ul>
        {slots.map((s) => (
          <li key={s._id}>
            <label>
              <input type="radio" name="slot" value={s._id} onChange={() => setSelected(s)} />
              {`${new Date(s.start).toLocaleString()} — ${new Date(s.end).toLocaleString()}`}
            </label>
          </li>
        ))}
      </ul>

      <label>Message (optional)</label>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} />

      <div style={{ marginTop: 16 }}>
        <button onClick={handleRequest}>Request Meeting</button>
      </div>
    </div>
  );
};

export default StudentMeetingRequest;
