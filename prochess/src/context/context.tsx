import { createContext, useContext } from "react";

type ChessBoard = string[][];
type GameState = {
  position: ChessBoard[][];
  turn: string;
  candidateMoves: [];
  status: string;
  promotionSquare: {
    rank;
    file;
    x;
    y;
  };
  castleDirection: { w; b };
  movesList: [];
};

const AppContext = createContext<{
  appState: GameState;
  dispatch: (action: any) => void;
}>({
  appState: {
    position: [[]],
    turn: "w",
    candidateMoves: [],
    status: "",
    promotionSquare: { rank: 0, file: 0, x: 0, y: 0 },
    castleDirection: { w: "", b: "" },
    movesList: [],
  },
  dispatch: () => {},
});

export const UseAppContext = () => {
  return useContext(AppContext);
};

export default AppContext;
