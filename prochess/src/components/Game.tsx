import { useEffect, useState } from "react";
import Board from "./Board";
import MovesList from "./Control/bits/MovesList";
import Takeback from "./Control/bits/Takeback";
import Control from "./Control/Control";
import RoomCode from "./Control/roomCode/roomCode";
import CustomDialog from "./CustomDialog";
import "./game.css";
import socket from "../socket";
const Game = ({ players, room, username, orientation, cleanup }) => {
  console.log(orientation);
  const [over, setOver] = useState("");

  useEffect(() => {
    socket.on("playerDisconnected", (player) => {
      setOver(`${player.username} has disconnected.`);
    });
  }, []);

  useEffect(() => {
    socket.on("closeRoom", ({ roomId }) => {
      if (roomId === room) {
        cleanup();
      }
    });
  }, [room, cleanup]);
  return (
    <div className="game">
      <div className="content">
        <Board players={players} room={room} orientation={orientation} />
        <Control>
          <MovesList />
        </Control>
        <CustomDialog
          open={Boolean(over)}
          title={over}
          contextText={over}
          handleContinue={() => {
            socket.emit("closeRoom", { roomId: room });
            setOver("");
          }}
        />
      </div>
      <div className="room-code">
        <RoomCode room={room} players={players} />
      </div>
    </div>
  );
};

export default Game;
