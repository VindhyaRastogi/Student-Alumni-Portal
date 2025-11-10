import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AlumniProfileView.css";

const AdminProfile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || user?.name || "");
  // compute initial profile picture URL similar to useEffect below so the
  // first render points to the backend when a relative path is stored.
  const initialPic =
    (user && (user.profile?.profilePicture || user.profilePicture)) || null;
  const defaultApiBase =
    import.meta.env.VITE_API_BASE_URL ||
    `${window.location.protocol}//${window.location.hostname}:5000`;
  const initialPicUrl = initialPic
    ? initialPic.startsWith("http")
      ? initialPic
      : `${defaultApiBase.replace(/\/api\/?$/i, "")}${initialPic}`
    : "/default-avatar.svg";
  const [profilePicUrl, setProfilePicUrl] = useState(initialPicUrl);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFullName(user?.fullName || user?.name || "");
    // compute a usable profile picture URL. If the server returns a
    // relative path like '/uploads/xyz', prefix it with the API root so
    // the browser requests the correct backend URL.
    const pic =
      (user && (user.profile?.profilePicture || user.profilePicture)) || null;
    if (pic) {
      if (pic.startsWith("http")) setProfilePicUrl(pic);
      else {
        const apiBase = import.meta.env.VITE_API_BASE_URL || "";
        const apiRoot = apiBase.replace(/\/api\/?$/i, "");
        setProfilePicUrl(`${apiRoot}${pic}`);
      }
    } else {
      setProfilePicUrl("/default-avatar.svg");
    }
  }, [user]);

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setFile(f);
      // show preview
      const url = URL.createObjectURL(f);
      setProfilePicUrl(url);
    }
  };

  // Save all changes (name and optional photo) with a single button
  const handleSaveChanges = async () => {
    setSaving(true);
    setError(null);
    let latestUser = null;
    try {
      const token = localStorage.getItem("token");

      // upload photo first if present
      if (file) {
        const form = new FormData();
        form.append("profilePicture", file);
        const photoRes = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/users/me/photo`,
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        latestUser = photoRes.data;
        // update preview using returned path
        const apiBase =
          import.meta.env.VITE_API_BASE_URL ||
          `${window.location.protocol}//${window.location.hostname}:5000`;
        const apiRoot = apiBase.replace(/\/api\/?$/i, "");
        const pic =
          (latestUser.profile && latestUser.profile.profilePicture) ||
          latestUser.profilePicture ||
          null;
        if (pic && !pic.startsWith("http"))
          setProfilePicUrl(`${apiRoot}${pic}`);
        else if (pic) setProfilePicUrl(pic);
        setFile(null);
      }

      // update name if changed
      if (fullName !== (user?.fullName || user?.name || "")) {
        const res = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/users/me`,
          { fullName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        latestUser = res.data;
      }

      if (!file && fullName === (user?.fullName || user?.name || "")) {
        alert("No changes to save");
      } else {
        // Fetch fresh user from server to ensure we have canonical data
        try {
          const tokenStored = localStorage.getItem("token");
          if (tokenStored) {
            const meRes = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/users/me`,
              { headers: { Authorization: `Bearer ${tokenStored}` } }
            );
            const serverUser = meRes.data;
            // update auth context / localStorage
            login(serverUser, tokenStored);
            latestUser = serverUser;
          } else if (latestUser) {
            // fallback: use the returned user if no token present
            localStorage.setItem("user", JSON.stringify(latestUser));
          }
        } catch (fetchErr) {
          // if fetching /me fails, still attempt to use latestUser returned by endpoints
          if (latestUser) {
            const tokenStored = localStorage.getItem("token");
            if (tokenStored) login(latestUser, tokenStored);
            else localStorage.setItem("user", JSON.stringify(latestUser));
          }
        }
        alert("Changes saved");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-container">
      <h2>Admin Profile</h2>

      <div className="profile-picture">
        <img
          src={profilePicUrl}
          alt="Profile"
          onError={(e) => {
            try {
              e.target.onerror = null;
            } catch (err) {}
            e.target.src = "/default-avatar.svg";
          }}
          style={{
            width: 160,
            height: 160,
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <div style={{ marginTop: 24 }}>
        <label>
          <div style={{ fontWeight: 600 }}>Full Name</div>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ width: 360, padding: 8, marginTop: 8 }}
          />
        </label>
        <div style={{ marginTop: 12 }}>
          <button onClick={handleSaveChanges} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {error && <div style={{ marginTop: 12, color: "red" }}>{error}</div>}
    </div>
  );
};

export default AdminProfile;
