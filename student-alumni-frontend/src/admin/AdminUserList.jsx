import { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminUserList.css';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const token = localStorage.getItem('token'); // or from AuthContext

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      alert('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setEditData({ ...user });
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/admin/users/${editingId}`,
        editData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUsers(users.map((u) => (u._id === editingId ? res.data : u)));
      setEditingId(null);
    } catch (err) {
      alert('Update failed');
    }
  };

  return (
    <div className="admin-users-container">
      <h2>Manage Users</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Bio</th>
            <th>Job Title</th>
            <th>Company</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) =>
            editingId === u._id ? (
              <tr key={u._id}>
                <td><input name="name" value={editData.name} onChange={handleChange} /></td>
                <td><input name="email" value={editData.email} onChange={handleChange} /></td>
                <td>
                  <select name="role" value={editData.role} onChange={handleChange}>
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td><input name="bio" value={editData.bio} onChange={handleChange} /></td>
                <td><input name="jobTitle" value={editData.jobTitle} onChange={handleChange} /></td>
                <td><input name="company" value={editData.company} onChange={handleChange} /></td>
                <td>
                  <button onClick={handleSave}>💾 Save</button>
                  <button onClick={() => setEditingId(null)}>❌ Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.bio}</td>
                <td>{u.jobTitle}</td>
                <td>{u.company}</td>
                <td>
                  <button onClick={() => handleEdit(u)}>✏️ Edit</button>
                  <button onClick={() => handleDelete(u._id)}>🗑️ Delete</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserList;
