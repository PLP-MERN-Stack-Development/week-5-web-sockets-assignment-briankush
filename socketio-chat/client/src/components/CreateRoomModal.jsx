import { useState } from 'react';

const CreateRoomModal = ({ onClose, onCreateRoom }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateRoom(name, description);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '400px',
        maxWidth: '90%'
      }}>
        <h3>Create New Room</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Room Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                minHeight: '80px'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: name.trim() ? 'pointer' : 'not-allowed',
                opacity: name.trim() ? 1 : 0.7
              }}
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
