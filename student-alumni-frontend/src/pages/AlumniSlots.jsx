// src/pages/AlumniSlots.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import "./AlumniSlots.css"; // we'll add some responsive styles here

const AlumniSlots = () => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mySlots, setMySlots] = useState([]);
  const [newSlots, setNewSlots] = useState([]);

  const token = localStorage.getItem("token");
  const alumniEmail = localStorage.getItem("email");

  const fetchMySlots = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/meetings/slots?email=${alumniEmail}`
      );
      setMySlots(res.data || []);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setMySlots([]);
    }
  };

  const addTempSlot = () => {
    if (!date || !time) {
      alert("Please select both date and time");
      return;
    }
    const formattedSlot = `${date} ${time}`;
    setNewSlots((prev) => [...prev, formattedSlot]);
    setDate("");
    setTime("");
  };

  const saveSlots = async () => {
    try {
      if (newSlots.length === 0) return alert("Please add at least one slot");

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/meetings/slots`,
        { slots: newSlots },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewSlots([]);
      fetchMySlots();
    } catch (err) {
      console.error("Error adding slots:", err);
    }
  };

  useEffect(() => {
    fetchMySlots();
  }, []);

  return (
    <div className="alumni-slots-container">
      <h2>My Available Slots</h2>

      {mySlots.length > 0 ? (
        <ul>
          {mySlots.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      ) : (
        <p>No available slots yet.</p>
      )}

      <div className="slot-form">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <button onClick={addTempSlot}>+ Add Slot</button>
      </div>

      {newSlots.length > 0 && (
        <div className="new-slots">
          <h4>Slots to be added:</h4>
          <ul>
            {newSlots.map((slot, index) => (
              <li key={index}>{slot}</li>
            ))}
          </ul>
          <button className="save-btn" onClick={saveSlots}>
            Save All Slots
          </button>
        </div>
      )}
    </div>
  );
};

export default AlumniSlots;
