import { areSameColorTiles, findPieceCoords } from "../helper";
import {
  getBishopMoves,
  getKingMoves,
  getKnightMoves,
  getPawnCaptures,
  getPawnMoves,
  getQueenMoves,
  getRookMoves,
  getCastlingMoves,
  getKingPos,
  getPieces,
} from "./getMoves";
import { movePawn, movePiece } from "./move";

const arbiter = {
  getRegularMoves: function ({
    currentPosition,
    prevPosition,
    piece,
    rank,
    file,
  }) {
    if (piece.endsWith("r")) {
      return getRookMoves({ currentPosition, piece, rank, file });
    } else if (piece.endsWith("n")) {
      return getKnightMoves({ currentPosition, rank, file });
    } else if (piece.endsWith("b")) {
      return getBishopMoves({ currentPosition, piece, rank, file });
    } else if (piece.endsWith("q")) {
      return getQueenMoves({ currentPosition, piece, rank, file });
    } else if (piece.endsWith("k")) {
      return getKingMoves({ currentPosition, piece, rank, file });
    } else if (piece.endsWith("p")) {
      return [
        ...getPawnMoves({ currentPosition, piece, rank, file }),
        ...getPawnCaptures({
          currentPosition,
          prevPosition,
          piece,
          rank,
          file,
        }),
      ];
    }
  },
  getValidMoves: function ({
    currentPosition,
    prevPosition,
    piece,
    castleDirection,
    rank,
    file,
  }) {
    const notInCheckMoves: any[][] = [];
    let moves: any[][] = this.getRegularMoves({
      currentPosition,
      prevPosition,
      piece,
      rank,
      file,
    });
    if (piece.endsWith("p")) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      moves = [
        ...moves,
        ...getPawnCaptures({
          currentPosition,
          prevPosition,
          piece,
          rank,
          file,
        }),
      ];
    }
    if (piece.endsWith("k")) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      moves = [
        ...moves,
        ...getCastlingMoves({
          currentPosition,
          castleDirection,
          piece,
          rank,
          file,
        }),
      ];
    }
    moves.forEach(([x, y]) => {
      const positionAfterMoves = this.performMoves({
        currentPosition,
        piece,
        rank,
        file,
        x,
        y,
      });

      if (
        !this?.isPlayerInCheck({
          positionAfterMoves,
          currentPosition,
          player: piece[0],
        })
      ) {
        notInCheckMoves.push([x, y]);
      }
    });
    return notInCheckMoves;
  },

  isPlayerInCheck: function ({ positionAfterMoves, currentPosition, player }) {
    const enemy = player.startsWith("w") ? "b" : "w";
    let kingPos = getKingPos(positionAfterMoves, player);
    const enemyPieces = getPieces(positionAfterMoves, enemy);

    const enemyMoves = enemyPieces.reduce(
      (acc, p) => [
        ...acc,
        ...(p.piece.endsWith("p")
          ? getPawnCaptures({
              currentPosition: positionAfterMoves,
              prevPosition: currentPosition,
              ...p,
            })
          : this.getRegularMoves({
              currentPosition: positionAfterMoves,
              ...p,
            })),
      ],
      []
    );

    if (enemyMoves.some(([x, y]) => kingPos[0] === x && kingPos[1] === y)) {
      return true;
    }
    return false;
  },
  performMoves: function ({ currentPosition, piece, rank, file, x, y }) {
    if (piece.endsWith("p")) {
      return movePawn({ currentPosition, piece, rank, file, x, y });
    } else {
      return movePiece({ currentPosition, piece, rank, file, x, y });
    }
  },
  isStalemate: function ({ position, player, castleDirection }) {
    const isInCheck = this.isPlayerInCheck({
      positionAfterMoves: position,
      currentPosition: position,
      player,
    });
    if (isInCheck) {
      return false;
    }
    const pieces = getPieces(position, player);
    const moves = pieces.reduce(
      (acc, p) =>
        (acc = [
          ...acc,
          ...this.getValidMoves({
            currentPosition: position,
            castleDirection,
            ...p,
          }),
        ]),
      []
    );
    return !isInCheck && moves.length === 0;
  },
  insufficientMaterial: function (position) {
    const pieces = position.reduce(
      (acc, rank) => (acc = [...acc, ...rank.filter((x) => x)]),
      []
    );
    if (pieces.length === 2) {
      return true;
    }
    if (
      pieces.length === 3 &&
      pieces.some((p) => p.endsWith("b") || p.endsWith("n"))
    )
      return true;
    if (
      pieces.length === 4 &&
      pieces.every((p) => p.endsWith("b") || p.endsWith("k")) &&
      new Set(pieces).size === 4 &&
      new Set(pieces).size === 4 &&
      areSameColorTiles(
        findPieceCoords(position, "wb")[0],
        findPieceCoords(position, "bb")[0]
      )
    )
      return true;
    return false;
  },
  isCheckmate: function ({ position, player, castleDirection }) {
    const isInCheck = this.isPlayerInCheck({
      positionAfterMoves: position,
      currentPosition: position,
      player,
    });
    if (!isInCheck) {
      return false;
    }
    const pieces = getPieces(position, player);
    const moves = pieces.reduce(
      (acc, p) =>
        (acc = [
          ...acc,
          ...this.getValidMoves({
            currentPosition: position,
            castleDirection,
            ...p,
          }),
        ]),
      []
    );
    return isInCheck && moves.length === 0;
  },
};
export default arbiter;
