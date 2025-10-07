import arbiter from "../../arbiter/arbiter";
import { UseAppContext } from "../../context/context";
import { generateCandidateMoves } from "../../reducer/actions/move";

interface pieceProps {
  rank: number;
  file: number;
  displayRank: number;
  displayFile: number;
  piece: string[];
}

const Piece = ({ rank, file, displayRank, displayFile, piece }: pieceProps) => {
  const { appState, dispatch } = UseAppContext();
  const { turn, castleDirection, position: currentPosition } = appState;

  const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer?.setData("text/plain", `${piece},${rank},${file}`);
    setTimeout(() => {
      if (e?.nativeEvent?.target) {
        (e.nativeEvent.target as HTMLElement).style.display = "none";
      }
    }, 0);
    if (turn === piece[0]) {
      const candidateMoves = arbiter.getValidMoves({
        currentPosition: currentPosition[currentPosition.length - 1],
        prevPosition: currentPosition[currentPosition.length - 2],
        castleDirection: castleDirection[turn],
        piece,
        rank,
        file,
      });
      dispatch(generateCandidateMoves({ candidateMoves }));
    }
  };
  const onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (e?.nativeEvent?.target) {
      (e.nativeEvent.target as HTMLElement).style.display = "block";
    }
  };
  return (
    <div
      className={`piece ${piece} p-${displayFile}${displayRank}`}
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    ></div>
  );
};
export default Piece;
