import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./AlumniProfileView.css";

const StudentPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/users/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        let data = res.data;

        // Fix image path
        const apiBase = import.meta.env.VITE_API_BASE_URL || "";
        const apiRoot = apiBase.replace(/\/api\/?$/i, "");
        if (data.profilePicture && !data.profilePicture.startsWith("http")) {
          data.profilePicture = `${apiRoot}/uploads/${data.profilePicture}`;
        } else if (
          data.profile &&
          data.profile.profilePicture &&
          !data.profile.profilePicture.startsWith("http")
        {currentUser && currentUser.role === "alumni" && (
          import { useEffect, useState } from "react";
          import { useParams, useNavigate } from "react-router-dom";
          import axios from "axios";
          import { useAuth } from "../context/AuthContext";
          import "./AlumniProfileView.css";

          const StudentPublicProfile = () => {
            const { id } = useParams();
            const navigate = useNavigate();
            const { user: currentUser } = useAuth();

            const [profile, setProfile] = useState(null);
            const [loading, setLoading] = useState(true);

            useEffect(() => {
              const fetchStudent = async () => {
                try {
                  const token = localStorage.getItem("token");
                  const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/users/${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );

                  let data = res.data;

                  // Fix image path
                  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
                  const apiRoot = apiBase.replace(/\/api\/?$/i, "");
                  if (data.profilePicture && !data.profilePicture.startsWith("http")) {
                    data.profilePicture = `${apiRoot}/uploads/${data.profilePicture}`;
                  } else if (
                    data.profile &&
                    data.profile.profilePicture &&
                    !data.profile.profilePicture.startsWith("http")
                  ) {
                    data.profile.profilePicture = `${apiRoot}${data.profile.profilePicture}`;
                  } else if (!data.profilePicture && !(data.profile && data.profile.profilePicture)) {
                    data.profilePicture = "/default-avatar.svg";
                  }

                  setProfile(data);
                } catch (err) {
                  console.error("Error fetching student profile:", err);
                  setProfile(null);
                } finally {
                  setLoading(false);
                }
              };

              fetchStudent();
            }, [id]);

            if (loading) return <p className="loading">Loading profile...</p>;
            if (!profile) return <p className="loading">Student profile not found.</p>;

            // simple action: navigate to meeting request with student email
            const handleRequestMeeting = () => {
              navigate("/meeting", { state: { studentEmail: profile.email } });
            };

            return (
              <div className="profile-container">
                <h2>Student Profile</h2>

                <div className="profile-picture">
                  <img
                    src={
                      profile.profilePicture ||
                      (profile.profile && profile.profile.profilePicture) ||
                      "/default-avatar.svg"
                    }
                    alt="Profile"
                    onError={(e) => {
                      try {
                        e.target.onerror = null;
                      } catch (err) {}
                      e.target.src = "/default-avatar.svg";
                    }}
                  />
                </div>

                <p>
                  <strong>Full Name:</strong> {profile.name || profile.fullName}
                </p>
                <p>
                  <strong>Email:</strong> {profile.email}
                </p>
                <p>
                  <strong>Gender:</strong> {profile.gender || profile.profile?.gender}
                </p>

                <h3>Academic Details</h3>
                <p>
                  <strong>Degree:</strong> {profile.degree || profile.profile?.degree}
                </p>
                <p>
                  <strong>Specialization:</strong>{" "}
                  {profile.specialization || profile.profile?.specialization}
                </p>
                <p>
                  <strong>Batch:</strong> {profile.batch || profile.profile?.batch}
                </p>

                <p>
                  <strong>Area of Interest:</strong>{" "}
                  {profile.areaOfInterest || profile.profile?.areaOfInterest}
                </p>
                <p>
                  <strong>LinkedIn:</strong>{" "}
                  import { useEffect, useState } from "react";
                  import { useParams, useNavigate } from "react-router-dom";
                  import axios from "axios";
                  import { useAuth } from "../context/AuthContext";
                  import "./AlumniProfileView.css";

                  const StudentPublicProfile = () => {
                    const { id } = useParams();
                    const navigate = useNavigate();
                    const { user: currentUser } = useAuth();

                    const [profile, setProfile] = useState(null);
                    const [loading, setLoading] = useState(true);

                    useEffect(() => {
                      const fetchStudent = async () => {
                        try {
                          const token = localStorage.getItem("token");
                          const res = await axios.get(
                            `${import.meta.env.VITE_API_BASE_URL}/users/${id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                          );

                          let data = res.data;

                          // Fix image path
                          const apiBase = import.meta.env.VITE_API_BASE_URL || "";
                          const apiRoot = apiBase.replace(/\/api\/?$/i, "");
                          if (data.profilePicture && !data.profilePicture.startsWith("http")) {
                            data.profilePicture = `${apiRoot}/uploads/${data.profilePicture}`;
                          } else if (
                            data.profile &&
                            data.profile.profilePicture &&
                            !data.profile.profilePicture.startsWith("http")
                          ) {
                            data.profile.profilePicture = `${apiRoot}${data.profile.profilePicture}`;
                          } else if (!data.profilePicture && !(data.profile && data.profile.profilePicture)) {
                            data.profilePicture = "/default-avatar.svg";
                          }

                          setProfile(data);
                        } catch (err) {
                          console.error("Error fetching student profile:", err);
                          setProfile(null);
                        } finally {
                          setLoading(false);
                        }
                      };

                      fetchStudent();
                    }, [id]);

                    if (loading) return <p className="loading">Loading profile...</p>;
                    if (!profile) return <p className="loading">Student profile not found.</p>;

                    // simple action: navigate to meeting request with student email
                    const handleRequestMeeting = () => {
                      navigate("/meeting", { state: { studentEmail: profile.email } });
                    };

                    return (
                      <div className="profile-container">
                        <h2>Student Profile</h2>

                        <div className="profile-picture">
                          <img
                            src={
                              profile.profilePicture ||
                              (profile.profile && profile.profile.profilePicture) ||
                              "/default-avatar.svg"
                            }
                            alt="Profile"
                            onError={(e) => {
                              try {
                                e.target.onerror = null;
                              } catch (err) {}
                              e.target.src = "/default-avatar.svg";
                            }}
                          />
                        </div>

                        <p>
                          <strong>Full Name:</strong> {profile.name || profile.fullName}
                        </p>
                        <p>
                          <strong>Email:</strong> {profile.email}
                        </p>
                        <p>
                          <strong>Gender:</strong> {profile.gender || profile.profile?.gender}
                        </p>

                        <h3>Academic Details</h3>
                        <p>
                          <strong>Degree:</strong> {profile.degree || profile.profile?.degree}
                        </p>
                        <p>
                          <strong>Specialization:</strong>{" "}
                          {profile.specialization || profile.profile?.specialization}
                        </p>
                        <p>
                          <strong>Batch:</strong> {profile.batch || profile.profile?.batch}
                        </p>

                        <p>
                          <strong>Area of Interest:</strong>{" "}
                          {profile.areaOfInterest || profile.profile?.areaOfInterest}
                        </p>
                        <p>
                          <strong>LinkedIn:</strong>{" "}
                          import { useEffect, useState } from "react";
                          import { useParams, useNavigate } from "react-router-dom";
                          import axios from "axios";
                          import { useAuth } from "../context/AuthContext";
                          import "./AlumniProfileView.css";

                          const StudentPublicProfile = () => {
                            const { id } = useParams();
                            const navigate = useNavigate();
                            const { user: currentUser } = useAuth();

                            const [profile, setProfile] = useState(null);
                            const [loading, setLoading] = useState(true);

                            useEffect(() => {
                              const fetchStudent = async () => {
                                try {
                                  const token = localStorage.getItem("token");
                                  const res = await axios.get(
                                    `${import.meta.env.VITE_API_BASE_URL}/users/${id}`,
                                    { headers: { Authorization: `Bearer ${token}` } }
                                  );

                                  let data = res.data;

                                  // Fix image path
                                  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
                                  const apiRoot = apiBase.replace(/\/api\/?$/i, "");
                                  if (data.profilePicture && !data.profilePicture.startsWith("http")) {
                                    data.profilePicture = `${apiRoot}/uploads/${data.profilePicture}`;
                                  } else if (
                                    data.profile &&
                                    data.profile.profilePicture &&
                                    !data.profile.profilePicture.startsWith("http")
                                  ) {
                                    data.profile.profilePicture = `${apiRoot}${data.profile.profilePicture}`;
                                  } else if (!data.profilePicture && !(data.profile && data.profile.profilePicture)) {
                                    data.profilePicture = "/default-avatar.svg";
                                  }

                                  setProfile(data);
                                } catch (err) {
                                  console.error("Error fetching student profile:", err);
                                  setProfile(null);
                                } finally {
                                  setLoading(false);
                                }
                              };

                              fetchStudent();
                            }, [id]);

                            if (loading) return <p className="loading">Loading profile...</p>;
                            if (!profile) return <p className="loading">Student profile not found.</p>;

                            // simple action: navigate to meeting request with student email
                            const handleRequestMeeting = () => {
                              navigate("/meeting", { state: { studentEmail: profile.email } });
                            };

                            return (
                              <div className="profile-container">
                                <h2>Student Profile</h2>

                                <div className="profile-picture">
                                  <img
                                    src={
                                      profile.profilePicture ||
                                      (profile.profile && profile.profile.profilePicture) ||
                                      "/default-avatar.svg"
                                    }
                                    alt="Profile"
                                    onError={(e) => {
                                      try {
                                        e.target.onerror = null;
                                      } catch (err) {}
                                      e.target.src = "/default-avatar.svg";
                                    }}
                                  />
                                </div>

                                <p>
                                  <strong>Full Name:</strong> {profile.name || profile.fullName}
                                </p>
                                <p>
                                  <strong>Email:</strong> {profile.email}
                                </p>
                                <p>
                                  <strong>Gender:</strong> {profile.gender || profile.profile?.gender}
                                </p>

                                <h3>Academic Details</h3>
                                <p>
                                  <strong>Degree:</strong> {profile.degree || profile.profile?.degree}
                                </p>
                                <p>
                                  <strong>Specialization:</strong>{" "}
                                  {profile.specialization || profile.profile?.specialization}
                                </p>
                                <p>
                                  <strong>Batch:</strong> {profile.batch || profile.profile?.batch}
                                </p>

                                <p>
                                  <strong>Area of Interest:</strong>{" "}
                                  {profile.areaOfInterest || profile.profile?.areaOfInterest}
                                </p>
                                <p>
                                  <strong>LinkedIn:</strong>{" "}
                                  import React from "react";

                                  // Deprecated placeholder. App now uses StudentPublicProfileAdmin for the routed view.
                                  const StudentPublicProfile = () => {
                                    return (
                                      <div style={{ padding: 20 }}>
                                        <h3>Student profile (legacy)</h3>
                                        <p>This view has moved — please use the admin-safe profile viewer.</p>
                                      </div>
                                    );
                                  };

                                  export default StudentPublicProfile;
                                {/* Show request meeting button only for alumni viewers (hide for admins) */}
