// src/pages/admin/AdminUsers.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminUsers.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    role: "",
    degree: "",
    batch: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/admin/users`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const data = await res.json();
        if (res.ok) setUsers(data);
        else setError(data.message || "Failed to fetch users");
      } catch (err) {
        console.error(err);
        setError("Server error, please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const nameMatch = filters.name
        ? (u.fullName || u.name || "")
            .toLowerCase()
            .includes(filters.name.toLowerCase())
        : true;
      const roleMatch = filters.role ? u.role === filters.role : true;
      const degree = (u.profile && u.profile.degree) || u.degree || "";
      const batch = (u.profile && u.profile.batch) || u.batch || "";
      const degreeMatch = filters.degree
        ? degree.toLowerCase().includes(filters.degree.toLowerCase())
        : true;
      const batchMatch = filters.batch
        ? batch.toLowerCase().includes(filters.batch.toLowerCase())
        : true;
      return nameMatch && roleMatch && degreeMatch && batchMatch;
    });
  }, [users, filters]);

  if (loading) return <div className="loader">Loading users...</div>;
  if (error) return <div className="error">{error}</div>;

  const total = users.length;
  const visible = filteredUsers.length;

  return (
    <div className="users-container">
      <div className="users-header-row">
        <h1>👥 Registered Users</h1>
        <div className="subtle">
          Showing {visible} of {total} users
        </div>
      </div>

      <div className="admin-filters">
        <input
          placeholder="Search name..."
          value={filters.name}
          onChange={(e) => setFilters((p) => ({ ...p, name: e.target.value }))}
        />
        <select
          value={filters.role}
          onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value }))}
        >
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="alumni">Alumni</option>
          <option value="admin">Admin</option>
        </select>
        <input
          placeholder="Degree"
          value={filters.degree}
          onChange={(e) =>
            setFilters((p) => ({ ...p, degree: e.target.value }))
          }
        />
        <input
          placeholder="Batch"
          value={filters.batch}
          onChange={(e) => setFilters((p) => ({ ...p, batch: e.target.value }))}
        />
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th style={{ width: 80 }}>Profile</th>
            <th style={{ textAlign: "left" }}>Name & Email</th>
            <th>Role</th>
            <th style={{ textAlign: "left" }}>Details</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => {
            const degree =
              (user.profile && user.profile.degree) || user.degree || "-";
            const spec =
              (user.profile && user.profile.specialization) ||
              user.specialization ||
              "-";
            const batch =
              (user.profile && user.profile.batch) || user.batch || "-";

            const apiBase = import.meta.env.VITE_API_BASE_URL || "";
            const apiRoot = apiBase.replace(/\/api\/?$/i, "");

            const resolvePic = (val) => {
              if (!val) return null;
              if (val.startsWith("http")) return val;
              if (val.startsWith("/")) return `${apiRoot}${val}`;
              // if it's already contains uploads path, join with root
              if (val.includes("/uploads/"))
                return `${apiRoot}/${val}`.replace(/([^:]\/)\//g, "$1");
              // otherwise assume it's just a filename
              return `${apiRoot}/uploads/${val}`;
            };

            const pic =
              resolvePic(user.profile && user.profile.profilePicture) ||
              resolvePic(user.profilePicture) ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

            // prepare image candidate urls to try when loading fails
            const origVal = (user.profile && user.profile.profilePicture) || user.profilePicture || null;
            const makeCandidates = (val) => {
              if (!val) return [];
              const list = [];
              if (val.startsWith("http")) list.push(val);
              if (val.startsWith("/")) list.push(`${apiRoot}${val}`);
              if (val.includes("/uploads/")) list.push(`${apiRoot}/${val}`.replace(/([^:]\/)\//g, "$1"));
              // strip leading slashes or uploads/ prefix
              const filename = val.replace(/^\/+/, "").replace(/^uploads\//, "");
              list.push(`${apiRoot}/uploads/${filename}`);
              // raw val as last attempt
              list.push(val);
              return Array.from(new Set(list));
            };

            const candidates = makeCandidates(origVal);

            return (
              <tr key={user._id}>
                <td>
                  <img
                    src={pic}
                    alt="Profile"
                    className="profile-img"
                    data-candidates={JSON.stringify(candidates)}
                    data-try={0}
                    onError={(e) => {
                      try {
                        const c = JSON.parse(e.target.dataset.candidates || '[]');
                        let idx = parseInt(e.target.dataset.try || '0', 10);
                        if (idx < c.length) {
                          e.target.dataset.try = idx + 1;
                          e.target.src = c[idx];
                        } else {
                          e.target.onerror = null;
                          e.target.src = '/default-avatar.png';
                        }
                      } catch (err) {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                      }
                    }}
                  />
                </td>

                <td style={{ textAlign: "left" }}>
                  <div className="user-name">{user.fullName || user.name}</div>
                  <div className="user-email">{user.email}</div>
                </td>

                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role}
                  </span>
                </td>

                <td style={{ textAlign: "left" }}>
                  {user.role === "student" ? (
                    <>
                      <div className="detail-row">
                        <strong>Degree:</strong> {degree}
                      </div>
                      <div className="detail-row">
                        <strong>Specialization:</strong> {spec}
                      </div>
                      <div className="detail-row">
                        <strong>Batch:</strong> {batch}
                      </div>
                    </>
                  ) : user.role === "alumni" ? (
                    (() => {
                      const jobTitle = (user.profile && user.profile.jobTitle) || user.jobTitle || "-";
                      const company = (user.profile && user.profile.company) || user.company || "-";
                      const locObj = (user.profile && user.profile.location) || user.location || null;
                      let locationStr = "-";
                      if (locObj) {
                        if (typeof locObj === "string") locationStr = locObj;
                        else {
                          const parts = [locObj.city, locObj.state, locObj.country].filter(Boolean);
                          locationStr = parts.length ? parts.join(", ") : "-";
                        }
                      }

                      return (
                        <>
                          <div className="detail-row clamp-2">
                            <strong>Job Title:</strong> {jobTitle}
                          </div>
                          <div className="detail-row clamp-2">
                            <strong>Company:</strong> {company}
                          </div>
                          <div className="detail-row clamp-2">
                            <strong>Location:</strong> {locationStr}
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <div className="muted">Not applicable</div>
                  )}
                </td>

                <td>
                  {user.role === "alumni" ? (
                    <Link to={`/alumni/${user._id}`} className="view-btn">
                      View
                    </Link>
                  ) : user.role === "student" ? (
                    <Link to={`/student/${user._id}`} className="view-btn">
                      View
                    </Link>
                  ) : user.role === "admin" ? (
                    // admins: link to admin user detail/manage page
                    <Link to={`/admin/users/${user._id}`} className="view-btn">
                      View
                    </Link>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
