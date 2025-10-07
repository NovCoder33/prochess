import { useEffect, useRef, useState, type DragEvent } from "react";
import { copyPosition, getNewMoveNotation } from "../../helper";
import "./peices.css";
import Piece from "./Piece";
import { UseAppContext } from "../../context/context";
import { clearCandidates, makeNewMove } from "../../reducer/actions/move";
import arbiter from "../../arbiter/arbiter";
import { Status } from "../../constant";
import socket from "../../socket";
import { openPromotion } from "../../reducer/actions/popup";
import {
  detect50MoveRule,
  detectCheckmate,
  detectInsufficientMaterial,
  detectStalemate,
  detectThreeFoldRepetition,
  updateCastling,
} from "../../reducer/actions/game";
import { getCastleDirections } from "../../arbiter/getMoves";
import { init_tables, minmax } from "../../ai/evaluation";
const Pieces = ({ orientation, players, room }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { appState, dispatch } = UseAppContext();
  const pos = appState.position[appState.position.length - 1];
  const [moveCount, setMoveCount] = useState(0);
  let turn = useRef(-1);
  const calculateCoords = (e: React.DragEvent<HTMLDivElement>) => {
    const { width, left, top } = ref.current?.getBoundingClientRect() ?? {
      width: 0,
      left: 0,
      top: 0,
    };
    const size = width / 8;
    let y = Math.floor((e.clientX - left) / size);
    let x = 7 - Math.floor((e.clientY - top) / size);

    // Convert visual coordinates to board coordinates for black player
    if (orientation === "b") {
      x = 7 - x;
      y = 7 - y;
    }

    return { x, y }; // Always return standard board coordinates
  };

  const openPromotionBox = ({ rank, file, x, y }) => {
    dispatch(openPromotion({ rank, file, x, y }));
  };

  const updateCastlingState = ({ piece, rank, file }) => {
    const direction = getCastleDirections({
      castleDirections: appState.castleDirection,
      piece,
      rank,
      file,
    });

    if (direction) {
      dispatch(updateCastling({ direction }));
    }
  };
  const move = (e: DragEvent<HTMLDivElement>) => {
    const { x, y } = calculateCoords(e); // This is the DROP position (already flipped)
    const [piece, rank, file] = e.dataTransfer.getData("text").split(",");
    console.log(players);
    // Convert rank/file from string to number
    const pieceRank = parseInt(rank);
    const pieceFile = parseInt(file);
    console.log("=== MOVE DEBUG ===");
    console.log("Player orientation:", orientation);
    console.log("Piece being moved:", piece);
    console.log("Drag data - rank:", pieceRank, "file:", pieceFile);
    console.log("Drop coordinates - x:", x, "y:", y);
    console.log("Raw calculateCoords result:", calculateCoords(e));
    if (appState.turn != orientation[0]) {
      console.log("returning at turn !== orientation");
      console.log(appState.turn);
      console.log(orientation);
      dispatch(clearCandidates());
      return false;
    }
    if (players.length !== 2) {
      console.log("returning at len > 2");
      dispatch(clearCandidates());
      return false;
    }

    const opponent = piece.startsWith("w") ? "b" : "w";
    const castleDirection =
      appState.castleDirection[`${piece.startsWith("b") ? "w" : "b"}`];
    if (appState.candidateMoves?.find((m) => m[0] === x && m[1] === y)) {
      if ((piece === "wp" && x === 7) || (piece === "bp" && x === 0)) {
        openPromotionBox({ rank, file, x, y });
        return;
      }
      if (piece.endsWith("r") || piece.endsWith("k")) {
        updateCastlingState({ piece, rank, file });
      }

      const moveData = {
        currentPosition: pos,
        piece,
        rank: pieceRank,
        file: pieceFile,
        x,
        y,
        promotesTo: "q",
      };
      const newPosition = arbiter.performMoves(moveData);
      let gameStatus = null;
      const findAllOccurrences = (arr) => {
        const seen = new Map();

        arr.forEach((item, index) => {
          // ✅ Skip empty or invalid positions
          if (!item || !Array.isArray(item)) return;

          // Check if position has any pieces (not all empty)
          const hasPieces = item.some(
            (row) =>
              Array.isArray(row) &&
              row.some((square) => square !== "" && square !== null)
          );

          if (!hasPieces) return;

          const key = JSON.stringify(item);

          if (seen.has(key)) {
            seen.get(key).push(index);
          } else {
            seen.set(key, [index]);
          }
        });

        // Return only positions that appear 3+ times
        return Array.from(seen.entries())
          .filter(([key, indices]) => indices.length >= 3)
          .map(([key, indices]) => ({ value: JSON.parse(key), indices }));
      };
      const newMove = getNewMoveNotation({
        piece,
        rank,
        file,
        x,
        y,
        pos,
      });

      const allPositions = [...appState.position, newPosition];
      console.log("Checking positions, total count:", allPositions.length);

      const threeFoldList = findAllOccurrences(allPositions);

      console.log("Positions that repeat 3+ times:", threeFoldList);

      if (threeFoldList.length > 2) {
        console.log("THREEFOLD REPETITION DETECTED!");
        dispatch(detectThreeFoldRepetition());
        gameStatus = "three_fold";
      }

      dispatch(makeNewMove({ newPosition, newMove }));

      console.log("emitted move");
      if (moveCount < 50) {
        if (newMove.includes("x")) {
          setMoveCount(0);
        }
        if (piece.endsWith("p")) {
          setMoveCount(0);
        }
      } else {
        dispatch(detect50MoveRule());
        gameStatus = "fifty";
      }

      if (arbiter.insufficientMaterial(newPosition)) {
        dispatch(detectInsufficientMaterial());
        gameStatus = "insufficient";
      } else if (
        arbiter.isStalemate({
          position: newPosition,
          player: opponent,
          castleDirection,
        })
      ) {
        dispatch(detectStalemate());
        gameStatus = "stalemate";
      } else if (
        arbiter.isCheckmate({
          position: newPosition,
          player: opponent,
          castleDirection,
        })
      ) {
        dispatch(detectCheckmate());
        gameStatus = "checkmate";
      }

      // Move socket emit inside the valid move block
      socket.emit("move", {
        moveData,
        room: room.roomId,
        gameStatus, // Send status, don't mutate appState
      });
    }

    dispatch(clearCandidates());
  };
  let x = 0;

  useEffect(() => {
    const handleOpponentMove = (data) => {
      const { moveData, gameStatus } = data; // This is the OPPONENT'S move data
      const opponent = moveData.piece.startsWith("w") ? "b" : "w";
      let newPosition;

      if (gameStatus === "promoting") {
        // Handle promotion moves specially
        newPosition = copyPosition(moveData.currentPosition);
        newPosition[moveData.rank][moveData.file] = ""; // Remove the pawn
        newPosition[moveData.x][moveData.y] =
          moveData.piece.charAt(0) + moveData.promotesTo; // Place promoted piece
      } else {
        // Handle regular moves
        newPosition = arbiter.performMoves(moveData);
      }

      const newMove = getNewMoveNotation({
        piece: moveData.piece,
        rank: moveData.rank,
        file: moveData.file,
        x: moveData.x,
        y: moveData.y,
        pos: moveData.currentPosition,
        promotesTo:
          gameStatus === "promoting" ? moveData.promotesTo : undefined,
      });

      dispatch(makeNewMove({ newPosition, newMove }));
      if (gameStatus == "three_fold") {
        dispatch(detectThreeFoldRepetition());
        appState.status = Status.three_fold;
      }
      if (gameStatus == "fifty") {
        dispatch(detect50MoveRule());
        appState.status = Status.fifty;
      }
      if (arbiter.insufficientMaterial(newPosition)) {
        dispatch(detectInsufficientMaterial());
        appState.status = Status.insufficient;
      } else if (
        arbiter.isStalemate({
          position: newPosition,
          player: opponent,
          castleDirection: appState.castleDirection,
        })
      ) {
        dispatch(detectStalemate());
        appState.status = Status.stalemate;
      } else if (
        arbiter.isCheckmate({
          position: newPosition,
          player: opponent,
          castleDirection: appState.castleDirection,
        })
      ) {
        dispatch(detectCheckmate());
        appState.status = opponent == "w" ? Status.white : Status.black;
      }
    };

    socket.on("move", handleOpponentMove);

    return () => {
      socket.off("move", handleOpponentMove);
    };
  }, [pos, dispatch]);

  useEffect(() => {
    console.log(turn);

    const bestMove = minmax(
      pos.flat(),
      3,
      -Infinity,
      Infinity,
      ++turn % 2 == 0 ? true : false,
      Status.ongoing
    );
    console.log(
      `move the ${bestMove.move?.piece} from ${bestMove.move?.fromSquare} to ${bestMove.move?.toSquare}`
    );
  }, [appState.position]);
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setMoveCount((moveCount) => (moveCount += 1));
    move(e);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  return (
    // ✅ Add return statement
    <div ref={ref} onDrop={onDrop} onDragOver={onDragOver} className="pieces">
      {pos.map((r, rank) =>
        r.map((f, file) => {
          if (!pos[rank][file]) return null;

          // Adjust visual position for black player
          const displayRank = orientation === "b" ? 7 - rank : rank;
          const displayFile = orientation === "b" ? 7 - file : file;

          return (
            <Piece
              key={rank + file}
              rank={rank} // Pass actual board coordinates for drag data
              file={file} // Pass actual board coordinates for drag data
              displayRank={displayRank} // Pass display coordinates for positioning
              displayFile={displayFile} // Pass display coordinates for positioning
              piece={pos[rank][file]}
            />
          );
        })
      )}
    </div>
  );
};

export default Pieces;
