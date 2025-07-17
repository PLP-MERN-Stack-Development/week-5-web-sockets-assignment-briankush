import React, { useContext, useEffect } from "react";
import { Box, Typography, Avatar, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const MessageContainer = styled(Box)(({ theme, ismine }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: ismine === "true" ? "flex-end" : "flex-start",
  marginBottom: theme.spacing(1),
}));

const MessageBubble = styled(Box)(({ theme, ismine }) => ({
  backgroundColor: ismine === "true" ? theme.palette.primary.main : theme.palette.grey[200],
  color: ismine === "true" ? theme.palette.primary.contrastText : theme.palette.text.primary,
  borderRadius: 16,
  padding: theme.spacing(1, 2),
  maxWidth: "70%",
  wordWrap: "break-word",
}));

const MessageHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  marginBottom: 4,
});

const MessageFooter = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  marginTop: 4,
  fontSize: "0.75rem",
});

const ChatMessage = ({ message }) => {
  const { user } = useContext(AuthContext);
  const { markAsRead } = useContext(ChatContext);
  
  const isMine = message.sender._id === user._id;
  const hasBeenRead = message.readBy && message.readBy.length > 1;
  
  // Mark message as read when rendered if it's not the user's own message
  useEffect(() => {
    if (!isMine && message._id) {
      markAsRead(message._id);
    }
  }, [message._id, isMine, markAsRead]);

  return (
    <MessageContainer ismine={isMine.toString()}>
      <MessageHeader>
        {!isMine && (
          <Avatar
            src={message.sender.avatar}
            alt={message.sender.username}
            sx={{ width: 24, height: 24, marginRight: 1 }}
          />
        )}
        <Typography variant="caption" color="text.secondary">
          {!isMine && message.sender.username}
        </Typography>
      </MessageHeader>
      
      <MessageBubble ismine={isMine.toString()}>
        <Typography variant="body1">{message.content}</Typography>
        
        <MessageFooter>
          <Typography variant="caption" color="text.secondary" sx={{ marginRight: 0.5 }}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
          
          {isMine && (
            <Tooltip title={hasBeenRead ? "Read" : "Delivered"}>
              {hasBeenRead ? <DoneAllIcon fontSize="small" /> : <DoneIcon fontSize="small" />}
            </Tooltip>
          )}
        </MessageFooter>
      </MessageBubble>
    </MessageContainer>
  );
};

export default ChatMessage;
