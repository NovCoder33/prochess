import { Status } from "../constant";
import { copyPosition } from "../helper";
import actionTypes from "./actionTypes";

export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.NEW_MOVE: {
      let { turn, movesList, position } = state;
      turn = turn === "w" ? "b" : "w";
      position = [...position, action.payload.newPosition];
      movesList = [...movesList, action.payload.newMove];
      return {
        ...state,
        turn,
        position,
        movesList,
      };
    }
    case actionTypes.GENERATE_CANDIDATE_MOVES: {
      return { ...state, candidateMoves: action.payload.candidateMoves };
    }
    case actionTypes.CLEAR_CANDIDATE_MOVES: {
      return { ...state, candidateMoves: [] };
    }
    case actionTypes.PROMOTION_OPEN: {
      return {
        ...state,
        status: Status.promoting,
        promotionSquare: { ...action.payload },
      };
    }
    case actionTypes.PROMOTION_CLOSE: {
      return {
        ...state,
        status: Status.ongoing,
        promotionSquare: null,
      };
    }
    case actionTypes.CAN_CASTLE: {
      let { turn, castleDirection } = state;
      castleDirection[turn] = action.payload;
      return {
        ...state,
        castleDirection,
      };
    }
    case actionTypes.DETECT_STALEMATE: {
      return {
        ...state,
        status: Status.stalemate,
      };
    }
    case actionTypes.NEW_GAME: {
      return {
        ...action.payload,
      };
    }
    case actionTypes.INSUFFICIENT_MATERIAL: {
      return {
        ...state,
        status: Status.insufficient,
      };
    }
    case actionTypes.FIFTY_MOVE: {
      return {
        ...state,
        status: Status.fifty,
      };
    }
    case actionTypes.THREE_FOLD: {
      return {
        ...state,
        status: Status.three_fold,
      };
    }

    case actionTypes.CHECKMATE: {
      return {
        ...state,
        status: action.payload === "w" ? Status.black : Status.white,
      };
    }
    case actionTypes.TAKEBACK: {
      let { position, movesList, turn } = state;
      if (position.length > 1) {
        position = position.slice(0, position.length - 1);
        movesList = movesList.slice(0, movesList.length - 1);
        turn = turn === "w" ? "b" : "w";
      }
      return {
        ...state,
        position,
        movesList,
        turn,
      };
    }
    default:
      return state;
  }
};
