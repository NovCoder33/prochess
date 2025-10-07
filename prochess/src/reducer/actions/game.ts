import { initGameState } from "../../constant";
import actionTypes from "../actionTypes";

export const updateCastling = (dir) => {
  return {
    type: actionTypes.CAN_CASTLE,
    payload: dir,
  };
};

export const detectStalemate = () => {
  return {
    type: actionTypes.DETECT_STALEMATE,
  };
};

export const detectCheckmate = (winner) => {
  return {
    type: actionTypes.CHECKMATE,
    payload: winner,
  };
};

export const setupNewGame = () => {
  return {
    type: actionTypes.NEW_GAME,
    payload: initGameState,
  };
};

export const detectInsufficientMaterial = () => {
  return {
    type: actionTypes.INSUFFICIENT_MATERIAL,
  };
};

export const detect50MoveRule = () => {
  return {
    type: actionTypes.FIFTY_MOVE,
  };
};
export const detectThreeFoldRepetition = () => {
  return {
    type: actionTypes.THREE_FOLD,
  };
};
