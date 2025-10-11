import * as express from "express";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import * as http from "http";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8080; // Backend port

const io = new Server(server, {
  cors: {
    origin: "*", // Frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const rooms = new Map();
io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);
  socket.on("closeRoom", async (data) => {
    socket.to(data.roomId).emit("closeRoom", data);
    const clientSockets = await io.in(data.roomId).fetchSockets();

    clientSockets.forEach((s) => s.leave(data.roomId));
    rooms.delete(data.roomId);
  });
  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`); // Debug log
    const gameRooms = Array.from(rooms.values());

    gameRooms.forEach((room) => {
      const userInRoom = room.players.find((player) => player.id === socket.id); // Fix this line

      if (userInRoom) {
        console.log(`Found disconnected user: ${userInRoom.username}`); // Debug log

        // Remove the disconnected player from the room
        const updatedPlayers = room.players.filter((p) => p.id !== socket.id);

        if (updatedPlayers.length === 0) {
          rooms.delete(room.roomId);
          console.log(`Deleted empty room: ${room.roomId}`);
        } else {
          // Update the room with remaining players
          rooms.set(room.roomId, { ...room, players: updatedPlayers });
          // Notify remaining players
          socket.to(room.roomId).emit("playerDisconnected", userInRoom);
          console.log(`Notified room ${room.roomId} about disconnect`);
        }
      }
    });
  });

  socket.on("createRoom", async (callback) => {
    let roomId = uuidv4();
    roomId = roomId.slice(0, 5) + "-" + roomId.slice(roomId.length - 2);
    await socket.join(roomId);
    const roomData = {
      roomId,
      players: [{ id: socket.id, username: socket.data.username }],
    };
    rooms.set(roomId, roomData);
    callback(roomData);
  });

  socket.on("joinRoom", async (args, callback) => {
    const room = rooms.get(args.roomId);
    let error, message;
    if (!room) {
      error = true;
      message = "room DNE";
    } else if (room?.players.length <= 0) {
      error = true;
      message = "room empty";
    } else if (room?.players.length >= 2) {
      error = true;
      message = "room full";
    }
    if (error) {
      if (callback) {
        callback({ error, message });
      }
      return;
    }
    await socket.join(args.roomId);

    const roomUpdate = {
      ...room,
      players: [
        ...room.players,
        { id: socket.id, username: socket.data?.username },
      ],
    };
    rooms.set(args.roomId, roomUpdate);

    callback(roomUpdate);
    io.to(args.roomId).emit("p2Joined", roomUpdate);
  });

  socket.on("move", (data) => {
    socket.to(data.room).emit("move", data);
  });
});

server.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
