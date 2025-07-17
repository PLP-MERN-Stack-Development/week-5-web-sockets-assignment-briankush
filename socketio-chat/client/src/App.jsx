import React, { useContext, useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import { io } from 'socket.io-client';
import RoomList from './components/RoomList';
import ChatRoom from './components/ChatRoom';
import LoginForm from './components/LoginForm';
import CreateRoomModal from './components/CreateRoomModal';

// Create a MUI theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2196f3",
    },
    secondary: {
      main: "#ff9800",
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const socket = io('http://localhost:5000');

function AppContent() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  
  const messageEndRef = useRef(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    // Listen for room list
    socket.on('room_list', (roomList) => {
      setRooms(roomList);
    });
    
    // Listen for new rooms
    socket.on('new_room', (room) => {
      setRooms((prevRooms) => [...prevRooms, room]);
    });
    
    // Listen for room updates
    socket.on('room_update', (updatedRoom) => {
      setRooms((prevRooms) => 
        prevRooms.map(room => 
          room.id === updatedRoom.id 
            ? { ...room, participants: updatedRoom.participants } 
            : room
        )
      );
    });
    
    // Listen for messages
    socket.on('receive_message', (newMessage) => {
      if (newMessage.roomId === currentRoom) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });
    
    // Listen for room history when joining a room
    socket.on('room_history', ({ roomId, messages }) => {
      if (roomId === currentRoom) {
        setMessages(messages);
      }
    });
    
    // Listen for user list updates
    socket.on('user_list', (userList) => {
      setUsers(userList);
    });
    
    // Listen for typing updates
    socket.on('typing_users', ({ roomId, users }) => {
      if (roomId === currentRoom) {
        setTypingUsers(users || []);
      }
    });
    
    // Listen for room errors
    socket.on('room_error', (error) => {
      alert(error.message);
    });
    
    // Clean up listeners on unmount
    return () => {
      socket.off('room_list');
      socket.off('new_room');
      socket.off('room_update');
      socket.off('receive_message');
      socket.off('room_history');
      socket.off('user_list');
      socket.off('typing_users');
      socket.off('room_error');
    };
  }, [currentRoom]);
  
  const handleJoin = (e, usernameInput) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      setUsername(usernameInput);
      socket.emit('user_join', usernameInput);
      setJoined(true);
    }
  };
  
  const joinRoom = (roomId) => {
    setCurrentRoom(roomId);
    setMessages([]);
    socket.emit('join_room', { roomId, username });
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && currentRoom) {
      socket.emit('send_message', { roomId: currentRoom, message });
      setMessage('');
    }
  };
  
  const handleTyping = () => {
    if (currentRoom) {
      socket.emit('typing', { roomId: currentRoom, isTyping: true });
      
      setTimeout(() => {
        socket.emit('typing', { roomId: currentRoom, isTyping: false });
      }, 2000);
    }
  };
  
  const handleCreateRoom = (name, description) => {
    if (name.trim()) {
      socket.emit('create_room', { name, description });
      setShowCreateRoom(false);
    }
  };

  if (!joined) {
    return <LoginForm onJoin={handleJoin} />;
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      height: '90vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h2>Socket.io Chat</h2>
      
      <div style={{ display: 'flex', gap: '20px', flex: 1, height: 'calc(100% - 50px)' }}>
        <RoomList 
          rooms={rooms} 
          onJoinRoom={joinRoom} 
          currentRoom={currentRoom}
          onCreateRoom={() => setShowCreateRoom(true)}
        />
        
        <ChatRoom
          currentRoom={currentRoom}
          rooms={rooms}
          messages={messages}
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
          handleTyping={handleTyping}
          typingUsers={typingUsers}
          messageEndRef={messageEndRef}
          username={username}
        />
      </div>
      
      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreateRoom={handleCreateRoom}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
