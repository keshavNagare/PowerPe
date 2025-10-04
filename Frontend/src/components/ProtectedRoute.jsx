import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { token, user } = useContext(AuthContext);
  const location = useLocation();

  // If not logged in, redirect to login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If role is specified and user role doesn't match, redirect to login
  if (role && user?.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
