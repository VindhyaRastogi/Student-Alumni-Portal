import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AlumniList.css";

const AlumniList = () => {
  const [filters, setFilters] = useState({
    name: "",
    company: "",
    jobTitle: "",
    location: "",
    areasOfInterest: "",
  });
  const [alumni, setAlumni] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchAlumni = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/alumni`, // ✅ updated API
        {
          headers: { Authorization: `Bearer ${token}` },
          params: filters,
        }
      );
      const data = res.data || [];
      const processed = data.map((u) => ({
        ...u,
        blockedByMe: !!(
          currentUser && Array.isArray(currentUser.blockedUsers) && currentUser.blockedUsers.find((b) => String(b) === String(u._id))
        ),
      }));
      setAlumni(processed);
    } catch (err) {
      console.error("Error fetching alumni:", err);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAlumni();
  };

  const API = import.meta.env.VITE_API_BASE_URL || "";

  const navigate = useNavigate();
  const { user: currentUser, login } = useAuth();

  // report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState(null);
  const [reportReason, setReportReason] = useState("harassment");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

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
    // detect current block state from local list so prompt matches action
    const target = alumni.find((u) => String(u._id) === String(id));
    const currentlyBlocked = !!(target && target.blockedByMe);
    const confirmMsg = currentlyBlocked
      ? "Unblock this user? They will be able to interact with you again."
      : "Block this user? This will prevent further interactions.";
    if (!window.confirm(confirmMsg)) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Please login to block users");
      const url = API ? `${API}/users/${id}/block` : `/api/users/${id}/block`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to block/unblock user");
      // reflect in UI: set a local flag blockedByMe
      setAlumni((prev) => prev.map((u) => (u._id === id ? { ...u, blockedByMe: data.blocked } : u)));
      // update local auth user blockedUsers so UI across pages is consistent
      try {
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

      // show a distinct message for unblock vs block
      if (data.blocked) {
        alert(data.message || "User blocked");
      } else {
        alert(data.message || "User unblocked successfully");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to block user");
    } finally {
      setOpenMenuId(null);
    }
  };

  return (
    <div className="alumni-list-container">
      <h2>Explore Alumni</h2>

      {/* Filter Form */}
      <form onSubmit={handleSearch} className="filter-form">
        <input name="name" placeholder="Name" onChange={handleChange} />
        <input
          name="company"
          placeholder="Company / Organization"
          onChange={handleChange}
        />
        <input name="jobTitle" placeholder="Position" onChange={handleChange} />
        <input name="location" placeholder="Location" onChange={handleChange} />
        <input
          name="areasOfInterest"
          placeholder="Area Of Interest"
          onChange={handleChange}
        />
        {/* <select name="areasOfInterest" onChange={handleChange}>
          <option value="">All Interests</option>
          <option value="AI/ML">AI/ML</option>
          <option value="Data Science">Data Science</option>
          <option value="Cybersecurity">Cybersecurity</option>
          <option value="Software Development">Software Development</option>
          <option value="Entrepreneurship">Entrepreneurship</option>
        </select> */}
        <button type="submit">Search</button>
      </form>

      {/* Alumni Cards */}
      <div className="alumni-cards">
        {alumni.map((a) => {
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

          const cand =
            a.profilePicture || (a.profile && a.profile.profilePicture) || null;
          let imgSrc = resolvePic(cand) || "/default-avatar.svg";
          // cache-bust using alumni.updatedAt if present
          try {
            const t = a.updatedAt ? new Date(a.updatedAt).getTime() : null;
            if (t && imgSrc && !imgSrc.includes("default-avatar")) {
              imgSrc = `${imgSrc}${imgSrc.includes("?") ? "&" : "?"}v=${t}`;
            }
          } catch (err) {}

          return (
            <div className="alumni-card" key={a._id}>
              <div className="card-menu-wrapper">
                <button
                  className="dots-btn"
                  aria-label="More actions"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === a._id ? null : a._id);
                  }}
                >
                  ⋮
                </button>
                {openMenuId === a._id && (
                  <div
                    className="card-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="menu-item"
                      onClick={() => {
                        setOpenMenuId(null);
                        navigate(`/chats/${a._id}`);
                      }}
                    >
                      Chat
                    </button>

                    <button
                      className="menu-item"
                      onClick={() => handleBlock(a._id)}
                    >
                      {a.blockedByMe ? 'Unblock' : 'Block'}
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => handleReport(a._id)}
                    >
                      Report
                    </button>
                  </div>
                )}
              </div>
              <div className="alumni-card-top">
                <img
                  src={imgSrc}
                  alt={a.fullName}
                  onError={(e) => {
                    try {
                      e.target.onerror = null;
                    } catch (err) {}
                    e.target.src = "/default-avatar.svg";
                  }}
                />
              </div>

              <h3>{a.fullName}</h3>
              <p>
                {a.jobTitle} @ {a.company}
              </p>
              <p>
                {a.location?.city}, {a.location?.country}
              </p>
              <p>
                <strong>Interests:</strong> {a.areasOfInterest}
              </p>

              <div className="alumni-card-actions">
                <Link
                  to={`/student/alumni/${a._id}`}
                  className="btn btn-primary"
                >
                  View Profile
                </Link>
                {/* Request Meeting navigates to the student-facing meeting request page we added */}
                <Link
                  to={`/student/alumni/${a._id}/request`}
                  className="btn btn-secondary"
                >
                  Request Meeting
                </Link>
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

export default AlumniList;
