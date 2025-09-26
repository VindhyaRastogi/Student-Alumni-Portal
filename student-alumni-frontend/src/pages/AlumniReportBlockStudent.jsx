// src/pages/AlumniReportBlockStudent.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Report.css";

const AlumniReportBlockStudent = () => {
  const { studentId } = useParams(); // student ID from route
  const navigate = useNavigate();
  const [action, setAction] = useState("report");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (action === "report") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/reports/alumni-report`,
          { studentId, reason, details },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        alert("Report submitted successfully!");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/reports/alumni-block`,
          { studentId, reason },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        alert("Student blocked successfully!");
      }
      navigate("/alumni/dashboard");
    } catch (error) {
      console.error(error);
      alert("Action failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-container">
      <h2>Report or Block Student</h2>
      <form onSubmit={handleSubmit} className="report-form">
        <label>Action:</label>
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="report">Report Student</option>
          <option value="block">Block Student</option>
        </select>

        <label>Reason:</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} required>
          <option value="">Select reason</option>
          <option value="Misconduct">Misconduct</option>
          <option value="Spam">Spam</option>
          <option value="Abusive Language">Abusive Language</option>
          <option value="Other">Other</option>
        </select>

        {action === "report" && (
          <>
            <label>Additional Details (optional):</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide more details..."
            />
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : action === "report" ? "Submit Report" : "Block Student"}
        </button>
      </form>
    </div>
  );
};

export default AlumniReportBlockStudent;
