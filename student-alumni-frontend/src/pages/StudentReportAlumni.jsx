// src/pages/StudentReportAlumni.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Report.css";

const StudentReportAlumni = () => {
  const { alumniId } = useParams(); // alumni ID from route
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/reports/student-report`,
        { alumniId, reason, details },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Report submitted successfully!");
      navigate("/student/dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to submit report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-container">
      <h2>Report Alumni</h2>
      <form onSubmit={handleSubmit} className="report-form">
        <label>Reason for reporting:</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} required>
          <option value="">Select reason</option>
          <option value="Inappropriate Behavior">Inappropriate Behavior</option>
          <option value="Unprofessional Language">Unprofessional Language</option>
          <option value="Harassment">Harassment</option>
          <option value="Other">Other</option>
        </select>

        <label>Additional Details (optional):</label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Provide extra information if needed..."
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
};

export default StudentReportAlumni;
