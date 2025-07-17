import React, { useContext, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  IconButton,
  Divider,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { ChatContext } from "../context/ChatContext";

const RoomList = ({ onCreateRoom }) => {
  const { rooms, fetchRooms, joinRoom, currentRoom, onlineUsers, loading, error } = useContext(ChatContext);

  // Fetch rooms when component mounts
  useEffect(() => {
    console.log("Fetching rooms from RoomList component");
    fetchRooms();
  }, []); // Remove fetchRooms from dependency array to avoid re-fetching

  // Debug logging
  useEffect(() => {
    console.log("Current rooms:", rooms);
    console.log("Online users:", onlineUsers);
  }, [rooms, onlineUsers]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography>Error loading rooms: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="h6">Rooms ({rooms ? rooms.length : 0})</Typography>
        <IconButton color="primary" onClick={onCreateRoom}>
          <AddIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      <List>
        {!rooms || rooms.length === 0 ? (
          <ListItem>
            <ListItemText primary="No rooms available" />
          </ListItem>
        ) : (
          rooms.map((room) => (
            <ListItem
              key={room._id}
              button
              selected={currentRoom && currentRoom._id === room._id}
              onClick={() => joinRoom(room)}
            >
              <ListItemAvatar>
                <Badge
                  color="success"
                  variant="dot"
                  invisible={!room.participants?.some(id => 
                    onlineUsers && (typeof onlineUsers.has === 'function' ? 
                      onlineUsers.has(id) : 
                      Array.from(onlineUsers).includes(id))
                  )}
                >
                  <Avatar>
                    <MeetingRoomIcon />
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={room.name}
                secondary={room.description || "No description"}
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default RoomList;
