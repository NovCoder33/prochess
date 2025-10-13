import * as express from "express";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import * as http from "http";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8080;

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const rooms = new Map();
io.on("connection", (socket) => {
  socket.on("rematchRequested", (data) => {
    io.to(data.roomId).emit("rematchRequested");
  });

  socket.on("closeRoom", async (data) => {
    socket.to(data.roomId).emit("closeRoom", data);
    const clientSockets = await io.in(data.roomId).fetchSockets();

    clientSockets.forEach((s) => s.leave(data.roomId));
    rooms.delete(data.roomId);
  });
  socket.on("disconnect", () => {
    const gameRooms = Array.from(rooms.values());

    gameRooms.forEach((room) => {
      const userInRoom = room.players.find((player) => player.id === socket.id);

      if (userInRoom) {
        const updatedPlayers = room.players.filter((p) => p.id !== socket.id);

        if (updatedPlayers.length === 0) {
          rooms.delete(room.roomId);
        } else {
          rooms.set(room.roomId, { ...room, players: updatedPlayers });
          socket.to(room.roomId).emit("playerDisconnected", userInRoom);
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

  socket.on("move", (data, callback) => {
    socket.to(data.room).emit("move", data);
    if (callback) callback({ success: true });
  });

  socket.on("newGameStarted", ({ roomId }) => {
    io.to(roomId).emit("gameReset");
  });
});

server.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
