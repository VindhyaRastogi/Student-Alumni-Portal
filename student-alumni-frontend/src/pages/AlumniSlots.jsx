// src/pages/AlumniSlots.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import "./AlumniSlots.css";

const AlumniSlots = () => {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [mySlots, setMySlots] = useState([]);
  const [newSlots, setNewSlots] = useState([]); // array of { date, startTime, endTime }

  const token = localStorage.getItem("token");

  const fetchMySlots = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/slots/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMySlots(res.data.slots || []);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setMySlots([]);
    }
  };

  const deleteSlot = async (slotId) => {
    if (!slotId) return;
    if (!confirm("Delete this slot?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/slots/${slotId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // refresh list
      fetchMySlots();
    } catch (err) {
      console.error(
        "Error deleting slot:",
        err?.response?.data || err.message || err
      );
      alert(err?.response?.data?.message || "Failed to delete slot");
    }
  };

  const clearAllSlots = async () => {
    if (!confirm("Clear all your slots? This cannot be undone.")) return;
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/slots/clear`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Deleted ${res.data.deletedCount || 0} slot(s)`);
      fetchMySlots();
    } catch (err) {
      console.error("Error clearing slots", err);
      alert("Failed to clear slots");
    }
  };

  const addTempSlot = () => {
    if (!date || !startTime || !endTime) {
      alert("Please select date, start time and end time");
      return;
    }

    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      alert("Invalid date or time");
      return;
    }

    if (end <= start) {
      alert("End time must be after start time");
      return;
    }

    // prevent past slots (end must be in the future)
    if (end <= now) {
      alert("Cannot select past date/time");
      return;
    }

    // compute ISO timestamps and push a single consolidated slot object
    let slotObj = { date, startTime, endTime };
    try {
      const startIso = new Date(`${date}T${startTime}:00`).toISOString();
      const endIso = new Date(`${date}T${endTime}:00`).toISOString();
      slotObj = { ...slotObj, start: startIso, end: endIso };
    } catch (e) {
      // ignore; still send date/time strings if ISO creation fails
    }

    setNewSlots((prev) => [...prev, slotObj]);
    setDate("");
    setStartTime("");
    setEndTime("");
  };

  const saveSlots = async () => {
    try {
      if (newSlots.length === 0) return alert("Please add at least one slot");

      // send structured slots
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/slots`,
        { slots: newSlots },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const createdCount =
        res.data?.createdCount ??
        (res.data?.created ? res.data.created.length : 0);
      if (createdCount > 0) {
        alert(`Saved ${createdCount} slot(s)`);
      } else {
        alert(res.data?.message || "No slots were saved");
      }

      setNewSlots([]);
      fetchMySlots();
    } catch (err) {
      // show server response body if available for debugging
      const serverBody = err?.response?.data;
      console.error("Error adding slots:", serverBody || err.message || err);
      alert(
        serverBody?.message ||
          serverBody?.error ||
          err.message ||
          "Error adding slots"
      );
    }
  };

  useEffect(() => {
    fetchMySlots();
  }, []);

  return (
    <div className="alumni-slots-container">
      <h2>My Available Slots</h2>

      {mySlots.length > 0 ? (
        <div>
          <div style={{ marginBottom: 12 }}>
            <button onClick={clearAllSlots} className="save-btn">
              Clear all slots
            </button>
          </div>
          <ul>
            {mySlots.map((s) => {
              // s is expected to be an object with start and end ISO dates
              let display = s;
              try {
                const start = new Date(s.start);
                const end = new Date(s.end);
                display = `${start.toLocaleString()} - ${end.toLocaleTimeString()}`;
              } catch (e) {
                display = JSON.stringify(s);
              }
              return (
                <li
                  key={s._id || `${s.start}-${s.end}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{display}</span>
                  <button
                    onClick={() => deleteSlot(s._id)}
                    style={{ marginLeft: 12 }}
                  >
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p>No available slots yet.</p>
      )}

      <div className="slot-form">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]} // no past dates
        />
        <label>From</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <label>To</label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        <button onClick={addTempSlot}>+ Add Slot</button>
      </div>

      {newSlots.length > 0 && (
        <div className="new-slots">
          <h4>Slots to be added:</h4>
          <ul>
            {newSlots.map((slot, index) => (
              <li
                key={index}
              >{`${slot.date} ${slot.startTime} - ${slot.endTime}`}</li>
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
