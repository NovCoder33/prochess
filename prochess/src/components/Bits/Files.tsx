import { getCharacter } from "../../helper";
import "./files.css";

interface fileProps {
  files: number[];
}

const Files = ({ files }: fileProps) => {
  return (
    <div className="files">
      {files.map((f: number) => (
        <span key={f}>{getCharacter(f)}</span>
      ))}
    </div>
  );
};
export default Files;
