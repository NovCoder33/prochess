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

    if (orientation === "b") {
      x = 7 - x;
      y = 7 - y;
    }

    return { x, y };
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
    const { x, y } = calculateCoords(e);
    const [piece, rank, file] = e.dataTransfer.getData("text").split(",");
    const pieceRank = parseInt(rank);
    const pieceFile = parseInt(file);

    if (appState.turn != orientation[0]) {
      dispatch(clearCandidates());
      return false;
    }
    if (players.length !== 2) {
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
          if (!item || !Array.isArray(item)) return;

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
        promotesTo: null,
      });

      const allPositions = [...appState.position, newPosition];

      const threeFoldList = findAllOccurrences(allPositions);

      if (threeFoldList.length > 2) {
        dispatch(detectThreeFoldRepetition());
        gameStatus = "three_fold";
      }

      dispatch(makeNewMove({ newPosition, newMove }));

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
        dispatch(detectCheckmate(opponent));
        gameStatus = "checkmate";
      }

      socket.emit(
        "move",
        {
          moveData,
          room: room.roomId,
          gameStatus,
        },
        (acknowledgment) => {
          if (!acknowledgment) {
            console.error("Move not acknowledged by server");
          }
        }
      );
    }

    dispatch(clearCandidates());
  };

  useEffect(() => {
    const handleOpponentMove = (data) => {
      const { moveData, gameStatus } = data;
      const opponent = moveData.piece.startsWith("w") ? "b" : "w";
      let newPosition;

      if (gameStatus === "promoting") {
        newPosition = copyPosition(moveData.currentPosition);
        newPosition[moveData.rank][moveData.file] = "";
        newPosition[moveData.x][moveData.y] =
          moveData.piece.charAt(0) + moveData.promotesTo;
      } else {
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
        dispatch(detectCheckmate(opponent));
        appState.status = opponent == "w" ? Status.white : Status.black;
      }
    };
    const handleDisconnect = () => {
      console.log("⚠️ Socket disconnected");
    };

    const handleReconnect = () => {
      console.log("✅ Socket reconnected");
    };
    socket.on("move", handleOpponentMove);

    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleReconnect);

    return () => {
      socket.off("move", handleOpponentMove);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleReconnect);
    };
  }, [pos, dispatch]);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setMoveCount((moveCount) => (moveCount += 1));
    move(e);
  };
  const handleTouchDrop = (e: TouchEvent) => {
    e.preventDefault();

    // Convert touch event to drag event format
    const syntheticDragEvent = {
      preventDefault: () => {},
      clientX: (e as any).clientX,
      clientY: (e as any).clientY,
      dataTransfer: (e as any).dataTransfer,
    } as React.DragEvent<HTMLDivElement>;

    setMoveCount((moveCount) => moveCount + 1);
    move(syntheticDragEvent);
  };

  useEffect(() => {
    const piecesElement = ref.current;

    const handleTouchDrop = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { clientX, clientY, piece, rank, file } = customEvent.detail;

      // Create synthetic drag event
      const syntheticEvent = {
        preventDefault: () => {},
        clientX,
        clientY,
        dataTransfer: {
          getData: (type: string) => {
            if (type === "text") {
              return `${piece},${rank},${file}`;
            }
            return "";
          },
        },
      } as React.DragEvent<HTMLDivElement>;

      setMoveCount((moveCount) => moveCount + 1);
      move(syntheticEvent);
    };

    if (piecesElement) {
      piecesElement.addEventListener("touchDrop", handleTouchDrop);
    }

    return () => {
      if (piecesElement) {
        piecesElement.removeEventListener("touchDrop", handleTouchDrop);
      }
    };
  }, [pos, appState, move]);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  return (
    <div ref={ref} onDrop={onDrop} onDragOver={onDragOver} className="pieces">
      {pos.map((r, rank) =>
        r.map((f, file) => {
          if (!pos[rank][file]) return null;

          const displayRank = orientation === "b" ? 7 - rank : rank;
          const displayFile = orientation === "b" ? 7 - file : file;

          return (
            <Piece
              key={rank + file}
              rank={rank}
              file={file}
              displayRank={displayRank}
              displayFile={displayFile}
              piece={pos[rank][file]}
            />
          );
        })
      )}
    </div>
  );
};

export default Pieces;
