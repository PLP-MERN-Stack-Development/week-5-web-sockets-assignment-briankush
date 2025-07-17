import React, { useState, useContext } from "react";
import { Box, TextField, IconButton, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { ChatContext } from "../context/ChatContext";

const ChatInput = () => {
  const [message, setMessage] = useState("");
  const { sendMessage, sendTyping, typingUsers } = useContext(ChatContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    sendTyping();
  };

  return (
    <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
      {typingUsers && typingUsers.length > 0 && (
        <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
          {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
        </Typography>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: "flex" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message"
          value={message}
          onChange={handleChange}
          size="small"
        />
        <IconButton type="submit" color="primary" sx={{ ml: 1 }}>
          <SendIcon />
        </IconButton>
      </form>
    </Box>
  );
};

export default ChatInput;
