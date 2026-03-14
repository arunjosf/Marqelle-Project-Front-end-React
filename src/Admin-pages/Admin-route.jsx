import { Navigate } from "react-router-dom";

export default function AdminProtected({ children }) {
  const admin = JSON.parse(localStorage.getItem("admin"));
  if (!admin) return <Navigate to="/login" replace />;
  return children;
}
