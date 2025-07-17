import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const StudentProfile = () => {
  const { user } = useAuth();
  const token = user?.token;

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    degree: '',
    branch: '',
    specialization: '',
    semester: '',
    year: '',
    batch: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile(res.data);
      setFormData({
        degree: res.data.degree || '',
        branch: res.data.branch || '',
        specialization: res.data.specialization || '',
        semester: res.data.semester || '',
        year: res.data.year || '',
        batch: res.data.batch || ''
      });
      setPreviewUrl(`${import.meta.env.VITE_API_BASE_URL}${res.data.profilePicture}`);
    } catch (err) {
      console.error('Error fetching student profile:', err);
      alert('Failed to load student profile');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert('Only .jpg and .png files are allowed');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      if (profilePicture) {
        data.append('profilePicture', profilePicture);
      }
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/users/update`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setProfile(res.data);
      alert('✅ Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('❌ Error updating profile:', err.response?.data || err.message);
      alert(`❌ Failed to update profile: ${err.response?.data?.message || err.message}`);
    }
  };

  if (!profile) return <p>Loading...</p>;

  const branchOptions = {
    'B.Tech': [
      'Computer Science & Engineering',
      'Electronics and Communications Engineering',
      'Computer Science and Applied Mathematics',
      'Computer Science and Design',
      'Computer Science and Social Sciences',
      'Computer Science and Biosciences',
      'Computer Science and Artificial Intelligence',
      'Electronics and VLSI Engineering',
      'Computer Science and Economics'
    ],
    'M.Tech': ['CSE', 'CSE-Research', 'ECE', 'CB'],
    'Ph.D': [
      'Computational Biology (CB)',
      'Computer Science and Engineering (CSE)',
      'Electronics and Communications Engineering (ECE)',
      'Human Centered and Design (HCD)',
      'Mathematics (Maths)',
      'Social Sciences and Humanities (SSH)'
    ]
  };

  const specializationOptions = {
    CSE: ['Artificial Intelligence', 'Data Engineering', 'Information Security', 'Mobile Computing', 'Without Specialization'],
    ECE: ['VLSI & Embedded Systems', 'Communication', 'Machine Learning', 'Without Specialization']
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Your Profile</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="edit-button">Edit Profile</button>
        )}
      </div>

      {/* Profile Card */}
      {!isEditing ? (
        <div className="profile-card">
  {previewUrl && (
    <img src={previewUrl} alt="Profile" className="profile-picture" />
  )}
  <p><strong>Name:</strong> {profile.name}</p>
  <p><strong>Email:</strong> {profile.email}</p>
  <p><strong>Role:</strong> {profile.role}</p>
  <p><strong>Degree:</strong> {profile.degree}</p>
  <p><strong>Branch:</strong> {profile.branch}</p>
  <p><strong>Specialization:</strong> {profile.specialization}</p>
  <p><strong>Semester:</strong> {profile.semester}</p>
  <p><strong>Year:</strong> {profile.year}</p>
  <p><strong>Batch:</strong> {profile.batch}</p>

  {!isEditing && (
    <button onClick={() => setIsEditing(true)} className="edit-button">
      Edit
    </button>
  )}
</div>

      ) : (
        // Edit Form
        <form onSubmit={handleUpdate} encType="multipart/form-data">
          <h3>Update Profile Picture</h3>
          <input type="file" accept=".jpg,.jpeg,.png" onChange={handleImageChange} />
          
          <h3>Academic Information</h3>
          <label>Degree</label>
          <select name="degree" value={formData.degree} onChange={handleChange}>
            <option value="">Select Degree</option>
            <option value="B.Tech">B.Tech</option>
            <option value="M.Tech">M.Tech</option>
            <option value="Ph.D">Ph.D</option>
          </select>

          {formData.degree && (
            <>
              <label>Branch</label>
              <select name="branch" value={formData.branch} onChange={handleChange}>
                <option value="">Select Branch</option>
                {branchOptions[formData.degree]?.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </>
          )}

          {formData.degree === 'M.Tech' && (formData.branch === 'CSE' || formData.branch === 'ECE') && (
            <>
              <label>Specialization</label>
              <select name="specialization" value={formData.specialization} onChange={handleChange}>
                <option value="">Select Specialization</option>
                {specializationOptions[formData.branch]?.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </>
          )}

          <label>Semester</label>
          <input type="text" name="semester" value={formData.semester} onChange={handleChange} />

          <label>Year</label>
          <input type="text" name="year" value={formData.year} onChange={handleChange} />

          <label>Batch</label>
          <input type="text" name="batch" value={formData.batch} onChange={handleChange} />

          <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StudentProfile;
