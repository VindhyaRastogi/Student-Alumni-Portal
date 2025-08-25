import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ViewAlumniProfile.css';

const ViewAlumniProfile = () => {
  const { id } = useParams();
  const [alumni, setAlumni] = useState(null);

  useEffect(() => {
    axios.get(`/api/alumni/${id}`)
      .then(res => setAlumni(res.data))
      .catch(err => console.error('Error fetching alumni profile:', err));
  }, [id]);

  if (!alumni) return <p>Loading...</p>;

  return (
    <div className="alumni-profile-card">
      <img src={alumni.profilePicture} alt="Profile" />
      <h2>{alumni.name}</h2>
      <p><strong>Email:</strong> {alumni.email}</p>
      <p><strong>Degree:</strong> {alumni.degree} ({alumni.specialization})</p>
      <p><strong>Batch:</strong> {alumni.batch}</p>
      <p><strong>Job Title:</strong> {alumni.jobTitle}</p>
      <p><strong>Organization:</strong> {alumni.organization}</p>
      <p><strong>Location:</strong> {alumni.location?.city}, {alumni.location?.state}, {alumni.location?.country}</p>
      <p><strong>LinkedIn:</strong> <a href={alumni.linkedin} target="_blank">{alumni.linkedin}</a></p>
    </div>
  );
};

export default ViewAlumniProfile;
