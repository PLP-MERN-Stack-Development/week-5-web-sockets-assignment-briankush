[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19940058&assignment_repo_type=AssignmentRepo)
# Real-Time Chat Application with Socket.io

This project implements a real-time chat application using Socket.io, enabling bidirectional communication between clients and the server.

## Features

1. Real-time messaging
2. User presence (join/leave notifications)
3. Multiple chat rooms
4. Room creation
5. Typing indicators
6. Online user list
7. Private messaging

## Project Structure

```
/
├── server/                 # Node.js & Express backend
│   ├── server.js           # Main server file with Socket.io setup
│   └── package.json        # Server dependencies
├── socketio-chat/          # Project root directory
│   └── client/             # React/Vite frontend
│       ├── src/            # React source code
│       │   ├── App.jsx     # Main application component
│       │   └── main.jsx    # Entry point
│       ├── index.html      # HTML template
│       └── package.json    # Client dependencies
└── package.json            # Root package.json for project management
```

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Step 1: Install root dependencies
```bash
npm install
```

### Step 2: Install server dependencies
```bash
npm run install-server
```

### Step 3: Install client dependencies
```bash
npm run install-client
```

### Step 4: Run the application in development mode
```bash
npm run dev
```

This will start both the server and client concurrently:
- Server: http://localhost:5000
- Client: http://localhost:5173

## Usage

1. Open the application in your browser
2. Enter a username to join the chat
3. Start sending messages
4. See real-time updates as other users join, leave, or type

## Features Implemented

1. **User Authentication**
   - Basic username-based authentication
   - User presence tracking

2. **Real-time Messaging**
   - Instant message delivery
   - Message history

3. **Typing Indicators**
   - See when other users are typing

4. **Private Messaging**
   - Send direct messages to specific users

5. **User Status**
   - Track online users
   - Join/leave notifications

6. **Multiple Chat Rooms**
   - Join and create multiple chat rooms
   - Room-specific messaging

## Future Improvements

- File sharing capability
- Message editing and deletion
- User profile customization
- Mobile app using React Native
- End-to-end encryption