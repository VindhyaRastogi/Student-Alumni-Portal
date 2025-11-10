import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./StudentProfile.css";

const StudentProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    gender: "",
    degree: "",
    specialization: "",
    batch: "",
    areaOfInterest: "",
    linkedin: "",
    profilePicture: "",
  });

  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  // ✅ Fetch existing profile data on page load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found. Please login again.");
          return;
        }

        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/student/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = res.data.user || res.data;

        // ✅ Fix image URL if needed
        if (data.profilePicture && !data.profilePicture.startsWith("http")) {
          data.profilePicture = `${import.meta.env.VITE_API_BASE_URL.replace(
            "/api",
            ""
          )}${data.profilePicture}`;
        }

        setProfile({
          name: data.name || data.fullName || "",
          email: data.email || "",
          gender: data.gender || "",
          degree: data.degree || "",
          specialization: data.specialization || "",
          batch: data.batch || "",
          areaOfInterest: data.areaOfInterest || "",
          linkedin: data.linkedin || "",
          profilePicture: data.profilePicture || "",
        });

        setPreview(data.profilePicture || null);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Handle text and select changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle image selection + preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev) => ({ ...prev, profilePicture: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again.");
        return;
      }

      const formData = new FormData();
      Object.keys(profile).forEach((key) => {
        formData.append(key, profile[key]);
      });

      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/student/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 200 || res.data.success) {
        // Get the updated profile returned by the backend
        const updated = res.data.user || res.data;

        // If backend returns a relative profilePicture path, convert to absolute URL
        if (
          updated.profilePicture &&
          !updated.profilePicture.startsWith("http")
        ) {
          updated.profilePicture = `${import.meta.env.VITE_API_BASE_URL.replace(
            "/api",
            ""
          )}${updated.profilePicture}`;
        }

        alert("✅ Profile updated successfully!");

        // Navigate back to the profile view and pass the updated profile in state
        navigate("/student/profile", { state: { updatedProfile: updated } });
      } else {
        alert("⚠️ Failed to update profile. Please try again.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error updating profile. Check console for details.");
    }
  };

  // Dropdown data
  const degrees = ["B.Tech", "M.Tech", "Ph.D"];
  const specializations = {
    "B.Tech": ["CSE", "ECE", "EEE", "ME", "CE"],
    "M.Tech": ["CS", "VLSI", "Power Systems", "Thermal", "Structural"],
    "Ph.D": ["Computer Science", "Electrical", "Mechanical", "Civil"],
  };
  const batches = ["2020-2024", "2021-2025", "2022-2026", "2023-2027"];

  return (
    <div className="student-profile-container">
      <h2>Student Profile</h2>

      <form className="student-profile-form" onSubmit={handleSubmit}>
        <div className="profile-pic-section">
          <img
            src={preview || "/default-avatar.svg"}
            alt="Profile Preview"
            className="profile-pic-preview"
          />
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleImageChange}
          />
        </div>

        <div className="form-grid">
          <div>
            <label>Full Name</label>
            <input type="text" name="name" value={profile.name} readOnly />
          </div>

          <div>
            <label>Email</label>
            <input type="email" name="email" value={profile.email} readOnly />
          </div>

          <div>
            <label>Gender</label>
            <select
              name="gender"
              value={profile.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label>Degree</label>
            <select
              name="degree"
              value={profile.degree}
              onChange={handleChange}
            >
              <option value="">Select Degree</option>
              {degrees.map((deg) => (
                <option key={deg} value={deg}>
                  {deg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Specialization</label>
            <select
              name="specialization"
              value={profile.specialization}
              onChange={handleChange}
              disabled={!profile.degree}
            >
              <option value="">Select Specialization</option>
              {profile.degree &&
                specializations[profile.degree]?.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label>Batch</label>
            <select name="batch" value={profile.batch} onChange={handleChange}>
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Area of Interest</label>
            <input
              type="text"
              name="areaOfInterest"
              value={profile.areaOfInterest}
              onChange={handleChange}
              placeholder="e.g. Web Development, AI, IoT"
            />
          </div>

          <div>
            <label>LinkedIn Profile</label>
            <input
              type="url"
              name="linkedin"
              value={profile.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>

        <button type="submit" className="save-btn">
          💾 Save Profile
        </button>
      </form>
    </div>
  );
};

export default StudentProfile;
