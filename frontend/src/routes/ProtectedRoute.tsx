import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  redirectPath?: string;
}

export default function ProtectedRoute({
  redirectPath = "/login",
}: ProtectedRouteProps) {
  const isAuthenticated = !!localStorage.getItem("token");

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
