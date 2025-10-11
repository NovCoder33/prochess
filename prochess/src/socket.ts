import { io } from "socket.io-client";

export const socket = io("https://prochess-backend.onrender.com");

export default socket;
