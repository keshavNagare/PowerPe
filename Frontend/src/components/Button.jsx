// components/Button.jsx
import React from "react";

const Button = ({ children, variant = "default", onClick }) => {
  const baseClasses =
    "px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 shadow-sm";

  const variants = {
    edit: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
    delete: "bg-red-100 text-red-600 hover:bg-red-200",
    add: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    default: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
      {children}
    </button>
  );
};

export default Button;
