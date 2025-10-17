import { io } from "socket.io-client";
//https://prochess-backend.onrender.com
export const socket = io("http://localhost:8080", {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 15,
  timeout: 10000,
  transports: ["websocket", "polling"],
});

export default socket;
