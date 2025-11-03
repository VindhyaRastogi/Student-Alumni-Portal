import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./AlumniList.css";

const StudentList = () => {
  const [filters, setFilters] = useState({
    name: "",
    degree: "",
    batch: "",
    areaOfInterest: "",
  });
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/users/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: filters,
        }
      );
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  return (
    <div className="alumni-list-container">
      <h2>Explore Students</h2>

      <form onSubmit={handleSearch} className="filter-form">
        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="degree" placeholder="Degree" onChange={handleChange} />
        <input name="batch" placeholder="Batch" onChange={handleChange} />
        <input
          name="areaOfInterest"
          placeholder="Area Of Interest"
          onChange={handleChange}
        />
        <button type="submit">Search</button>
      </form>

      <div className="alumni-cards">
        {students.map((s) => {
          const apiBase = import.meta.env.VITE_API_BASE_URL || "";
          const apiRoot = apiBase.replace(/\/api\/?$/i, "");

          // backend may return profilePicture either as full path or relative; handle both
          let imgSrc = "/default-avatar.png";
          if (s.profile && s.profile.profilePicture) {
            const pic = s.profile.profilePicture;
            imgSrc = pic.startsWith("http") ? pic : `${apiRoot}${pic}`;
          } else if (s.profilePicture) {
            imgSrc = s.profilePicture.startsWith("http")
              ? s.profilePicture
              : `${apiRoot}/uploads/${s.profilePicture}`;
          }

          return (
            <div className="alumni-card" key={s._id}>
              <img src={imgSrc} alt={s.fullName || s.name} />
              <h3>{s.fullName || s.name}</h3>
              <p>
                <strong>Degree:</strong> {s.profile?.degree || s.degree || "-"}
              </p>
              <p>
                <strong>Batch:</strong> {s.profile?.batch || s.batch || "-"}
              </p>
              <p>
                <strong>Interests:</strong>{" "}
                {s.profile?.areaOfInterest || s.areaOfInterest || "-"}
              </p>
              <Link to={`/student/${s._id}`}>View Profile</Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentList;
