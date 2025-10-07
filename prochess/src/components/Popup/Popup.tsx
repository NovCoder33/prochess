import React from "react";
import { Status } from "../../constant";
import { UseAppContext } from "../../context/context";
import { closePopup } from "../../reducer/actions/popup";
import "./popup.css";

const Popup = ({ children }) => {
  const { appState, dispatch } = UseAppContext();
  if (appState.status === Status.ongoing) {
    return null;
  }

  const onClosePopup = () => {
    dispatch(closePopup());
  };
  return (
    <div className="popup">
      {React.Children.toArray(children).map((child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { onClosePopup } as any);
        }
      })}
    </div>
  );
};

export default Popup;
