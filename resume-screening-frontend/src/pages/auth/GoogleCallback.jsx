import { useEffect } from "react";
import useAuthStore from "../../store/authStore";

export default function GoogleCallback() {
  const { loginWithToken } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      window.location.href = "/login?error=google_failed";
      return;
    }

    // Use the store's method — this sets BOTH localStorage AND Zustand state
    loginWithToken(token).then((result) => {
      if (result.success) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/login?error=google_failed";
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-sm animate-pulse">Signing you in...</p>
    </div>
  );
}
