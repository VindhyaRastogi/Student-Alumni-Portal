import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css'; // You can reuse the existing profile styling

const StudentProfile = () => {
  const { user } = useAuth();
  const token = user?.token;

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    bio: '',
    branch: '',
    graduationYear: ''
  });

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile(res.data);
      setFormData({
        bio: res.data.bio || '',
        branch: res.data.branch || '',
        graduationYear: res.data.graduationYear || ''
      });
    } catch (err) {
      console.error('Error fetching student profile:', err);
      alert('Failed to load student profile');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/users/update`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile(res.data);
      alert('Student profile updated successfully!');
    } catch (err) {
      console.error('Error updating student profile:', err);
      alert('Failed to update student profile');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <h2>Student Profile</h2>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Role:</strong> {profile.role}</p>

      <form onSubmit={handleUpdate}>
        <textarea
          name="bio"
          placeholder="Bio"
          value={formData.bio}
          onChange={handleChange}
        />
        <input
          type="text"
          name="branch"
          placeholder="Branch (e.g., CSE, ECE)"
          value={formData.branch}
          onChange={handleChange}
        />
        <input
          type="text"
          name="graduationYear"
          placeholder="Graduation Year (e.g., 2026)"
          value={formData.graduationYear}
          onChange={handleChange}
        />
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default StudentProfile;
