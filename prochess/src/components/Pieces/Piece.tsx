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
  const isDraggingRef = useRef(false); // Track if currently dragging

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

  // Desktop drag handlers
  const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Prevent drag if touch is being used
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

  // Mobile touch handlers
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchMoveRef.current = true;
    isDraggingRef.current = true;
    const touch = e.touches[0];
    const target = e.currentTarget;

    handleMoveStart();

    // Get the actual rendered size and position of the piece
    const rect = target.getBoundingClientRect();

    // Create a clone for visual feedback
    const clone = target.cloneNode(true) as HTMLDivElement;
    clone.style.position = "fixed";
    clone.style.pointerEvents = "none";
    clone.style.zIndex = "1000";
    clone.style.opacity = "0.8";
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.transform = "none"; // Remove the translate transform
    clone.style.left = `${touch.clientX - rect.width / 2}px`;
    clone.style.top = `${touch.clientY - rect.height / 2}px`;

    // Remove the position class to prevent inherited transforms
    clone.className = `piece ${piece}`;

    document.body.appendChild(clone);
    cloneRef.current = clone;

    // Hide original piece
    target.style.opacity = "0.3";
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    // Only update if we're still dragging
    if (!isDraggingRef.current) return;

    e.preventDefault();
    const touch = e.touches[0];

    if (cloneRef.current) {
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();

      cloneRef.current.style.left = `${touch.clientX - rect.width / 2}px`;
      cloneRef.current.style.top = `${touch.clientY - rect.height / 2}px`;
    }
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();

    // Immediately stop processing further touch moves
    isDraggingRef.current = false;

    const touch = e.changedTouches[0];
    const target = e.currentTarget;

    // Find the pieces container and manually call the parent's move function
    const piecesContainer = target.closest(".pieces") as HTMLElement;
    if (piecesContainer) {
      // Get the parent component's onDrop handler through a custom event
      const dropEvent = new CustomEvent("touchDrop", {
        detail: {
          clientX: touch.clientX,
          clientY: touch.clientY,
          piece,
          rank,
          file,
        },
        bubbles: true,
      });
      piecesContainer.dispatchEvent(dropEvent);
    }

    // Cleanup clone immediately
    if (cloneRef.current) {
      cloneRef.current.remove();
      cloneRef.current = null;
    }
    target.style.opacity = "1";

    // Reset touch flag after a short delay
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
