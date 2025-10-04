import React, { useEffect } from "react";

const PopupNotification = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // auto close after 3 sec
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white transition-all duration-500
      ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
    >
      {message}
    </div>
  );
};

export default PopupNotification;
