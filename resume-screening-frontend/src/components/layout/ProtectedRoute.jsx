import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

// guards any page that needs auth
export default function ProtectedRoute({ children }) {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
