import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./AdminReports.css";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const { user } = useAuth();
  // filters & pagination
  const [filters, setFilters] = useState({
    reporterRole: "",
    reportedRole: "",
    category: "",
    status: "",
    sort: "latest",
    page: 1,
    limit: 20,
    search: "",
  });

  const API = import.meta.env.VITE_API_BASE_URL || "";

  const fetchReports = async (opts = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = API ? `${API}/reports` : "/api/reports";
      const params = {
        reporterRole: filters.reporterRole || undefined,
        reportedRole: filters.reportedRole || undefined,
        category: filters.category || undefined,
        status: filters.status || undefined,
        sort: filters.sort || undefined,
        page: filters.page || 1,
        limit: filters.limit || 20,
        search: filters.search || undefined,
        ...opts,
      };
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setReports(res.data || []);
    } catch (err) {
      console.error("Failed to load reports", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // refetch when filters.page/limit change
  useEffect(() => {
    fetchReports();
  }, [filters.page, filters.limit]);

  const applyFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    // fetch with the new filters immediately (avoid stale state)
    fetchReports(newFilters);
  };

  const openDetails = (r) => setSelected(r);
  const closeDetails = () => setSelected(null);

  const updateReportStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const url = API
        ? `${API}/reports/${id}/status`
        : `/api/reports/${id}/status`;
      const res = await axios.patch(
        url,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // refresh list
      fetchReports();
      if (selected && selected._id === id) setSelected(res.data);
      alert("Report updated");
    } catch (err) {
      console.error(err);
      alert("Failed to update report");
    }
  };

  const blockUser = async (userId) => {
    if (!window.confirm("Block this user? This will prevent login.")) return;
    try {
      const token = localStorage.getItem("token");
      const url = API ? `${API}/users/${userId}` : `/api/users/${userId}`;
      const res = await axios.patch(
        url,
        { allowed: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`User ${res.data.fullName || res.data.email} blocked`);
      fetchReports();
      closeDetails();
    } catch (err) {
      console.error(err);
      alert("Failed to block user");
    }
  };

  const canPrev = filters.page > 1;
  const canNext = reports.length === filters.limit;

  return (
    <div className="admin-reports-container">
      <h2>User Reports</h2>
      <div className="reports-filters">
        <label>
          Reporter Role:
          <select
            value={filters.reporterRole}
            onChange={(e) => applyFilter("reporterRole", e.target.value)}
          >
            <option value="">All</option>
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
          </select>
        </label>
        <label>
          Reported Role:
          <select
            value={filters.reportedRole}
            onChange={(e) => applyFilter("reportedRole", e.target.value)}
          >
            <option value="">All</option>
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
          </select>
        </label>
        <label>
          Category:
          <select
            value={filters.category}
            onChange={(e) => applyFilter("category", e.target.value)}
          >
            <option value="">All</option>
            <option value="harassment">Harassment</option>
            <option value="spam">Spam</option>
            <option value="fake_profile">Fake Profile</option>
            <option value="inappropriate">Inappropriate</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          Status:
          <select
            value={filters.status}
            onChange={(e) => applyFilter("status", e.target.value)}
          >
            <option value="">All</option>
            <option value="open">Pending</option>
            <option value="in_review">Reviewed</option>
            <option value="closed">Rejected</option>
          </select>
        </label>
        <label>
          Sort:
          <select
            value={filters.sort}
            onChange={(e) => applyFilter("sort", e.target.value)}
          >
            <option value="latest">Latest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
        <label>
          Search:
          <input
            type="search"
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilter("search", e.target.value);
            }}
            placeholder="text in description or reason"
          />
        </label>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="reports-table">
          <thead>
            <tr>
              <th>Reporter</th>
              <th>Reported</th>
              <th>Category</th>
              <th>Summary</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 && (
              <tr>
                <td colSpan={7}>No reports</td>
              </tr>
            )}
            {reports.map((r) => (
              <tr key={r._id}>
                <td>
                  {r.reporterId
                    ? r.reporterId.fullName || r.reporterId.email
                    : "Anonymous"}
                </td>
                <td>
                  {r.reportedUserId
                    ? r.reportedUserId.fullName || r.reportedUserId.email
                    : "-"}
                </td>
                <td>{r.reason}</td>
                <td>{(r.description || "").slice(0, 80)}</td>
                <td>{r.status}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => openDetails(r)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="reports-pagination">
        <button
          disabled={!canPrev}
          onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
        >
          Previous
        </button>
        <span>Page {filters.page}</span>
        <button
          disabled={!canNext}
          onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
        >
          Next
        </button>
        <label style={{ marginLeft: 12 }}>
          Per page:
          <select
            value={filters.limit}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                limit: parseInt(e.target.value, 10),
                page: 1,
              }))
            }
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>

      {selected && (
        <div className="report-modal-overlay">
          <div className="report-modal">
            <h3>Report Details</h3>
            <p>
              <strong>Reporter:</strong>{" "}
              {selected.reporterId
                ? `${
                    selected.reporterId.fullName || selected.reporterId.email
                  } (${selected.reporterId.role || "user"})`
                : "Anonymous"}
            </p>
            <p>
              <strong>Reported:</strong>{" "}
              {selected.reportedUserId
                ? `${
                    selected.reportedUserId.fullName ||
                    selected.reportedUserId.email
                  } (${selected.reportedUserId.role || "user"})`
                : "-"}
            </p>
            <p>
              <strong>Category:</strong> {selected.reason}
            </p>
            <p>
              <strong>Description:</strong>
            </p>
            <div className="report-desc">
              {selected.description || "(no description)"}
            </div>
            <div className="report-actions">
              <button
                onClick={() => updateReportStatus(selected._id, "in_review")}
              >
                Mark as Reviewed
              </button>
              <button
                onClick={() => updateReportStatus(selected._id, "closed")}
              >
                Close / Resolve
              </button>
              <button
                onClick={() => updateReportStatus(selected._id, "closed")}
              >
                Reject
              </button>
              {selected.reportedUserId && (
                <button
                  className="danger"
                  onClick={() => blockUser(selected.reportedUserId._id)}
                >
                  Block User
                </button>
              )}
              <button onClick={closeDetails}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
