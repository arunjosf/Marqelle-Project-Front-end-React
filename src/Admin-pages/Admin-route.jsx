import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { context } from "../App";

export default function AdminProtected({ children }) {
  const { user } = useContext(context);
  if (!user || user.roleId != 2) return <Navigate to="/login" replace />;
  return children;
} 