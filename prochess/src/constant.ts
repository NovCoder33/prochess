import { createPosition } from "./helper";

export const Status = {
  ongoing: "Ongoing",
  promoting: "Promoting",
  white: "White wins",
  black: "Black wins",
  stalemate: "Game ends due to stalemate",
  insufficient: "Game ends due to insufficient material",
  fifty: "Game ends due to 50 move rule",
  three_fold: "Game ends due to three fold repetition",
};
export const initGameState = {
  position: [createPosition({ color: "w" })],
  turn: "w",
  candidateMoves: [],
  status: Status.ongoing,
  castleDirection: {
    w: "both",
    b: "both",
  },
  movesList: [],
  promotionSquare: null,
};
