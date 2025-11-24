import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const StudentMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proposeTarget, setProposeTarget] = useState(null);
  const [proposedStart, setProposedStart] = useState("");
  const [proposedEnd, setProposedEnd] = useState("");
  const token = localStorage.getItem("token");

  // Generate unique participant pair key
  const participantKey = (meeting) => {
    const studentId = meeting.studentId?._id || meeting.studentId || "";
    const alumniId =
      meeting.alumniId?.profile?._id ||
      meeting.alumniId?._id ||
      meeting.alumniId ||
      "";
    return `${studentId}::${alumniId}`;
  };

  // Fetch meetings
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/meetings/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeetings(res.data.meetings || []);
    } catch (err) {
      console.error(
        "Error fetching meetings:",
        err?.response?.status,
        err?.response?.data || err?.message
      );

      if (err?.response?.status === 403) {
        console.warn("403 — Token expired or missing permissions.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // Cancel meeting
  const cancel = async (id) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/meetings/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMeetings();
    } catch (err) {
      console.error(err);
      alert("Cancel failed");
    }
  };

  // Accept meeting or accept proposed reschedule
  const accept = async (id) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/meetings/${id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMeetings();
    } catch (err) {
      console.error(err);
      alert("Accept failed");
    }
  };

  // Propose a new schedule
  const propose = async (id) => {
    if (!proposedStart || !proposedEnd)
      return alert("Select start and end to propose");

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/meetings/${id}/reschedule`,
        {
          start: proposedStart,
          end: proposedEnd,
          message: "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProposeTarget(null);
      setProposedStart("");
      setProposedEnd("");
      fetchMeetings();
    } catch (err) {
      console.error(err);
      alert("Reschedule proposal failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>My Meetings</h2>

      {loading && <p>Loading...</p>}
      {!loading && meetings.length === 0 && <p>No meetings yet.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {meetings.map((m) => (
          <li
            key={m._id}
            style={{
              marginBottom: 12,
              border: "1px solid #ddd",
              padding: 12,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              borderRadius: 6,
            }}
          >
            {/* Profile Picture */}
            <div style={{ width: 56, height: 56, flex: "0 0 56px" }}>
              {(() => {
                const alum = m.alumniId || {};
                const pic =
                  alum.profile?.profilePicture ||
                  alum.profilePicture ||
                  alum.user?.profilePicture;

                return pic ? (
                  <img
                    src={
                      pic.startsWith("/")
                        ? `${import.meta.env.VITE_API_BASE_URL}${pic}`
                        : pic
                    }
                    alt="alumni"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      background: "#eee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {(alum.fullName || "A").charAt(0)}
                  </div>
                );
              })()}
            </div>

            {/* Meeting Details */}
            <div style={{ flex: 1 }}>
              <div>
                <strong>With:</strong>{" "}
                {m.alumniId ? (
                  <Link
                    to={`/student/alumni/${
                      m.alumniId?.profile?._id ||
                      m.alumniId?._id ||
                      m.alumniId
                    }`}
                  >
                    {m.alumniId.fullName}
                  </Link>
                ) : (
                  "Alumni"
                )}
              </div>

              <div>
                <strong>When:</strong>{" "}
                {new Date(m.start).toLocaleString()} –{" "}
                {new Date(m.end).toLocaleString()}
              </div>

              {/* Expired check */}
              {new Date(m.end) <= new Date() &&
                !meetings.some(
                  (other) =>
                    other._id !== m._id &&
                    participantKey(other) === participantKey(m) &&
                    new Date(other.start) > new Date() &&
                    other.status !== "cancelled"
                ) && (
                  <div style={{ marginTop: 8, color: "#b00" }}>
                    <strong>Meeting date has expired</strong>
                  </div>
                )}

              <div>
                <strong>Status:</strong> {m.status}
              </div>

              {/* If accepted */}
              {m.status === "accepted" && (
                <div
                  style={{
                    background: "#e6ffed",
                    padding: 8,
                    marginTop: 8,
                    borderRadius: 4,
                  }}
                >
                  <div>Your meeting request has been accepted.</div>

                  {m.googleMeetLink || m.meetLink ? (
                    <div style={{ marginTop: 8 }}>
                      <strong>Join meeting: </strong>
                      <a
                        href={m.googleMeetLink || m.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#0366d6" }}
                      >
                        Join Now
                      </a>
                    </div>
                  ) : (
                    <em style={{ marginTop: 8 }}>Creating Meeting Link...</em>
                  )}
                </div>
              )}

              {/* If reschedule pending */}
              {m.status === "reschedule_requested" && (
                <div style={{ marginTop: 8 }}>
                  <div>Proposed by: {m.proposer}</div>
                  <div>
                    Proposed slot:{" "}
                    {m.proposedStart
                      ? `${new Date(m.proposedStart).toLocaleString()} – ${new Date(
                          m.proposedEnd
                        ).toLocaleString()}`
                      : "N/A"}
                  </div>
                  <div>Message: {m.rescheduleMessage}</div>

                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => accept(m._id)}>Accept Proposed</button>
                    <button onClick={() => cancel(m._id)}>Reject / Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* ACTIONS (Right side column) */}
            <div style={{ marginTop: 8 }}>
              {m.status === "pending" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <button onClick={() => cancel(m._id)}>Cancel</button>
                  <button onClick={() => setProposeTarget(m._id)}>
                    Propose Reschedule
                  </button>
                </div>
              )}

              {/* Cancel if accepted & upcoming */}
              {m.status === "accepted" && new Date(m.end) > new Date() && (
                <button onClick={() => cancel(m._id)}>Cancel</button>
              )}

              {/* Show reschedule form */}
              {proposeTarget === m._id && (
                <div style={{ marginTop: 8 }}>
                  <label>
                    New start:{" "}
                    <input
                      type="datetime-local"
                      value={proposedStart}
                      onChange={(e) => setProposedStart(e.target.value)}
                    />
                  </label>

                  <label>
                    New end:{" "}
                    <input
                      type="datetime-local"
                      value={proposedEnd}
                      onChange={(e) => setProposedEnd(e.target.value)}
                    />
                  </label>

                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => propose(m._id)}>Send Proposal</button>
                    <button
                      onClick={() => {
                        setProposeTarget(null);
                        setProposedStart("");
                        setProposedEnd("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentMeetings;
