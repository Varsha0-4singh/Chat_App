import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios, authUser: currentUser } = useContext(AuthContext);

  // Get all users for sidebar 
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get messages for selected user 
  const getMessage = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Send message to selected user - ✅ FIXED: No local update
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
      if (!data.success) {
        toast.error(data.message);
      }
      // ✅ Socket will handle the message addition - no local update here
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Socket listener - ✅ FIXED
  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleNewMessage = (newMessage) => {
      const isMessageForCurrentChat = 
        selectedUser && (
          (newMessage.senderId === selectedUser._id && newMessage.receiverId === currentUser._id) ||
          (newMessage.receiverId === selectedUser._id && newMessage.senderId === currentUser._id)
        );

      if (isMessageForCurrentChat) {
        setMessages(prev => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`).catch(() => {});
      } else {
        setUnseenMessages(prev => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser, currentUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessage,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};