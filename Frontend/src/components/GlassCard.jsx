import React from "react";

const GlassCard = ({ children, className }) => {
  return (
    <div
      className={`bg-white/10 backdrop-blur-lg shadow-lg rounded-2xl p-8 border border-white/20 ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
