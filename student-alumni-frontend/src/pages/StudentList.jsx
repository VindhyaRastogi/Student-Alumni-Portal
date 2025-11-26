import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AlumniList.css";

const StudentList = () => {
  const [filters, setFilters] = useState({
    name: "",
    degree: "",
    batch: "",
    areaOfInterest: "",
  });

  const [students, setStudents] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  const API = import.meta.env.VITE_API_BASE_URL || "";
  const navigate = useNavigate();
  const { user: currentUser, login } = useAuth();

  // Report modal states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState(null);
  const [reportReason, setReportReason] = useState("harassment");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Fetch students
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/users/students`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });
      const data = res.data || [];
      // mark which students are blocked by current user
      const processed = data.map((u) => ({
        ...u,
        blockedByMe: !!(
          currentUser &&
          Array.isArray(currentUser.blockedUsers) &&
          currentUser.blockedUsers.find((b) => String(b) === String(u._id))
        ),
      }));
      setStudents(processed);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Close menu on outside click / ESC
  useEffect(() => {
    if (!openMenuId) return;

    const onDocClick = (e) => {
      if (e.target.closest(".card-menu") || e.target.closest(".dots-btn")) return;
      setOpenMenuId(null);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpenMenuId(null);
    };

    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenuId]);

  // Report user
  const handleReport = (id) => {
    setReportTargetId(id);
    setReportReason("harassment");
    setReportDescription("");
    setReportModalOpen(true);
    setOpenMenuId(null);
  };

  const submitReport = async () => {
    if (!reportTargetId) return;
    setReportSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const reporterId =
        currentUser?._id ||
        JSON.parse(localStorage.getItem("user") || "null")?._id;

      const body = {
        reportedUserId: reportTargetId,
        reporterId,
        reason: reportReason,
        description: reportDescription,
      };

      const res = await fetch(`${API}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.message || "Failed to submit report");
      } else {
        alert("Report submitted successfully.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit report");
    } finally {
      setReportSubmitting(false);
      setReportModalOpen(false);
      setReportTargetId(null);
    }
  };

  // Block/unblock another user (student can block alumni)
  const handleBlock = async (id) => {
    if (!window.confirm("Block this user? This will prevent further interactions.")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Please login to block users");

      const res = await fetch(`${API}/users/${id}/block`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to block/unblock user');

      setStudents((prev) => prev.map((u) => (u._id === id ? { ...u, blockedByMe: data.blocked } : u)));

      // update local auth user blockedUsers so UI across pages is consistent
      try {
        const token = localStorage.getItem('token');
        const stored = JSON.parse(localStorage.getItem('user') || 'null');
        if (stored) {
          const updated = { ...stored };
          updated.blockedUsers = updated.blockedUsers || [];
          if (data.blocked) {
            if (!updated.blockedUsers.find((b) => String(b) === String(id))) updated.blockedUsers.push(id);
          } else {
            updated.blockedUsers = updated.blockedUsers.filter((b) => String(b) !== String(id));
          }
          localStorage.setItem('user', JSON.stringify(updated));
          if (typeof login === 'function') login(updated, token);
        }
      } catch (err) {}

      alert(data.message || (data.blocked ? "User blocked" : "User unblocked"));
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to block user");
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  return (
    <div className="alumni-list-container">
      <h2>Explore Students</h2>

      {/* Filter form */}
      <form onSubmit={handleSearch} className="filter-form">
        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="degree" placeholder="Degree" onChange={handleChange} />
        <input name="batch" placeholder="Batch" onChange={handleChange} />
        <input
          name="areaOfInterest"
          placeholder="Area of Interest"
          onChange={handleChange}
        />
        <button type="submit">Search</button>
      </form>

      <div className="alumni-cards">
        {students.map((s) => {
          const apiRoot = API.replace(/\/api\/?$/i, "");

          const resolvePic = (val) => {
            if (!val) return null;
            if (val.startsWith("http")) return val;
            if (val.startsWith("/")) return `${apiRoot}${val}`;
            return `${apiRoot}/uploads/${val}`;
          };

          const src =
            resolvePic(
              s.profile?.profilePicture || s.profilePicture
            ) || "/default-avatar.svg";

          return (
            <div className="alumni-card" key={s._id}>
              <div className="card-menu-wrapper">
                <button
                  className="dots-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === s._id ? null : s._id);
                  }}
                >
                  ⋮
                </button>

                {openMenuId === s._id && (
                  <div className="card-menu">
                    {currentUser?.role === "alumni" && (
                      <button
                        className="menu-item"
                        onClick={() => navigate(`/alumni/student/${s._id}/request`)}
                      >
                        Request Meeting
                      </button>
                    )}

                    <button
                      className="menu-item"
                      onClick={() => navigate(`/chats/${s._id}`)}
                    >
                      Chat
                    </button>

                    <button className="menu-item" onClick={() => handleBlock(s._id)}>
                      {s.blockedByMe ? 'Unblock' : 'Block'}
                    </button>

                    <button className="menu-item" onClick={() => handleReport(s._id)}>
                      Report
                    </button>
                  </div>
                )}
              </div>

              <div className="alumni-card-top">
                <img src={src} alt={s.fullName || s.name} />
              </div>

              <h3>{s.fullName || s.name}</h3>

              <p>
                <strong>Degree:</strong> {s.profile?.degree || "-"}
              </p>
              <p>
                <strong>Batch:</strong> {s.profile?.batch || "-"}
              </p>
              <p>
                <strong>Interests:</strong>{" "}
                {s.profile?.areaOfInterest || "-"}
              </p>

              <div className="alumni-card-actions">
                <Link to={`/student/${s._id}`}>View Profile</Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* REPORT MODAL */}
      {reportModalOpen && (
        <div className="report-modal-overlay">
          <div className="report-modal">
            <h3>Report User</h3>

            <label>
              Reason
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="harassment">Harassment</option>
                <option value="spam">Spam</option>
                <option value="fake_profile">Fake Profile</option>
                <option value="inappropriate">Inappropriate Behavior</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label>
              Description
              <textarea
                rows={4}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
              ></textarea>
            </label>

            <div className="modal-actions">
              <button
                onClick={() => setReportModalOpen(false)}
                disabled={reportSubmitting}
              >
                Cancel
              </button>
              <button onClick={submitReport} disabled={reportSubmitting}>
                {reportSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
