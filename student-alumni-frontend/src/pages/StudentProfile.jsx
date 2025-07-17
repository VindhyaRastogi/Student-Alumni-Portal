import { useEffect, useState } from 'react'; 
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const StudentProfile = () => {
  const { user } = useAuth();
  const token = user?.token;

  const [profile, setProfile] = useState(null);
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
      setPreviewUrl(res.data.profilePicture || '');
    } catch (err) {
      console.error('Error fetching student profile:', err);
      alert('Failed to load student profile');
    }
  };

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
      data.append('profilePicture', profilePicture);
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/users/update`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setProfile(res.data);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
    CSE: [
      'Artificial Intelligence',
      'Data Engineering',
      'Information Security',
      'Mobile Computing',
      'Without Specialization'
    ],
    ECE: [
      'VLSI & Embedded Systems',
      'Communication',
      'Machine Learning',
      'Without Specialization'
    ]
  };

  return (
    <div className="profile-container">
      <h2>Student Profile</h2>

      {/* Personal Info */}
      <h3>Personal Information</h3>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Role:</strong> {profile.role}</p>

      {/* Profile Picture */}
      {previewUrl && (
        <div style={{ marginBottom: '1rem' }}>
          <img
            src={previewUrl}
            alt="Profile"
            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>
      )}

      <form onSubmit={handleUpdate} encType="multipart/form-data">
        {/* Section: Profile Picture Upload */}
        <h3>Update Profile Picture</h3>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={handleImageChange}
        />

        {/* Section: Academic Details */}
<h3>Academic Information</h3>

{/* Degree Selection */}
<h4>Degree</h4>
<select name="degree" value={formData.degree} onChange={handleChange}>
  <option value="">Select Degree</option>
  <option value="B.Tech">B.Tech</option>
  <option value="M.Tech">M.Tech</option>
  <option value="Ph.D">Ph.D</option>
</select>

{/* Branch Selection */}
{formData.degree && (
  <>
    <h4>Branch</h4>
    <select name="branch" value={formData.branch} onChange={handleChange}>
      <option value="">Select Branch</option>
      {branchOptions[formData.degree]?.map((b) => (
        <option key={b} value={b}>{b}</option>
      ))}
    </select>
  </>
)}

{/* Specialization (only for M.Tech CSE/ECE) */}
{formData.degree === 'M.Tech' && (formData.branch === 'CSE' || formData.branch === 'ECE') && (
  <>
    <h4>Specialization</h4>
    <select name="specialization" value={formData.specialization} onChange={handleChange}>
      <option value="">Select Specialization</option>
      {specializationOptions[formData.branch]?.map((spec) => (
        <option key={spec} value={spec}>{spec}</option>
      ))}
    </select>
  </>
)}

{/* Semester */}
<h4>Semester</h4>
<input
  type="text"
  name="semester"
  placeholder="Semester (e.g., 5)"
  value={formData.semester}
  onChange={handleChange}
/>

{/* Year */}
<h4>Year</h4>
<input
  type="text"
  name="year"
  placeholder="Year (e.g., 3rd)"
  value={formData.year}
  onChange={handleChange}
/>

{/* Batch */}
<h4>Batch</h4>
<input
  type="text"
  name="batch"
  placeholder="Batch (e.g., 2021–2025)"
  value={formData.batch}
  onChange={handleChange}
/>

        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default StudentProfile;
