import "./ranks.css";

interface rankProps {
  ranks: number[];
}

const Ranks = ({ ranks }: rankProps) => {
  return (
    <div className="ranks">
      {ranks.map((r) => (
        <span key={r}>{r}</span>
      ))}
    </div>
  );
};
export default Ranks;
