export const getCharacter = (file: number) => String.fromCharCode(file + 96);
interface colorType {
  color: string;
}
export const createPosition = ({ color }: colorType) => {
  console.log(color);
  const position = new Array(8).fill("").map(() => new Array(8).fill(""));
  if (color === "w") {
    for (let i = 0; i < 8; i++) {
      position[1][i] = "wp";
      position[6][i] = "bp";
    }
    position[7][0] = "br";
    position[7][7] = "br";
    position[0][0] = "wr";
    position[0][7] = "wr";
    position[7][1] = "bn";
    position[7][6] = "bn";
    position[0][1] = "wn";
    position[0][6] = "wn";
    position[7][5] = "bb";
    position[7][2] = "bb";
    position[0][5] = "wb";
    position[0][2] = "wb";
    position[7][3] = "bq";
    position[0][3] = "wq";
    position[7][4] = "bk";
    position[0][4] = "wk";
  } else {
    for (let i = 0; i < 8; i++) {
      position[1][i] = "bp";
      position[6][i] = "wp";
    }
    position[7][0] = "wr";
    position[7][7] = "wr";
    position[0][0] = "br";
    position[0][7] = "br";
    position[7][1] = "wn";
    position[7][6] = "wn";
    position[0][1] = "bn";
    position[0][6] = "bn";
    position[7][5] = "wb";
    position[7][2] = "wb";
    position[0][5] = "bb";
    position[0][2] = "bb";
    position[7][3] = "wq";
    position[0][3] = "bq";
    position[7][4] = "wk";
    position[0][4] = "bk";
  }
  return position;
};
export const copyPosition = (position) => {
  const newPosition = new Array(8).fill("").map(() => new Array(8).fill(""));
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      newPosition[i][j] = position[i][j];
    }
  }
  return newPosition;
};
export const areSameColorTiles = (c1, c2) =>
  (c1.x + c1.y) % 2 === (c2.x + c2.y) % 2;

export const findPieceCoords = (pos, type) => {
  let results = [];
  pos.forEach((rank, i) => {
    rank.forEach((pos, j) => {
      if (pos === type) {
        results.push({ x: i, y: j });
      }
    });
  });
  return results;
};

export const getNewMoveNotation = ({
  piece,
  rank,
  file,
  x,
  y,
  pos,
  promotesTo,
}) => {
  let note = "";
  rank = Number(rank);
  file = Number(file);

  if (piece[1] === "k" && Math.abs(file - y) === 2) {
    if (file < y) {
      return "0-0";
    } else {
      return "0-0-0";
    }
  }
  if (piece[1] !== "p") {
    note = piece[1].toUpperCase();
    if (pos[x][y]) {
      note += "x";
    }
  } else if (rank !== x && file !== y) {
    note += getCharacter(file + 1) + "x";
  }
  note += getCharacter(y + 1) + (x + 1);

  if (promotesTo) {
    note += "=" + promotesTo.toUpperCase();
  }
  return note;
};
