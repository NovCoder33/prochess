import "./board.css";
import Ranks from "./Bits/Ranks";
import Files from "./Bits/Files";
import Pieces from "./Pieces/Peices";
import { UseAppContext } from "../context/context";
import Popup from "./Popup/Popup";
import arbiter from "../arbiter/arbiter";
import { getKingPos } from "../arbiter/getMoves";
import PromotionBox from "./Popup/PromotionBox/PromotionBox";
import GameEnd from "./Popup/GameEnd/GameEnd";
import { closePopup } from "../reducer/actions/popup";
const Board = ({ room, orientation, players }) => {
  const { appState, dispatch } = UseAppContext();
  const position = appState.position[appState.position.length - 1];

  const isChecked = (() => {
    const isInCheck = arbiter.isPlayerInCheck({
      positionAfterMoves: position,
      currentPosition: position,
      player: appState.turn,
    });
    if (isInCheck) {
      return getKingPos(position, appState.turn);
    }
    return null;
  })();
  let ranks = [];
  let files = [];
  if (orientation === "w") {
    ranks = Array(8)
      .fill("")
      .map((x, i) => 8 - i);
    files = Array(8)
      .fill("")
      .map((x, i) => i + 1);
  } else {
    ranks = Array(8)
      .fill("")
      .map((x, i) => i + 1);
    files = Array(8)
      .fill("")
      .map((x, i) => 8 - i);
  }
  function getClassName(i: number, j: number): string | undefined {
    let c = "tile";
    c += (i + j) % 2 == 0 ? " tile--dark" : " tile--light";

    let boardI = i;
    let boardJ = j;

    if (orientation === "b") {
      boardI = 7 - i;
      boardJ = 7 - j;
    }

    if (
      appState.candidateMoves?.find((m) => m[0] === boardI && m[1] === boardJ)
    ) {
      if (position[boardI][boardJ]) {
        c += " attacking";
      } else {
        c += " highlight";
      }
    }

    if (isChecked && isChecked[0] === boardI && isChecked[1] === boardJ) {
      c += " checked";
    }

    return c;
  }
  const onClosePopup = () => {
    dispatch(closePopup());
  };
  return (
    <div className="board">
      <Ranks ranks={ranks} />
      <div className="tiles">
        {ranks.map((rank, i) =>
          files.map((file, j) => (
            <div key={file + rank} className={getClassName(7 - i, j)}></div>
          ))
        )}
      </div>
      <Pieces orientation={orientation} room={room} players={players} />
      <Popup>
        <PromotionBox onClosePopup={onClosePopup} room={room} />
        <GameEnd room={room} />
      </Popup>

      <Files files={files}></Files>
    </div>
  );
};
export default Board;
