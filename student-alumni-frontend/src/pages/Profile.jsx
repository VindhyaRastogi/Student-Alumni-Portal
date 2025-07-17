import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const token = user?.token;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        setFormData({
          bio: res.data.bio || '',
          jobTitle: res.data.jobTitle || '',
          company: res.data.company || '',
          profilePicture: res.data.profilePicture || '',
          degree: res.data.degree || '',
          specialization: res.data.specialization || '',
          batch: res.data.batch || '',
          organization: res.data.organization || '',
          workRole: res.data.workRole || '',
          city: res.data.city || '',
          state: res.data.state || '',
          country: res.data.country || ''
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        alert('Failed to load profile');
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/users/update`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    }
  };

  if (!profile) return <p className="loading-text">Loading...</p>;

  const specializationOptions = {
    'B.Tech': [
      'Computer Science & Engineering',
      'Electronics and Communications Engineering',
      'Computer Science and Applied Mathematics',
      'Computer Science and Design',
      'Computer Science and Social Sciences',
      'Computer Science and Biosciences'
    ],
    'M.Tech': ['Bioscience', 'ECE', 'Data Science'],
    'Ph.D': ['CSE', 'Bioscience', 'Physics']
  };

  return (
    <div className="profile-card">
      <div className="profile-header">
        <img
          src={profile.profilePicture || '/default-profile.png'}
          alt="Profile"
          className="profile-img"
        />
        <h2>{profile.name}</h2>
        <p className="profile-role">{profile.role}</p>
      </div>

      <form onSubmit={handleUpdate} className="profile-form">
        {/* Bio Section */}
        <h3>About</h3>
        <textarea
          name="bio"
          value={formData.bio}
          placeholder="Short Bio"
          onChange={handleChange}
        />

        {/* Alumni-Specific Fields */}
        {profile.role === 'alumni' && (
          <>
            <h3>Work Info</h3>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              placeholder="Job Title"
              onChange={handleChange}
            />
            <input
              type="text"
              name="company"
              value={formData.company}
              placeholder="Company"
              onChange={handleChange}
            />

            <h3>Profile Image</h3>
            <input
              type="text"
              name="profilePicture"
              value={formData.profilePicture}
              placeholder="Profile Picture URL"
              onChange={handleChange}
            />

            <h3>Academic Info</h3>
            <select name="degree" value={formData.degree} onChange={handleChange}>
              <option value="">Select Degree</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="Ph.D">Ph.D</option>
            </select>

            {formData.degree && (
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
              >
                <option value="">Select Specialization</option>
                {specializationOptions[formData.degree]?.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            )}
            <input
              type="text"
              name="batch"
              value={formData.batch}
              placeholder="Batch (e.g. 2019–2023)"
              onChange={handleChange}
            />

            <h3>Current Organization</h3>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              placeholder="Organization"
              onChange={handleChange}
            />
            <input
              type="text"
              name="workRole"
              value={formData.workRole}
              placeholder="Work Role"
              onChange={handleChange}
            />

            <h3>Location Info</h3>
            <input
              type="text"
              name="city"
              value={formData.city}
              placeholder="City"
              onChange={handleChange}
            />
            <input
              type="text"
              name="state"
              value={formData.state}
              placeholder="State"
              onChange={handleChange}
            />
            <input
              type="text"
              name="country"
              value={formData.country}
              placeholder="Country"
              onChange={handleChange}
            />
          </>
        )}

        <button type="submit" className="save-btn">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;
