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

  // remove/disable a user so they cannot log in anymore
  const removeUser = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this user? They will be prevented from logging in."
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/users/${id}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove user");
      // mark as disabled in UI so admin can re-enable later
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, allowed: false } : u))
      );
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to remove user");
    }
  };

  const enableUser = async (id) => {
    if (!window.confirm("Enable this user to allow login again?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/users/${id}/enable`,
        {
          method: "PATCH",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to enable user");
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, allowed: true } : u))
      );
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to enable user");
    }
  };

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
              "/default-avatar.svg";

            // Prefer the user's updated picture and add a small cache-buster based on updatedAt
            const getAvatar = (u) => {
              const cand =
                (u.profile && u.profile.profilePicture) ||
                u.profilePicture ||
                null;
              const resolved =
                resolvePic(cand) ||
                (u.profile &&
                  u.profile.profilePicture &&
                  String(u.profile.profilePicture)) ||
                null;
              if (!resolved) return "/default-avatar.svg";
              // use updatedAt if available to bust browser cache when profile changes
              try {
                // prefer profile-level updatedAt (from Alumni merge) then user.updatedAt
                const tVal = (u.profile && u.profile._updatedAt) || u.updatedAt;
                const t = tVal ? new Date(tVal).getTime() : null;
                if (t) {
                  return `${resolved}${
                    resolved.includes("?") ? "&" : "?"
                  }v=${t}`;
                }
              } catch (err) {
                // ignore and return resolved
              }
              return resolved;
            };

            const avatarSrc = getAvatar(user);

            // prepare image candidate urls to try when loading fails
            const origVal =
              (user.profile && user.profile.profilePicture) ||
              user.profilePicture ||
              null;
            const makeCandidates = (val) => {
              if (!val) return [];
              const list = [];
              if (val.startsWith("http")) list.push(val);
              if (val.startsWith("/")) list.push(`${apiRoot}${val}`);
              if (val.includes("/uploads/"))
                list.push(`${apiRoot}/${val}`.replace(/([^:]\/)\//g, "$1"));
              // strip leading slashes or uploads/ prefix
              const filename = val
                .replace(/^\/+/, "")
                .replace(/^uploads\//, "");
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
                    src={avatarSrc}
                    alt="Profile"
                    className="profile-img"
                    data-candidates={JSON.stringify(candidates)}
                    data-try={0}
                    onError={(e) => {
                      try {
                        const c = JSON.parse(
                          e.target.dataset.candidates || "[]"
                        );
                        let idx = parseInt(e.target.dataset.try || "0", 10);
                        if (idx < c.length) {
                          e.target.dataset.try = idx + 1;
                          e.target.src = c[idx];
                        } else {
                          e.target.onerror = null;
                          e.target.src = "/default-avatar.svg";
                        }
                      } catch (err) {
                        e.target.onerror = null;
                        e.target.src = "/default-avatar.svg";
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
                      const jobTitle =
                        (user.profile && user.profile.jobTitle) ||
                        user.jobTitle ||
                        "-";
                      const company =
                        (user.profile && user.profile.company) ||
                        user.company ||
                        "-";
                      const locObj =
                        (user.profile && user.profile.location) ||
                        user.location ||
                        null;
                      let locationStr = "-";
                      if (locObj) {
                        if (typeof locObj === "string") locationStr = locObj;
                        else {
                          const parts = [
                            locObj.city,
                            locObj.state,
                            locObj.country,
                          ].filter(Boolean);
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
                  {user.role === "alumni" || user.role === "student" ? (
                    <>
                      <Link
                        to={
                          user.role === "alumni"
                            ? `/alumni/${user._id}`
                            : `/student/${user._id}`
                        }
                        state={{ fromAdmin: true }}
                        className="view-btn"
                      >
                        View
                      </Link>

                      {user.allowed === false ? (
                        <button
                          className="enable-btn"
                          onClick={() => enableUser(user._id)}
                          title="Enable user login"
                        >
                          Enable
                        </button>
                      ) : (
                        <button
                          className="remove-btn"
                          onClick={() => removeUser(user._id)}
                          title="Remove user (prevent login)"
                        >
                          Remove
                        </button>
                      )}
                    </>
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
