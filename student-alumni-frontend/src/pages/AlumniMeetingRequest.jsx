import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./AlumniProfileView.css";

const AlumniMeetingRequest = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [student, setStudent] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = localStorage.getItem("token");
        // fetch student user info
        const sres = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/${studentId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!mounted) return;
        setStudent(sres.data);

        // fetch slots for current alumni
        const userId = currentUser?._id || JSON.parse(localStorage.getItem('user') || 'null')?._id;
        if (userId) {
          const r = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/slots/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
          const incoming = r.data.slots || [];
          const now = new Date();
          const future = incoming.filter(sl => new Date(sl.start) > now).sort((a,b)=> new Date(a.start)-new Date(b.start));
          if (mounted) setSlots(future);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [studentId, currentUser]);

  const handleRequest = async () => {
    if (!selected) return alert('Please select a slot');
    try {
      const token = localStorage.getItem('token');
      const payload = {
        studentUserId: studentId,
        start: new Date(selected.start).toISOString(),
        end: new Date(selected.end).toISOString(),
        message,
      };
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/meetings`, payload, { headers: { Authorization: `Bearer ${token}` } });
      alert('Meeting requested to the student — waiting for student to accept');
      navigate('/alumni/meetings');
    } catch (err) {
      const body = err?.response?.data;
      console.error('Request failed', body || err);
      const msg = body?.message || body?.error || err.message || 'Failed to request meeting';
      alert(msg);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!student) return <p>Student not found</p>;

  return (
    <div className="profile-container">
      <h2>Request Meeting with {student.fullName || student.name}</h2>

      <h3>Your Available Slots</h3>
      {slots.length === 0 && <p>No available slots — please create slots in your availability page.</p>}
      <ul>
        {slots.map(s => (
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

export default AlumniMeetingRequest;
