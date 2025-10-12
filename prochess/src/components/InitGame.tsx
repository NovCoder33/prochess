import { Button, Stack, TextField } from "@mui/material";
import { useState } from "react";
import CustomDialog from "./CustomDialog";
import socket from "../socket";
import { createPosition } from "../helper";
import { initGameState } from "../constant";

export default function InitGame({ setRoom, setOrientation, setPlayers }) {
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [roomInput, setRoomInput] = useState("");
  const [roomError, setRoomError] = useState("");
  const p2 = "black";
  const p1 = "white";
  return (
    <Stack
      justifyContent={"center"}
      alignItems={"center"}
      sx={{ py: 1, height: "100vh" }}
    >
      <CustomDialog
        open={roomDialogOpen}
        handleClose={() => setRoomDialogOpen(false)}
        title="Select room"
        contextText={"Enter valid ID to join room"}
        handleContinue={() => {
          if (!roomInput) {
            return;
          }
          socket.emit("joinRoom", { roomId: roomInput }, (r) => {
            if (r.error) {
              return setRoomError(r.message);
            }
            setRoom(r);
            setPlayers(r?.players);
            setOrientation("b");
          });
        }}
      >
        <TextField
          autoFocus
          margin="dense"
          id="room"
          label="Room ID"
          name="room"
          value={roomInput}
          required
          onChange={(e) => setRoomInput(e.target.value)}
          type="text"
          fullWidth
          variant="standard"
          error={Boolean(roomError)}
          helperText={
            !roomError ? "Enter a room ID" : `Invalid Room ID ${roomError}`
          }
        ></TextField>
      </CustomDialog>

      <Button
        variant="contained"
        onClick={() => {
          socket.emit("createRoom", (r) => {
            setRoom(r);
            setOrientation("w");
            setPlayers(r?.players);
            setRoomDialogOpen(false);
          });
        }}
      >
        Create Room
      </Button>

      <Button onClick={() => setRoomDialogOpen(true)}>Join Room</Button>
    </Stack>
  );
}
