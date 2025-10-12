import "./roomCode.css";
const RoomCode = ({ room, playerText }) => {
  const rId = room.roomId;

  return (
    <div className="roomCode">
      <p>Room Code: {rId}</p>
      <p>{playerText}</p>
    </div>
  );
};
export default RoomCode;
