import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // ✅ import the context
import './Profile.css';
import axios from 'axios';

const StudentProfile = () => {
  const { user } = useAuth(); // ✅ fetch user from context

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    gender: '',
    phone: '',
    degree: '',
    specialization: '',
    batch: '',
    linkedin: '',
    profilePicture: null,
  });

  const [previewImage, setPreviewImage] = useState(null);

  // ✅ Set name and email from login/registration
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture') {
      setFormData({ ...formData, profilePicture: files[0] });
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const specializationOptions = {
    BTech: ['CSE', 'ECE', 'IT'],
    MTech: ['CSE', 'ECE'],
    PhD: ['CSE', 'ECE', 'Maths']
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem('token');

    const formToSend = new FormData();
    for (const key in formData) {
      if (key === 'profilePicture' && formData.profilePicture) {
        formToSend.append('profilePicture', formData.profilePicture);
      } else {
        formToSend.append(key, formData[key]);
      }
    }

    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/student/profile`,
      formToSend, // ✅ use FormData here
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // ✅ important for FormData
        },
      }
    );

    alert('Profile saved successfully!');
    console.log('Saved profile:', res.data);
  } catch (err) {
    console.error('Full error:', err);
    console.error('Server response:', err.response?.data);
    alert('Failed to save profile. Try again.');
  }
};



 

  return (
     <div className="profile-container">
      <h2>Student Profile</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <label>Full Name</label>
        <input type="text" name="fullName" value={formData.fullName} readOnly />

        <label>Email</label>
        <input type="email" name="email" value={formData.email} readOnly />

        <label>Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </select>

        <label>Phone Number</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />

        <label>Degree</label>
        <select name="degree" value={formData.degree} onChange={handleChange} required>
          <option value="">Select Degree</option>
          <option value="BTech">BTech</option>
          <option value="MTech">MTech</option>
          <option value="PhD">PhD</option>
        </select>

        <label>Specialization</label>
        <select name="specialization" value={formData.specialization} onChange={handleChange} required>
          <option value="">Select Specialization</option>
          {(specializationOptions[formData.degree] || []).map((spec) => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>

        <label>Batch</label>
<select name="batch" value={formData.batch} onChange={handleChange}>
  <option value="">Select Batch</option>
  <option value="2020-2024">2020-2024</option>
  <option value="2021-2025">2021-2025</option>
  <option value="2022-2026">2022-2026</option>
 
</select>
        <label>LinkedIn Profile</label>
        <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} required />

        <label>Profile Picture</label>
        <input type="file" name="profilePicture" accept="image/*" onChange={handleChange} />
        {previewImage && <img src={previewImage} alt="Preview" className="profile-preview" />}

        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
};

export default StudentProfile;
