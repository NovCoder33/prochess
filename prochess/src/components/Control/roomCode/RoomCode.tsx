import { useEffect, useState } from "react";
import "./roomCode.css";
const RoomCode = ({ room, players }) => {
  console.log(room);
  const [text, setText] = useState("Waiting for someone to join...");
  const rId = room.roomId;
  let playerCount = players.length;
  console.log(playerCount);
  console.log(rId);
  useEffect(() => {
    playerCount = players.length;
    if (playerCount !== 2) {
      setText("Waiting for someone to join...");
    } else {
      setText("Two players have joined!");
    }
  }, [[], players, room]);
  return (
    <div className="roomCode">
      <p>Room Code: {rId}</p>
      <p>{text}</p>
    </div>
  );
};
export default RoomCode;
