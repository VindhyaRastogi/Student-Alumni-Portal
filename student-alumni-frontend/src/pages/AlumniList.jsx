import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AlumniList.css";

const AlumniList = () => {
  const [alumni, setAlumni] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    jobTitle: "",
    company: "",
    areasOfInterest: "",
    location: "",
  });

  // Fetch alumni
  const fetchAlumni = async () => {
  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    console.log("Requesting:", `${baseURL}/users/alumni`, filters);

    const token = localStorage.getItem("token");

    const { data } = await axios.get(`${baseURL}/users/alumni`, {
      params: filters,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    setAlumni(data);
  } catch (error) {
    console.error("Error fetching alumni:", error);
  }
};


  useEffect(() => {
    fetchAlumni();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilter = () => {
    fetchAlumni();
  };

  return (
    <div className="alumni-list-container">
      <h2>Alumni Directory</h2>

      {/* 🔹 Filter Section */}
      <div className="filter-section">
        <input type="text" name="name" placeholder="Search by name" onChange={handleChange} />
        <input type="text" name="jobTitle" placeholder="Job Title" onChange={handleChange} />
        <input type="text" name="company" placeholder="Company" onChange={handleChange} />
        <input type="text" name="areasOfInterest" placeholder="Area of Interest" onChange={handleChange} />
        <input type="text" name="location" placeholder="Location" onChange={handleChange} />
        <button onClick={handleFilter}>Apply Filters</button>
      </div>

      {/* 🔹 Alumni List */}
      <div className="alumni-list">
        {alumni.length > 0 ? (
          alumni.map((alum) => (
            <div key={alum._id} className="alumni-card">
              <img
                src={alum.profilePicture || "https://via.placeholder.com/100"}
                alt={alum.fullName}
              />
              <h3>{alum.fullName}</h3>
              <p>{alum.jobTitle} at {alum.company}</p>
              <p>{alum.location}</p>
              <p><strong>Interests:</strong> {alum.areasOfInterest?.join(", ")}</p>
            </div>
          ))
        ) : (
          <p>No alumni found.</p>
        )}
      </div>
    </div>
  );
};

export default AlumniList;
