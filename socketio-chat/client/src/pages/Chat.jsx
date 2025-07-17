import React, { useState, useContext, useRef, useEffect } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import RoomList from "../components/RoomList";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";

const drawerWidth = 280;

const Chat = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  
  const { user, logout } = useContext(AuthContext);
  const { messages, currentRoom, createRoom } = useContext(ChatContext);
  
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCreateRoomOpen = () => {
    setCreateRoomOpen(true);
  };

  const handleCreateRoomClose = () => {
    setCreateRoomOpen(false);
  };

  const handleCreateRoom = async () => {
    if (newRoomName.trim()) {
      await createRoom({
        name: newRoomName,
        description: newRoomDescription,
      });
      setNewRoomName("");
      setNewRoomDescription("");
      setCreateRoomOpen(false);
    }
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
        <Typography variant="h6" noWrap component="div">
          {user?.username}
        </Typography>
      </Box>
      <Divider />
      <RoomList onCreateRoom={handleCreateRoomOpen} />
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {currentRoom?.name || "Select a room"}
          </Typography>
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          pt: { xs: 8, sm: 9 },
        }}
      >
        {currentRoom ? (
          <>
            <Box
              sx={{
                flexGrow: 1,
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
                p: 2,
              }}
            >
              {messages.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No messages yet. Start the conversation!
                  </Typography>
                </Box>
              ) : (
                messages.map((message) => (
                  <ChatMessage key={message._id} message={message} />
                ))
              )}
              <div ref={messagesEndRef} />
            </Box>
            <ChatInput />
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Typography variant="h5" color="text.secondary">
              Select a room to start chatting
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog open={createRoomOpen} onClose={handleCreateRoomClose}>
        <DialogTitle>Create New Room</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Room Name"
            fullWidth
            variant="outlined"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            variant="outlined"
            value={newRoomDescription}
            onChange={(e) => setNewRoomDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateRoomClose}>Cancel</Button>
          <Button onClick={handleCreateRoom} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chat;
