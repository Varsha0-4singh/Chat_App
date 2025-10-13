import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // ✅ Cleanup previous socket before creating new one
  const connectSocket = (userData) => {
    if (!userData) return;

    // Disconnect existing socket if connected
    if (socket) {
      socket.disconnect();
    }

    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      },
      reconnection: true,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    setSocket(newSocket);
  };

  // Check if the user is authenticated and if so, set the user data and connect the socket
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Don't show toast for auth check failures (normal for unauthenticated users)
    }
  };

  // Login function to handle user authentication and socket connection
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common["token"] = data.token;
        connectSocket(data.userData);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Login failed");
    }
  };

  // Logout function to handle user logout and socket disconnection
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["token"];
    
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    toast.success("Logged out successfully");
  };

  // ✅ Fixed: Proper error handling and authUser update
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        // ✅ Update authUser with new data (including profilePic)
        setAuthUser(prev => ({
          ...prev,
          ...data.user
        }));
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Profile update failed");
    }
  };

  // Set axios token on mount and when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
    } else {
      delete axios.defaults.headers.common["token"];
    }
  }, [token]);

  // Check authentication on mount
  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [token]);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};