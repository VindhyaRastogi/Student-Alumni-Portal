// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Hydrate user from localStorage on first load
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Manage socket connection when user changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    const API = import.meta.env.VITE_API_BASE_URL || "";
    const serverUrl = (API && API.replace(/\/api\/?$/i, "")) || (import.meta.env.VITE_CLIENT_URL || "http://localhost:5000");

    // disconnect previous socket
    if (socketRef.current) {
      try {
        socketRef.current.disconnect();
      } catch (err) {}
      socketRef.current = null;
    }

    if (token && user) {
      // connect with token for server to authenticate and join user room
      try {
        const s = io(serverUrl, { auth: { token } });
        socketRef.current = s;
        s.on("connect", () => {
          // console.log("socket connected", s.id);
        });
        s.on("connect_error", (err) => {
          console.warn("socket connect_error", err && err.message);
        });
      } catch (err) {
        console.error("socket init error", err);
      }
    }

    return () => {
      if (socketRef.current) {
        try {
          socketRef.current.disconnect();
        } catch (err) {}
        socketRef.current = null;
      }
    };
  }, [user]);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData); // update context immediately
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, socket: socketRef.current }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
