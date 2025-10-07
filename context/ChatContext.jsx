import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null)
    const [unseenMessages, setUnseenMessages] = useState({})

    const { socket, axios, authUser: currentUser } = useContext(AuthContext);

    // function to get all users for sidebar 
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // function to get messages for selected user 
    const getMessage = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // function to send message to selected user
    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`
                , messageData);
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.message]);
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // function to subscribe to message for selected user
   const subscribeToMessages = () => {
  if (!socket || !currentUser) return;

  socket.on("newMessage", (newMessage) => {
    // ✅ Check if message belongs to current chat
    const isMessageForCurrentChat = 
      selectedUser && (
        (newMessage.senderId === selectedUser._id && newMessage.receiverId === currentUser._id) ||
        (newMessage.receiverId === selectedUser._id && newMessage.senderId === currentUser._id)
      );

    if (isMessageForCurrentChat) {
      // Add to messages with proper timestamp
      setMessages(prev => [...prev, { 
        ...newMessage, 
        seen: true,
        timestamp: newMessage.createdAt ? new Date(newMessage.createdAt) : new Date()
      }]);
      axios.put(`/api/messages/mark/${newMessage._id}`).catch(() => {});
    } else {
      // Update unseen count
      setUnseenMessages(prev => ({
        ...prev,
        [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
      }));
    }
  });
};
    // function to unsubscribe from messages
    const unsubscribeFromMessages = () => {
        if (socket)  socket.off("newMessage");
    }

    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [socket, selectedUser, currentUser])

    const value = {
        messages, users, selectedUser, getUsers, getMessage, sendMessage,
        setSelectedUser, unseenMessages, setUnseenMessages
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}