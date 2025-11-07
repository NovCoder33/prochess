import { useCallback, useEffect, useReducer, useState } from "react";
import socket from "./socket";
import "./app.css";
import Board from "./components/Board";
import AppContext from "./context/context";
import { reducer } from "./reducer/reducer";
import { initGameState } from "./constant";
import Takeback from "./components/Control/bits/Takeback";
import MovesList from "./components/Control/bits/MovesList";
import Control from "./components/Control/Control";
import CustomDialog from "./components/CustomDialog";
import { TextField } from "@mui/material";
import Game from "./components/Game";
import InitGame from "./components/InitGame";

function App() {
  const [appState, dispatch] = useReducer(reducer, initGameState);

  const [room, setRoom] = useState("");
  const [orientation, setOrientation] = useState("");
  const [players, setPlayers] = useState([]);

  const cleanup = useCallback(() => {
    setRoom("");
    setOrientation("");
    setPlayers([]);
  }, []);
  useEffect(() => {
    const handleP2Joined = (roomData) => {
      setPlayers(roomData.players);
    };

    socket.on("p2Joined", handleP2Joined);

    return () => {
      socket.off("p2Joined", handleP2Joined);
    };
  }, []);
  useEffect(() => {}, [orientation]);
  const providerState = { appState, dispatch };
  return (
    <AppContext.Provider value={providerState}>
      <div className={!room ? "App" : "App2"}>
        <div className={!room ? "column1" : "c"} />
        <div className="game-content">
          {!room ? (
            <>
              <h1>Prochess</h1>
              <p>Become a chess pro</p>
              <p>
                (Game loading times can take up to 2 minutes due to server
                slowness.)
              </p>
            </>
          ) : (
            <p className="c">{""}</p>
          )}

          {room ? (
            <Game
              room={room}
              players={players}
              orientation={orientation}
              cleanup={cleanup}
            ></Game>
          ) : (
            <InitGame
              setRoom={setRoom}
              setOrientation={setOrientation}
              setPlayers={setPlayers}
            ></InitGame>
          )}
        </div>
        <div className={!room ? "column2" : "c"} />
      </div>
    </AppContext.Provider>
  );
}

export default App;
