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

          const resolvePic = (val) => {
            if (!val) return null;
            if (val.startsWith("http")) return val;
            if (val.startsWith("/")) return `${apiRoot}${val}`;
            if (val.includes("/uploads/"))
              return `${apiRoot}/${val}`.replace(/([^:]\/)\//g, "$1");
            return `${apiRoot}/uploads/${val}`;
          };

          const cand = s.profile?.profilePicture || s.profilePicture || null;
          let imgSrc = resolvePic(cand) || "/default-avatar.svg";
          try {
            const t =
              (s.profile && s.profile._updatedAt) || s.updatedAt || null;
            const tm = t ? new Date(t).getTime() : null;
            if (tm && imgSrc && !imgSrc.includes("default-avatar")) {
              imgSrc = `${imgSrc}${imgSrc.includes("?") ? "&" : "?"}v=${tm}`;
            }
          } catch (err) {}

          return (
            <div className="alumni-card" key={s._id}>
              <img
                src={imgSrc}
                alt={s.fullName || s.name}
                onError={(e) => {
                  try {
                    e.target.onerror = null;
                  } catch (err) {}
                  e.target.src = "/default-avatar.svg";
                }}
              />
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
