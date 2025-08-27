import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // ✅ added
import "./Profile.css";

const AlumniProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "",
    degrees: [{ degree: "", specialization: "", institute: "", batch: "" }],
    linkedin: "",
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
            setPreviewImage(
              `${import.meta.env.VITE_API_BASE_URL}/${res.data.profilePicture}`
            );
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
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const handleChange = (e, index = null) => {
    const { name, value, files } = e.target;

    if (name === "profilePicture") {
      setFormData({ ...formData, profilePicture: files[0] });
      setPreviewImage(URL.createObjectURL(files[0]));
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

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/alumni/profile`,
        formToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Profile saved successfully!");
      navigate("/alumni/view-profile"); // ✅ redirect to view page
    } catch (err) {
      console.error("Profile save failed:", err.response?.data || err.message);
      alert("Failed to save profile. Try again.");
    }
  };

  return (
    // <div className="profile-container">
    //   <h2>Alumni Profile</h2>
    //   <form onSubmit={handleSubmit} className="profile-form">
    //     <label>Full Name</label>
    //     <input type="text" name="fullName" value={formData.fullName} readOnly />

    //     <label>Email</label>
    //     <input type="email" name="email" value={formData.email} readOnly />

    //     <label>Gender</label>
    //     <select name="gender" value={formData.gender} onChange={handleChange} required>
    //       <option value="">Select Gender</option>
    //       <option value="Female">Female</option>
    //       <option value="Male">Male</option>
    //       <option value="Other">Other</option>
    //     </select>

    //     {/* Degrees Section */}
    //     <h3>Academic Qualifications</h3>
    //     {formData.degrees.map((deg, index) => (
    //       <div key={index} className="degree-block">
    //         <label>Degree</label>
    //         <input
    //           type="text"
    //           name="degree"
    //           placeholder="e.g., B.Tech, MBA"
    //           value={deg.degree}
    //           onChange={(e) => handleChange(e, index)}
    //           required
    //         />

    //         <label>Specialization</label>
    //         <input
    //           type="text"
    //           name="specialization"
    //           placeholder="e.g., CSE, Finance"
    //           value={deg.specialization}
    //           onChange={(e) => handleChange(e, index)}
    //           required
    //         />

    //         <label>Institute</label>
    //         <input
    //           type="text"
    //           name="institute"
    //           placeholder="e.g., IIIT-Delhi"
    //           value={deg.institute}
    //           onChange={(e) => handleChange(e, index)}
    //           required
    //         />

    //         <label>Batch (Graduation Year)</label>
    //         <input
    //           type="text"
    //           name="batch"
    //           placeholder="e.g., 2020"
    //           value={deg.batch}
    //           onChange={(e) => handleChange(e, index)}
    //           required
    //         />
    //       </div>
    //     ))}
    //     <button type="button" onClick={addDegree}>
    //       + Add Another Degree
    //     </button>

    //     {/* Areas of Interest */}
    //     <label>Areas of Interest</label>
    //     <select
    //       name="areasOfInterest"
    //       value={formData.areasOfInterest}
    //       onChange={handleChange}
    //       required
    //     >
    //       <option value="">Select Interest</option>
    //       <option value="AI/ML">AI/ML</option>
    //       <option value="Data Science">Data Science</option>
    //       <option value="Cybersecurity">Cybersecurity</option>
    //       <option value="Software Development">Software Development</option>
    //       <option value="Entrepreneurship">Entrepreneurship</option>
    //     </select>

    //     {/* Mentorship Availability */}
    //     <label>Hours per Week for Mentorship</label>
    //     <input
    //       type="number"
    //       name="hoursPerWeek"
    //       value={formData.hoursPerWeek}
    //       onChange={handleChange}
    //       placeholder="e.g., 5"
    //     />

    //     <label>Number of Mentees You Can Mentor</label>
    //     <input
    //       type="number"
    //       name="menteesCapacity"
    //       value={formData.menteesCapacity}
    //       onChange={handleChange}
    //       placeholder="e.g., 3"
    //     />

    //     {/* Contact Preference */}
    //     <label>How can students contact you?</label>
    //     <select
    //       name="preferredContact"
    //       value={formData.preferredContact}
    //       onChange={handleChange}
    //       required
    //     >
    //       <option value="">Select Contact Method</option>
    //       <option value="Email">Email</option>
    //       <option value="Phone">Phone</option>
    //       <option value="LinkedIn">LinkedIn</option>
    //     </select>

    //     {/* Work Info */}
    //     <label>Current Job Title</label>
    //     <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} />

    //     <label>Company Name</label>
    //     <input type="text" name="company" value={formData.company} onChange={handleChange} />

    //     {/* Location */}
    //     <label>City</label>
    //     <input type="text" name="city" value={formData.location.city} onChange={handleChange} />

    //     <label>State</label>
    //     <input type="text" name="state" value={formData.location.state} onChange={handleChange} />

    //     <label>Country</label>
    //     <input type="text" name="country" value={formData.location.country} onChange={handleChange} />

    //     {/* Profile Picture */}
    //     <label>Profile Picture</label>
    //     <input type="file" name="profilePicture" accept="image/*" onChange={handleChange} />
    //     {previewImage && <img src={previewImage} alt="Preview" className="profile-preview" />}

    //     <button type="submit">Save Profile</button>
    //   </form>
    // </div>
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

        {/* Areas of Interest */}
        <label htmlFor="areasOfInterest">Areas of Interest</label>
        <select
          id="areasOfInterest"
          name="areasOfInterest"
          value={formData.areasOfInterest}
          onChange={handleChange}
          required
        >
          <option value="">Select Interest</option>
          <option value="AI/ML">AI/ML</option>
          <option value="Data Science">Data Science</option>
          <option value="Cybersecurity">Cybersecurity</option>
          <option value="Software Development">Software Development</option>
          <option value="Entrepreneurship">Entrepreneurship</option>
        </select>

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
          <img src={previewImage} alt="Preview" className="profile-preview" />
        )}

        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
};

export default AlumniProfile;
