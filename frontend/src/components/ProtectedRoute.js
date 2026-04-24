import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredAuth } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const auth = getStoredAuth();

  if (!auth?.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
