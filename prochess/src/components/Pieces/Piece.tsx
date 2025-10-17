import { useRef } from "react";
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
  const cloneRef = useRef<HTMLDivElement | null>(null);
  const touchMoveRef = useRef(false);
  const isDraggingRef = useRef(false);
  const pieceDimensionsRef = useRef({ width: 0, height: 0 });

  const handleMoveStart = () => {
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

  const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (touchMoveRef.current) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer?.setData("text/plain", `${piece},${rank},${file}`);
    setTimeout(() => {
      if (e?.nativeEvent?.target) {
        (e.nativeEvent.target as HTMLElement).style.display = "none";
      }
    }, 0);
    handleMoveStart();
  };

  const onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (e?.nativeEvent?.target) {
      (e.nativeEvent.target as HTMLElement).style.display = "block";
    }
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchMoveRef.current = true;
    isDraggingRef.current = true;
    const touch = e.touches[0];
    const target = e.currentTarget;

    handleMoveStart();

    const rect = target.getBoundingClientRect();

    pieceDimensionsRef.current = { width: rect.width, height: rect.height };

    const clone = target.cloneNode(true) as HTMLDivElement;
    clone.style.position = "fixed";
    clone.style.pointerEvents = "none";
    clone.style.zIndex = "1000";
    clone.style.opacity = "0.8";
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.transform = "none";
    clone.style.left = `${touch.clientX - rect.width / 2}px`;
    clone.style.top = `${touch.clientY - rect.height / 2}px`;

    clone.className = `piece ${piece}`;

    document.body.appendChild(clone);
    cloneRef.current = clone;

    target.style.opacity = "0.3";
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    e.preventDefault();
    const touch = e.touches[0];

    if (cloneRef.current) {
      const { width, height } = pieceDimensionsRef.current;

      cloneRef.current.style.left = `${touch.clientX - width / 2}px`;
      cloneRef.current.style.top = `${touch.clientY - height / 2}px`;
    }
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();

    isDraggingRef.current = false;

    const touch = e.changedTouches[0];
    const target = e.currentTarget;

    const boardContainer = target.closest(".pieces") as HTMLElement;

    if (boardContainer) {
      const boardRect = boardContainer.getBoundingClientRect();
      const boardWidth = boardRect.width;
      const boardLeft = boardRect.left;
      const boardTop = boardRect.top;

      const squareSize = boardWidth / 8;
      const relativeX = touch.clientX - boardLeft;
      const relativeY = touch.clientY - boardTop;

      const clampedX = Math.max(0, Math.min(relativeX, boardWidth - 1));
      const clampedY = Math.max(0, Math.min(relativeY, boardWidth - 1));

      let targetFile = Math.floor(clampedX / squareSize);
      let targetRank = 7 - Math.floor(clampedY / squareSize);
      targetFile = Math.max(0, Math.min(7, targetFile));
      targetRank = Math.max(0, Math.min(7, targetRank));

      console.log(
        `Touch dropped at screen: (${touch.clientX}, ${touch.clientY}), Board square: (${targetRank}, ${targetFile})`
      );

      const dropEvent = new CustomEvent("touchDrop", {
        detail: {
          clientX: touch.clientX,
          clientY: touch.clientY,
          piece,
          rank,
          file,
          targetRank,
          targetFile,
          boardRect: {
            left: boardLeft,
            top: boardTop,
            width: boardWidth,
          },
        },
        bubbles: true,
      });
      boardContainer.dispatchEvent(dropEvent);
    }

    if (cloneRef.current) {
      cloneRef.current.remove();
      cloneRef.current = null;
    }
    target.style.opacity = "1";

    setTimeout(() => {
      touchMoveRef.current = false;
    }, 100);
  };

  return (
    <div
      className={`piece ${piece} p-${displayFile}${displayRank}`}
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: "none" }}
    ></div>
  );
};

export default Piece;
