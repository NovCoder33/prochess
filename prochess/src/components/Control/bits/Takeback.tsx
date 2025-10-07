import { UseAppContext } from "../../../context/context";
import { takeBack } from "../../../reducer/actions/move";

const Takeback = () => {
  const { dispatch } = UseAppContext();
  return (
    <div className="takeBack">
      <button onClick={() => dispatch(takeBack())}>Takeback</button>
    </div>
  );
};

export default Takeback;
