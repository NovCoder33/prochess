import { io } from "socket.io-client";

export const socket = io("https://prochess-backend.onrender.com", {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 15,
  timeout: 10000,
  transports: ["websocket", "polling"],
});

export default socket;
