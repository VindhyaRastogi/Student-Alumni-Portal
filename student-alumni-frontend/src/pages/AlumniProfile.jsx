import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AlumniProfile.css";

const AlumniProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // initialize fullName/email from localStorage if available so fields show immediately
  const storedUserInitial = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      return null;
    }
  })();

  const [formData, setFormData] = useState({
    fullName: storedUserInitial?.fullName || "",
    email: storedUserInitial?.email || "",
    gender: "",
    degrees: [{ degree: "", specialization: "", institute: "", batch: "" }],
    linkedin: "",
    phone: "",
    jobTitle: "",
    company: "",
    location: {
      city: "",
      state: "",
      country: "",
    },
    areasOfInterest: "",
    hoursPerWeek: "",
    menteesCapacity: "",
    preferredContact: "",
    profilePicture: null,
  });

  const [previewImage, setPreviewImage] = useState(null);

  // Fetch existing profile (for edit mode)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/alumni/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data) {
          setFormData((prev) => ({
            ...prev,
            ...res.data,
            degrees: res.data.degrees?.length ? res.data.degrees : prev.degrees,
            location: res.data.location || prev.location,
          }));

          if (res.data.profilePicture) {
            // build correct preview URL — strip trailing /api from base if present
            const apiBase = import.meta.env.VITE_API_BASE_URL || "";
            const apiRoot = apiBase.replace(/\/api\/?$/i, "");
            setPreviewImage(`${apiRoot}/uploads/${res.data.profilePicture}`);
          }
        }
      } catch (err) {
        console.error(
          "Error fetching profile:",
          err.response?.data || err.message
        );
      }
    };

    fetchProfile();
  }, []);

  // Pre-fill name and email if not already filled
  useEffect(() => {
    // prefer value from context user, but fallback to localStorage 'user' (registration saved there)
    const stored = localStorage.getItem("user");
    const storedUser = stored ? JSON.parse(stored) : null;
    const src = user || storedUser;
    if (src) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || src.fullName || "",
        email: prev.email || src.email || "",
      }));
    }
  }, [user]);

  // cleanup for object URL used in previewImage to avoid leaking and flicker
  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(previewImage);
        } catch (e) {
          // ignore
        }
      }
    };
  }, [previewImage]);

  const handleChange = (e, index = null) => {
    const { name, value, files } = e.target;

    if (name === "profilePicture") {
      const file = files[0];
      // revoke previous object URL if any
      if (previewImage && previewImage.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(previewImage);
        } catch (e) {}
      }
      setFormData((prev) => ({ ...prev, profilePicture: file }));
      if (file) setPreviewImage(URL.createObjectURL(file));
    } else if (["city", "state", "country"].includes(name)) {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [name]: value,
        },
      });
    } else if (index !== null) {
      const newDegrees = [...formData.degrees];
      newDegrees[index][name] = value;
      setFormData({ ...formData, degrees: newDegrees });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addDegree = () => {
    setFormData({
      ...formData,
      degrees: [
        ...formData.degrees,
        { degree: "", specialization: "", institute: "", batch: "" },
      ],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "location") {
          Object.keys(formData.location).forEach((locKey) =>
            formToSend.append(`location[${locKey}]`, formData.location[locKey])
          );
        } else if (key === "degrees") {
          formData.degrees.forEach((deg, idx) => {
            formToSend.append(`degrees[${idx}][degree]`, deg.degree);
            formToSend.append(
              `degrees[${idx}][specialization]`,
              deg.specialization
            );
            formToSend.append(`degrees[${idx}][institute]`, deg.institute);
            formToSend.append(`degrees[${idx}][batch]`, deg.batch);
          });
        } else if (key === "profilePicture" && formData.profilePicture) {
          formToSend.append("profilePicture", formData.profilePicture);
        } else {
          formToSend.append(key, formData[key]);
        }
      });

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/alumni/profile`,
        formToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const saved = res.data;
      // for debugging: log saved object
      console.debug("Saved alumni profile:", saved);

      alert("Profile saved successfully!");
      // pass saved profile to view so it can render immediately without waiting for fetch
      navigate("/alumni/view-profile", { state: { profile: saved } });
    } catch (err) {
      console.error("Profile save failed:", err.response?.data || err.message);
      alert("Failed to save profile. Try again.");
    }
  };

  return (
    <div className="profile-container">
      <h2>Alumni Profile</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          value={formData.fullName}
          readOnly
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          readOnly
        />

        <label htmlFor="gender">Gender</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </select>

        {/* Degrees Section */}
        <h3>Academic Qualifications</h3>
        {formData.degrees.map((deg, index) => (
          <div key={index} className="degree-block">
            <label htmlFor={`degree-${index}`}>Degree</label>
            <input
              id={`degree-${index}`}
              type="text"
              name="degree"
              placeholder="e.g., B.Tech, MBA"
              value={deg.degree}
              onChange={(e) => handleChange(e, index)}
              required
            />

            <label htmlFor={`specialization-${index}`}>Specialization</label>
            <input
              id={`specialization-${index}`}
              type="text"
              name="specialization"
              placeholder="e.g., CSE, Finance"
              value={deg.specialization}
              onChange={(e) => handleChange(e, index)}
              required
            />

            <label htmlFor={`institute-${index}`}>Institute</label>
            <input
              id={`institute-${index}`}
              type="text"
              name="institute"
              placeholder="e.g., IIIT-Delhi"
              value={deg.institute}
              onChange={(e) => handleChange(e, index)}
              required
            />

            <label htmlFor={`batch-${index}`}>Batch (Graduation Year)</label>
            <input
              id={`batch-${index}`}
              type="text"
              name="batch"
              placeholder="e.g., 2020"
              value={deg.batch}
              onChange={(e) => handleChange(e, index)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addDegree}>
          + Add Another Degree
        </button>

        {/* Areas of Interest (open-ended) */}
        <label htmlFor="areasOfInterest">Areas of Interest</label>
        <input
          id="areasOfInterest"
          name="areasOfInterest"
          value={formData.areasOfInterest}
          onChange={handleChange}
          placeholder="e.g., AI/ML, Data Engineering"
        />

        {/* Mentorship Availability */}
        <label htmlFor="hoursPerWeek">Hours per Week for Mentorship</label>
        <input
          id="hoursPerWeek"
          type="number"
          name="hoursPerWeek"
          value={formData.hoursPerWeek}
          onChange={handleChange}
          placeholder="e.g., 5"
        />

        <label htmlFor="menteesCapacity">
          Number of Mentees You Can Mentor
        </label>
        <input
          id="menteesCapacity"
          type="number"
          name="menteesCapacity"
          value={formData.menteesCapacity}
          onChange={handleChange}
          placeholder="e.g., 3"
        />

        {/* Contact Preference */}
        <label htmlFor="preferredContact">How can students contact you?</label>
        <select
          id="preferredContact"
          name="preferredContact"
          value={formData.preferredContact}
          onChange={handleChange}
          required
        >
          <option value="">Select Contact Method</option>
          <option value="Email">Email</option>
          <option value="Phone">Phone</option>
          <option value="LinkedIn">LinkedIn</option>
        </select>

        {/* Conditional contact fields */}
        {formData.preferredContact === "Phone" && (
          <>
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., +91-98765xxxxx"
            />
          </>
        )}

        {formData.preferredContact === "LinkedIn" && (
          <>
            <label htmlFor="linkedin">LinkedIn URL</label>
            <input
              id="linkedin"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://www.linkedin.com/in/your-profile"
            />
          </>
        )}

        {/* Work Info */}
        <label htmlFor="jobTitle">Current Job Title</label>
        <input
          id="jobTitle"
          type="text"
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleChange}
        />

        <label htmlFor="company">Company Name</label>
        <input
          id="company"
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
        />

        {/* Location */}
        <label htmlFor="city">City</label>
        <input
          id="city"
          type="text"
          name="city"
          value={formData.location.city}
          onChange={handleChange}
        />

        <label htmlFor="state">State</label>
        <input
          id="state"
          type="text"
          name="state"
          value={formData.location.state}
          onChange={handleChange}
        />

        <label htmlFor="country">Country</label>
        <input
          id="country"
          type="text"
          name="country"
          value={formData.location.country}
          onChange={handleChange}
        />

        {/* Profile Picture */}
        <label htmlFor="profilePicture">Profile Picture</label>
        <input
          id="profilePicture"
          type="file"
          name="profilePicture"
          accept="image/*"
          onChange={handleChange}
        />
        {previewImage && (
          <div className="profile-picture">
            <img
              src={previewImage}
              alt="Profile"
              onError={(e) => {
                e.target.src = "/default-avatar.svg"; // fallback if broken
              }}
            />
          </div>
        )}

        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
};

export default AlumniProfile;
