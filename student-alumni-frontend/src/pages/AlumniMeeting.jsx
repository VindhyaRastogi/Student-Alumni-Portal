import { useEffect, useState } from "react";
import axios from "axios";

const AlumniMeeting = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/meetings/alumni`
        );
        setRequests(res.data);
      } catch (error) {
        console.error("Error fetching meeting requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/meetings/${id}/${action}`);
      setRequests((prev) =>
        prev.map((req) =>
          req._id === id ? { ...req, status: action } : req
        )
      );
    } catch (error) {
      console.error(`Error updating meeting:`, error);
    }
  };

  if (loading) return <p>Loading meetings...</p>;

  return (
    <div className="alumni-meeting-container">
      <h2>Meeting Requests</h2>
      {requests.length === 0 ? (
        <p>No meeting requests yet.</p>
      ) : (
        <ul>
          {requests.map((req) => (
            <li key={req._id}>
              <p>
                <strong>Student:</strong> {req.student?.fullName} <br />
                <strong>Email:</strong> {req.student?.email} <br />
                <strong>Slot:</strong> {req.slot} <br />
                <strong>Status:</strong> {req.status}
              </p>
              {req.status === "pending" && (
                <div>
                  <button onClick={() => handleAction(req._id, "accept")}>
                    Accept
                  </button>
                  <button onClick={() => handleAction(req._id, "reject")}>
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlumniMeeting;
