import { useState } from 'react';

const LoginForm = ({ onJoin }) => {
  const [username, setUsername] = useState('');

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '100px auto', 
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2>Join the Chat</h2>
      <form onSubmit={(e) => onJoin(e, username)}>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '12px', 
            marginBottom: '15px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
        <button 
          type="submit"
          disabled={!username.trim()}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: username.trim() ? 'pointer' : 'not-allowed',
            opacity: username.trim() ? 1 : 0.7
          }}
        >
          Join
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
