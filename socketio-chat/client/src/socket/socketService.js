import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket) return;

    this.socket = io(process.env.REACT_APP_API_URL || "http://localhost:5000", {
      auth: { token },
      autoConnect: true,
      reconnection: true,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

const socketService = new SocketService();
export default socketService;
