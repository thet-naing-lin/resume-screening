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

    loginWithToken(token).then((result) => {
      if (result.success) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/login?error=google_failed";
      }
    });
  }, []);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-surface-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full
                        bg-brand-500/10 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full
                        bg-brand-400/8 blur-[100px] animate-pulse"
             style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="w-16 h-16 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-surface-400 text-sm font-medium">Signing you in...</p>
      </div>
    </div>
  );
}
