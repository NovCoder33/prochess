import { UseAppContext } from "../../../context/context";

import { copyPosition, getNewMoveNotation } from "../../../helper";
import { clearCandidates, makeNewMove } from "../../../reducer/actions/move";
import socket from "../../../socket";
import "./promotionBox.css";

const PromotionBox = ({ onClosePopup, room }) => {
  const options = ["q", "r", "b", "n"];
  const { appState, dispatch } = UseAppContext();
  const { promotionSquare } = appState;
  if (!promotionSquare) {
    return null;
  }
  const color = promotionSquare.x === 7 ? "w" : "b";
  const onClick = (option) => {
    onClosePopup();
    const newPosition = copyPosition(
      appState.position[appState.position.length - 1]
    );

    newPosition[promotionSquare.rank][promotionSquare.file] = "";
    newPosition[promotionSquare.x][promotionSquare.y] = color + option;
    dispatch(clearCandidates());
    const newMove = getNewMoveNotation({
      ...promotionSquare,
      piece: color + "p",
      promotesTo: option,
      pos: appState.position[appState.position.length - 1],
    });
    dispatch(makeNewMove({ newPosition, newMove }));
    const moveData = {
      currentPosition: appState.position[appState.position.length - 1],
      piece: color + "p",
      rank: promotionSquare.rank,
      file: promotionSquare.file,
      x: promotionSquare.x,
      y: promotionSquare.y,
      promotesTo: option,
    };
    socket.emit("move", {
      moveData,
      room: room.roomId,
      gameStatus: "promoting", // Send status, don't mutate appState
    });
  };
  return (
    <div className="popup-inner promotion-choices">
      {options.map((option) => (
        <div
          key={option}
          className={`piece ${color}${option}`}
          onClick={() => onClick(option)}
        ></div>
      ))}
    </div>
  );
};

export default PromotionBox;
