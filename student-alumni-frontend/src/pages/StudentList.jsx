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

  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState(null);
  const [reportReason, setReportReason] = useState("harassment");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/users/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: filters,
        }
      );
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // close menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!openMenuId) return;
    const onDocClick = (e) => {
      if (e.target.closest(".card-menu") || e.target.closest(".dots-btn"))
        return;
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
        JSON.parse(localStorage.getItem("user") || "null")?._id ||
        null;
      const API = import.meta.env.VITE_API_BASE_URL || "";
      const url = API ? `${API}/reports` : "/api/reports";
      const body = {
        reportedUserId: reportTargetId,
        reporterId,
        reason: reportReason,
        description: reportDescription,
      };
      const res = await fetch(url, {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          : { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        alert("Your report has been submitted to the admin. Thank you.");
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.message || "Report submitted (no server endpoint)");
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

  const handleBlock = async (id) => {
    if (!window.confirm("Block this user? (Admins only)")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Only admins can block users");
      const API = import.meta.env.VITE_API_BASE_URL || "";
      const url = API ? `${API}/admin/users/${id}` : `/api/admin/users/${id}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to block user");
      setStudents((prev) =>
        prev.map((u) => (u._id === id ? { ...u, allowed: false } : u))
      );
      alert("User blocked");
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

      <form onSubmit={handleSearch} className="filter-form">
        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="degree" placeholder="Degree" onChange={handleChange} />
        <input name="batch" placeholder="Batch" onChange={handleChange} />
        <input
          name="areaOfInterest"
          placeholder="Area Of Interest"
          onChange={handleChange}
        />
        <button type="submit">Search</button>
      </form>

      <div className="alumni-cards">
        {students.map((s) => {
          const apiBase = import.meta.env.VITE_API_BASE_URL || "";
          const apiRoot = apiBase.replace(/\/api\/?$/i, "");

          const resolvePic = (val) => {
            if (!val) return null;
            if (val.startsWith("http")) return val;
            if (val.startsWith("/")) return `${apiRoot}${val}`;
            if (val.includes("/uploads/"))
              return `${apiRoot}/${val}`.replace(/([^:]\/)\//g, "$1");
            return `${apiRoot}/uploads/${val}`;
          };

          const cand = s.profile?.profilePicture || s.profilePicture || null;
          let imgSrc = resolvePic(cand) || "/default-avatar.svg";
          try {
            const t =
              (s.profile && s.profile._updatedAt) || s.updatedAt || null;
            const tm = t ? new Date(t).getTime() : null;
            if (tm && imgSrc && !imgSrc.includes("default-avatar")) {
              imgSrc = `${imgSrc}${imgSrc.includes("?") ? "&" : "?"}v=${tm}`;
            }
          } catch (err) {}

          return (
            <div className="alumni-card" key={s._id}>
              <div className="card-menu-wrapper">
                <button
                  className="dots-btn"
                  aria-label="More actions"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === s._id ? null : s._id);
                  }}
                >
                  ⋮
                </button>
                {openMenuId === s._id && (
                  <div
                    className="card-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="menu-item"
                      onClick={() => {
                        setOpenMenuId(null);
                        navigate(`/chats/${s._id}`);
                      }}
                    >
                      Chat
                    </button>

                    <button
                      className="menu-item"
                      onClick={() => handleBlock(s._id)}
                    >
                      Block
                    </button>

                    <button
                      className="menu-item"
                      onClick={() => handleReport(s._id)}
                    >
                      Report
                    </button>
                  </div>
                )}
              </div>

              <div className="alumni-card-top">
                <img
                  src={imgSrc}
                  alt={s.fullName || s.name}
                  onError={(e) => {
                    try {
                      e.target.onerror = null;
                    } catch (err) {}
                    e.target.src = "/default-avatar.svg";
                  }}
                />
              </div>

              <h3>{s.fullName || s.name}</h3>
              <p>
                <strong>Degree:</strong> {s.profile?.degree || s.degree || "-"}
              </p>
              <p>
                <strong>Batch:</strong> {s.profile?.batch || s.batch || "-"}
              </p>
              <p>
                <strong>Interests:</strong>{" "}
                {s.profile?.areaOfInterest || s.areaOfInterest || "-"}
              </p>
              <div style={{ marginTop: 8 }}>
                <Link to={`/student/${s._id}`}>View Profile</Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="report-modal-overlay">
          <div className="report-modal" role="dialog" aria-modal="true">
            <h3>Report User</h3>
            <p>Please choose a reason and describe briefly what happened.</p>

            <label>
              Reason
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="harassment">Harassment</option>
                <option value="spam">Spam</option>
                <option value="fake_profile">Fake profile</option>
                <option value="inappropriate">Inappropriate behavior</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label>
              Description
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={4}
                placeholder="Short description (what happened)"
              ></textarea>
            </label>

            <div style={{ marginTop: 12, textAlign: "right" }}>
              <button
                onClick={() => setReportModalOpen(false)}
                disabled={reportSubmitting}
                style={{ marginRight: 8 }}
              >
                Cancel
              </button>
              <button onClick={submitReport} disabled={reportSubmitting}>
                {reportSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
