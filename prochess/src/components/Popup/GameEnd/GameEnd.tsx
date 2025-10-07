import { Status } from "../../../constant";
import { UseAppContext } from "../../../context/context";
import { setupNewGame } from "../../../reducer/actions/game";
import "./gameEnd.css";
const GameEnd = () => {
  const {
    appState: { status },
    dispatch,
  } = UseAppContext();
  if (status === Status.ongoing || status === Status.promoting) {
    return null;
  }
  const isWin = status.endsWith("wins");
  const newGame = () => {
    dispatch(setupNewGame());
  };
  return (
    <div className="popup-inner popup-center">
      <h1>{isWin ? "Checkmate!" : "Draw!"}</h1>
      <p>{`${status}!`}</p>
      <div className="status"></div>
      <button className="game-end-button" onClick={newGame}>
        newGame
      </button>
    </div>
  );
};
export default GameEnd;
