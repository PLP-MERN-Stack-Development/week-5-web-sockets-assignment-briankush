const ChatRoom = ({
  currentRoom,
  rooms,
  messages,
  message,
  setMessage,
  handleSendMessage,
  handleTyping,
  typingUsers,
  messageEndRef,
  username
}) => {
  // Find current room details
  const roomDetails = currentRoom ? rooms.find(room => room.id === currentRoom) : null;
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {currentRoom ? (
        <>
          <div style={{ 
            padding: '10px 15px',
            backgroundColor: '#f5f5f5',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }}>
            <h3 style={{ margin: 0 }}>{roomDetails?.name || 'Room'}</h3>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#666' }}>
              {roomDetails?.description || ''}
            </p>
          </div>
          
          <div style={{ 
            flex: 1,
            padding: '15px',
            overflowY: 'auto',
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderTop: 'none'
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender === username ? 'flex-end' : 'flex-start',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: msg.sender === username ? '#4CAF50' : '#e0e0e0',
                      color: msg.sender === username ? 'white' : 'black',
                      borderRadius: '18px',
                      padding: '8px 16px',
                      maxWidth: '70%',
                    }}
                  >
                    <div style={{ 
                      fontWeight: 'bold', 
                      fontSize: '0.9em',
                      marginBottom: '4px' 
                    }}>
                      {msg.sender}
                    </div>
                    <div>{msg.message}</div>
                    <div style={{ 
                      fontSize: '0.7em', 
                      textAlign: 'right',
                      marginTop: '4px',
                      opacity: 0.8 
                    }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messageEndRef} />
          </div>
          
          {typingUsers && typingUsers.length > 0 && (
            <div style={{ padding: '5px 15px', fontSize: '0.9em', fontStyle: 'italic', color: '#666' }}>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}
          
          <form 
            onSubmit={handleSendMessage} 
            style={{ 
              display: 'flex', 
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderBottomLeftRadius: '8px',
              borderBottomRightRadius: '8px'
            }}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleTyping}
              placeholder="Type a message"
              style={{ 
                flex: 1, 
                padding: '12px',
                borderRadius: '20px',
                border: '1px solid #ddd',
                marginRight: '10px' 
              }}
            />
            <button 
              type="submit"
              disabled={!message.trim()}
              style={{ 
                padding: '0 20px',
                backgroundColor: '#4CAF50', 
                color: 'white', 
                border: 'none',
                borderRadius: '20px',
                cursor: message.trim() ? 'pointer' : 'not-allowed',
                opacity: message.trim() ? 1 : 0.7
              }}
            >
              Send
            </button>
          </form>
        </>
      ) : (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          border: '2px dashed #ddd'
        }}>
          <div style={{ textAlign: 'center', color: '#999' }}>
            <h3>No Room Selected</h3>
            <p>Select a room from the sidebar to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
