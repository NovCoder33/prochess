import arbiter from "./arbiter";

export const getRookMoves = ({ currentPosition, piece, rank, file }) => {
  const moves: number[][] = [];
  const us = piece[0];
  const enemy = us === "w" ? "b" : "w";
  const direction = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  direction.forEach((dir) => {
    for (let i = 1; i < 8; i++) {
      const x = rank + i * dir[0];
      const y = file + i * dir[1];
      if (currentPosition?.[x]?.[y] === undefined) {
        break;
      }
      if (currentPosition?.[x]?.[y]?.startsWith(enemy)) {
        moves.push([x, y]);
        break;
      }
      if (currentPosition?.[x]?.[y]?.startsWith(us)) {
        break;
      }
      moves.push([x, y]);
    }
  });
  return moves;
};

export const getKnightMoves = ({ currentPosition, rank, file }) => {
  const moves: number[][] = [];
  const enemy = currentPosition[rank][file].startsWith("w") ? "b" : "w";
  const direction = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];
  direction.forEach((dir) => {
    const cell = currentPosition?.[rank + dir[0]]?.[file + dir[1]];
    if ((cell !== undefined && cell.startsWith(enemy)) || cell === "") {
      moves.push([rank + dir[0], file + dir[1]]);
    }
  });
  return moves;
};

export const getBishopMoves = ({ currentPosition, piece, rank, file }) => {
  const moves: number[][] = [];
  const us = piece[0];
  const enemy = us === "w" ? "b" : "w";
  const direction = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];

  direction.forEach((dir) => {
    for (let i = 1; i < 8; i++) {
      const x = rank + i * dir[0];
      const y = file + i * dir[1];
      if (currentPosition?.[x]?.[y] === undefined) {
        break;
      }
      if (currentPosition?.[x]?.[y]?.startsWith(enemy)) {
        moves.push([x, y]);
        break;
      }
      if (currentPosition?.[x]?.[y]?.startsWith(us)) {
        break;
      }
      moves.push([x, y]);
    }
  });
  return moves;
};

export const getQueenMoves = ({ currentPosition, piece, rank, file }) => {
  const moves: number[][] = [];
  const us = piece[0];
  const enemy = us === "w" ? "b" : "w";
  const direction = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  direction.forEach((dir) => {
    for (let i = 1; i < 8; i++) {
      const x = rank + i * dir[0];
      const y = file + i * dir[1];
      if (currentPosition?.[x]?.[y] === undefined) {
        break;
      }
      if (currentPosition?.[x]?.[y]?.startsWith(enemy)) {
        moves.push([x, y]);
        break;
      }
      if (currentPosition?.[x]?.[y]?.startsWith(us)) {
        break;
      }
      moves.push([x, y]);
    }
  });
  return moves;
};

export const getKingMoves = ({ currentPosition, piece, rank, file }) => {
  const moves: number[][] = [];
  const enemy = currentPosition[rank][file].startsWith("w") ? "b" : "w";
  const direction = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  direction.forEach((dir) => {
    const x = rank + dir[0];
    const y = file + dir[1];

    if (
      currentPosition?.[x]?.[y] !== undefined &&
      !currentPosition[x][y].startsWith(piece[0])
    ) {
      moves.push([x, y]);
    }
  });
  return moves;
};

export const getPawnMoves = ({ currentPosition, piece, rank, file }) => {
  const moves = [];
  const dir = piece === "wp" ? 1 : -1;
  const enemy = piece[0] === "w" ? "b" : "w";
  if (
    currentPosition?.[rank + dir]?.[file] !== undefined &&
    currentPosition?.[rank + dir]?.[file] == ""
  ) {
    moves.push([rank + dir, file]);
  }
  if (rank % 5 === 1) {
    if (
      currentPosition?.[rank + dir][file] === "" &&
      currentPosition?.[rank + dir + dir]?.[file] === ""
    ) {
      moves.push([rank + dir + dir, file]);
    }
  }
  return moves;
};

export const getPawnCaptures = ({
  currentPosition,
  prevPosition,
  piece,
  rank,
  file,
}) => {
  const moves = [];
  const dir = piece === "wp" ? 1 : -1;
  const enemy = piece[0] === "w" ? "b" : "w";
  if (
    currentPosition?.[rank + dir]?.[file - 1] &&
    currentPosition?.[rank + dir]?.[file - 1].startsWith(enemy)
  ) {
    moves.push([rank + dir, file - 1]);
  }
  if (
    currentPosition?.[rank + dir]?.[file + 1] &&
    currentPosition?.[rank + dir]?.[file + 1].startsWith(enemy)
  ) {
    moves.push([rank + dir, file + 1]);
  }

  const enemyPawn = dir === 1 ? "bp" : "wp";
  const pawnRotation = [file - 1, file + 1];
  if (prevPosition !== undefined) {
    if ((dir === 1 && rank === 4) || (dir === -1 && rank === 3)) {
      pawnRotation.forEach((p) => {
        if (
          currentPosition?.[rank]?.[p] === enemyPawn &&
          currentPosition?.[rank + dir + dir]?.[p] === "" &&
          prevPosition?.[rank]?.[p] === "" &&
          prevPosition?.[rank + dir + dir]?.[p] === enemyPawn
        ) {
          moves.push([rank + dir, p]);
        }
      });
    }
  }

  return moves;
};

export const getCastlingMoves = ({
  currentPosition,
  castleDirection,
  piece,
  rank,
  file,
}) => {
  const moves: number[][] = [];
  if (file !== 4 || rank % 7 !== 0 || castleDirection === "none") {
    return moves;
  }

  if (piece.startsWith("w")) {
    if (
      arbiter.isPlayerInCheck({
        positionAfterMoves: currentPosition,
        currentPosition,
        player: "w",
      })
    ) {
      return moves;
    }
    if (
      (["left", "both"].includes(castleDirection) ||
        ["left"].includes(castleDirection.direction)) &&
      !currentPosition[0][3] &&
      !currentPosition[0][2] &&
      !currentPosition[0][1] &&
      currentPosition[0][0] === "wr" &&
      !arbiter.isPlayerInCheck({
        positionAfterMoves: arbiter.performMoves({
          currentPosition,
          piece,
          rank,
          file,
          x: 0,
          y: 3,
        }),
        currentPosition,
        player: "w",
      }) &&
      !arbiter.isPlayerInCheck({
        positionAfterMoves: arbiter.performMoves({
          currentPosition,
          piece,
          rank,
          file,
          x: 0,
          y: 2,
        }),
        currentPosition,
        player: "w",
      })
    ) {
      moves.push([0, 2]);
    }
    if (
      (["right", "both"].includes(castleDirection) ||
        ["right"].includes(castleDirection.direction)) &&
      !currentPosition[0][5] &&
      !currentPosition[0][6] &&
      currentPosition[0][7] === "wr" &&
      !arbiter.isPlayerInCheck({
        positionAfterMoves: arbiter.performMoves({
          currentPosition,
          piece,
          rank,
          file,
          x: 0,
          y: 5,
        }),
        currentPosition,
        player: "w",
      }) &&
      !arbiter.isPlayerInCheck({
        positionAfterMoves: arbiter.performMoves({
          currentPosition,
          piece,
          rank,
          file,
          x: 0,
          y: 6,
        }),
        currentPosition,
        player: "w",
      })
    ) {
      moves.push([0, 6]);
    }
  } else {
    if (
      arbiter.isPlayerInCheck({
        positionAfterMoves: currentPosition,
        currentPosition,
        player: "w",
      })
    ) {
      return moves;
    }
    if (
      (["left", "both"].includes(castleDirection) ||
        ["left"].includes(castleDirection.direction)) &&
      !currentPosition[7][3] &&
      !currentPosition[7][2] &&
      !currentPosition[7][1] &&
      currentPosition[7][0] === "br" &&
      !arbiter.isPlayerInCheck({
        positionAfterMoves: arbiter.performMoves({
          currentPosition,
          piece,
          rank,
          file,
          x: 6,
          y: 3,
        }),
        currentPosition,
        player: "b",
      }) &&
      !arbiter.isPlayerInCheck({
        positionAfterMoves: arbiter.performMoves({
          currentPosition,
          piece,
          rank,
          file,
          x: 7,
          y: 2,
        }),
        currentPosition,
        player: "b",
      })
    ) {
      moves.push([7, 2]);
    }
    if (
      (["right", "both"].includes(castleDirection) ||
        ["right"].includes(castleDirection.direction)) &&
      !currentPosition[7][5] &&
      !currentPosition[7][6] &&
      currentPosition[7][7] === "br" &&
      !arbiter.isPlayerInCheck({
        positionAfterMoves: arbiter.performMoves({
          currentPosition,
          piece,
          rank,
          file,
          x: 7,
          y: 5,
        }),
        currentPosition,
        player: "b",
      }) &&
      !arbiter.isPlayerInCheck({
        positionAfterMoves: arbiter.performMoves({
          currentPosition,
          piece,
          rank,
          file,
          x: 7,
          y: 6,
        }),
        currentPosition,
        player: "b",
      })
    ) {
      moves.push([7, 6]);
    }
  }
  return moves;
};

export const getCastleDirections = ({
  castleDirections,
  piece,
  rank,
  file,
}) => {
  rank = Number(rank);
  file = Number(file);
  const direction = castleDirections[piece[0]];
  if (piece.endsWith("k")) {
    return "none";
  }
  if (file === 0 && rank === 0) {
    if (direction === "both") {
      return "right";
    } else {
      return "none";
    }
  }
  if (file === 7 && rank === 0) {
    if (direction === "both") {
      return "left";
    } else {
      return "none";
    }
  }
  if (file === 0 && rank === 7) {
    if (direction === "both") {
      return "right";
    } else {
      return "none";
    }
  }
  if (file === 7 && rank === 7) {
    if (direction === "both") {
      return "left";
    } else {
      return "none";
    }
  }
};
export const getKingPos = (positionAfterMoves, player) => {
  let kingPos;

  positionAfterMoves.forEach((rank, x) => {
    console.log("Rank at index", x, ":", rank, "Type:", typeof rank);

    // Skip if rank is not an array (like when it's a string)
    if (!Array.isArray(rank)) {
      console.warn(`Skipping rank ${x} - it's a ${typeof rank}:`, rank);
      return;
    }

    rank.forEach((file, y) => {
      if (
        positionAfterMoves[x][y] &&
        positionAfterMoves[x][y].startsWith(player) &&
        positionAfterMoves[x][y].endsWith("k")
      ) {
        kingPos = [x, y];
      }
    });
  });
  return kingPos;
};
export const getPieces = (positionAfterMoves: any[], enemy: string) => {
  const enemyPieces = [];
  positionAfterMoves.forEach((rank, x) => {
    rank.forEach((file, y) => {
      if (positionAfterMoves[x][y].startsWith(enemy)) {
        enemyPieces.push({ piece: positionAfterMoves[x][y], rank: x, file: y });
      }
    });
  });
  return enemyPieces;
};
