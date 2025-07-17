import { createContext, useReducer, useContext, useEffect } from "react";
import socketService from "../socket/socketService";
import { AuthContext } from "./AuthContext";
import axios from "axios";

export const ChatContext = createContext();

const initialState = {
  rooms: [],
  currentRoom: null,
  messages: [],
  onlineUsers: new Set(),
  typingUsers: [],
  loading: false,
  error: null,
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case "SET_ROOMS":
      return { ...state, rooms: action.payload, loading: false };
    case "SET_CURRENT_ROOM":
      return { ...state, currentRoom: action.payload, messages: [] };
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "NEW_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "USER_ONLINE":
      return {
        ...state,
        onlineUsers: new Set([...state.onlineUsers, action.payload]),
      };
    case "USER_OFFLINE":
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.delete(action.payload);
      return {
        ...state,
        onlineUsers: newOnlineUsers,
      };
    case "SET_TYPING_USERS":
      return { ...state, typingUsers: action.payload };
    case "MARK_READ":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg._id === action.payload.messageId
            ? {
                ...msg,
                readBy: [...msg.readBy, action.payload.userId],
              }
            : msg
        ),
      };
    case "LOADING":
      return { ...state, loading: true };
    case "ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user } = useContext(AuthContext);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Connect to socket when user is logged in
  useEffect(() => {
    if (user) {
      const socket = socketService.connect(user.token);

      // Listen for new messages
      socket.on("newMessage", (message) => {
        dispatch({ type: "NEW_MESSAGE", payload: message });
        // Mark message as read if it's in the current room
        if (state.currentRoom && state.currentRoom._id === message.room) {
          socketService.emit("markRead", {
            roomId: message.room,
            messageId: message._id,
          });
        }
      });

      // Listen for room history
      socket.on("roomHistory", ({ messages }) => {
        dispatch({ type: "SET_MESSAGES", payload: messages });
      });

      // Listen for user typing
      socket.on("userTyping", ({ usersTyping }) => {
        dispatch({ type: "SET_TYPING_USERS", payload: usersTyping });
      });

      // Listen for message read status updates
      socket.on("messageRead", ({ messageId, userId }) => {
        dispatch({ type: "MARK_READ", payload: { messageId, userId } });
      });

      // Listen for user status updates
      socket.on("userStatusUpdate", ({ userId, status }) => {
        if (status === "online") {
          dispatch({ type: "USER_ONLINE", payload: userId });
        } else {
          dispatch({ type: "USER_OFFLINE", payload: userId });
        }
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [user]);

  // Add this new effect to fetch rooms when user logs in
  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  // Fetch available rooms
  const fetchRooms = async () => {
    if (!user) return;

    dispatch({ type: "LOADING" });
    try {
      const { data } = await axios.get(`${API_URL}/api/rooms`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      console.log("Fetched rooms:", data); // Add debug logging
      dispatch({ type: "SET_ROOMS", payload: data });
    } catch (error) {
      console.error("Error fetching rooms:", error); // Add debug logging
      dispatch({
        type: "ERROR",
        payload: error.response?.data?.message || "Failed to fetch rooms",
      });
    }
  };

  // Create a new room
  const createRoom = async (roomData) => {
    if (!user) return;

    dispatch({ type: "LOADING" });
    try {
      const { data } = await axios.post(`${API_URL}/api/rooms`, roomData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      console.log("Created room:", data); // Add debug logging
      
      // Fetch all rooms again instead of just appending
      fetchRooms();
      return data;
    } catch (error) {
      console.error("Error creating room:", error); // Add debug logging
      dispatch({
        type: "ERROR",
        payload: error.response?.data?.message || "Failed to create room",
      });
      return null;
    }
  };

  // Join a chat room
  const joinRoom = (room) => {
    if (!user || !socketService.socket) return;

    dispatch({ type: "SET_CURRENT_ROOM", payload: room });
    socketService.emit("joinRoom", { roomId: room._id });
  };

  // Send a message
  const sendMessage = (content) => {
    if (!user || !socketService.socket || !state.currentRoom) return;

    socketService.emit("sendMessage", {
      roomId: state.currentRoom._id,
      content,
    });
  };

  // Send typing indicator
  const sendTyping = () => {
    if (!user || !socketService.socket || !state.currentRoom) return;

    socketService.emit("typing", { roomId: state.currentRoom._id });
  };

  // Mark message as read
  const markAsRead = (messageId) => {
    if (!user || !socketService.socket || !state.currentRoom) return;

    socketService.emit("markRead", {
      roomId: state.currentRoom._id,
      messageId,
    });
  };

  return (
    <ChatContext.Provider
      value={{
        rooms: state.rooms,
        currentRoom: state.currentRoom,
        messages: state.messages,
        typingUsers: state.typingUsers,
        onlineUsers: state.onlineUsers,
        loading: state.loading,
        error: state.error,
        fetchRooms,
        createRoom,
        joinRoom,
        sendMessage,
        sendTyping,
        markAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
