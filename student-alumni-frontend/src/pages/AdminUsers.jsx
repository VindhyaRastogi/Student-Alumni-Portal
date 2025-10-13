// src/pages/admin/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import "./AdminUsers.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/users`);
        const data = await response.json();
        if (response.ok) {
          setUsers(data);
        } else {
          setError(data.message || "Failed to fetch users");
        }
      } catch (err) {
        setError("Server error, please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="loader">Loading users...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="users-container">
      <h1>👥 Registered Users</h1>
      <table className="users-table">
        <thead>
          <tr>
            <th>Profile</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Degree</th>
            <th>Specialization</th>
            <th>Batch</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>
                <img
                  src={user.profilePicture || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                  alt="Profile"
                  className="profile-img"
                />
              </td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.degree || "-"}</td>
              <td>{user.specialization || "-"}</td>
              <td>{user.batch || "-"}</td>
              <td>
                <a href={`/alumni/${user._id}`} className="view-btn">
                  View Profile
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
