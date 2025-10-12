import { useEffect, useState } from "react";
import { Status } from "../../../constant";
import { UseAppContext } from "../../../context/context";
import { setupNewGame } from "../../../reducer/actions/game";
import socket from "../../../socket";
import "./gameEnd.css";

const GameEnd = ({ room }) => {
  const [pCount, setPCount] = useState(0);
  const [hasClickedRematch, setHasClickedRematch] = useState(false);

  useEffect(() => {
    const handleRematchRequest = () => {
      setPCount((prev) => prev + 1);
    };
    const resetGame = () => {
      dispatch(setupNewGame());
      setPCount(0);
      setHasClickedRematch(false);
    };

    socket.on("rematchRequested", handleRematchRequest);
    socket.on("gameReset", resetGame);

    return () => {
      socket.off("rematchRequested", handleRematchRequest);
      socket.off("gameReset", resetGame);
    };
  }, []);

  const {
    appState: { status },
    dispatch,
  } = UseAppContext();

  if (status === Status.ongoing || status === Status.promoting) {
    return null;
  }

  const isWin = status.endsWith("wins");

  const newGame = () => {
    socket.emit("newGameStarted", { roomId: room.roomId });
  };

  const increase = () => {
    if (hasClickedRematch) return;

    setHasClickedRematch(true);
    socket.emit("rematchRequested", { roomId: room.roomId });
  };

  return (
    <div className="popup-inner popup-center">
      <h1>{isWin ? "Checkmate!" : "Draw!"}</h1>
      <p>{`${status}! ${pCount}/2`}</p>
      <div className="status"></div>
      <button
        className="game-end-button"
        onClick={pCount === 2 ? newGame : increase}
        disabled={hasClickedRematch && pCount < 2}
      >
        {pCount === 2
          ? "New Game"
          : hasClickedRematch
          ? "Waiting..."
          : "Rematch"}
      </button>
    </div>
  );
};

export default GameEnd;
