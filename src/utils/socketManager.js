import { io } from "socket.io-client";

// Connect directly to backend (not through Vite proxy — WS upgrades need direct connection)
const SOCKET_URL = "http://localhost:5000";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,      // send JWT cookie with handshake
      autoConnect: false,         // connect explicitly when needed
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
