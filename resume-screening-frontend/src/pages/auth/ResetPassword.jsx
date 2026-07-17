import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  HiOutlineKey,
  HiOutlineExclamationCircle,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import api from "../../api/axios";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({ password: "", password_confirmation: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/reset-password", {
        token,
        email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      navigate("/login?reset=success");
    } catch (err) {
      setError(
        err.response?.data?.message || "Reset failed. Link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white " +
    "placeholder:text-surface-500 focus:outline-none focus:ring-2 " +
    "focus:ring-brand-500/50 focus:border-brand-400/30 transition-all";

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-surface-950">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full
                        bg-brand-500/10 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full
                        bg-brand-400/8 blur-[100px] animate-pulse"
             style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[400px] h-[400px] rounded-full bg-brand-300/5 blur-[80px]" />
      </div>

      <div className="absolute inset-0 opacity-[0.03]"
           style={{
             backgroundImage: "radial-gradient(circle, rgb(124 111 255) 1px, transparent 1px)",
             backgroundSize: "40px 40px",
           }} />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16
                          bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl mb-5
                          shadow-2xl shadow-brand-500/25">
            <HiOutlineKey className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
          <p className="text-surface-400 mt-1.5 text-sm">Enter your new password below</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8">
          {!token && (
            <div className="text-center py-4 text-red-400 text-sm">
              Invalid or missing reset token. Please request a new link.
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/20
                            text-red-400 px-4 py-3 rounded-2xl text-sm animate-scale-in">
              <HiOutlineExclamationCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500
                             hover:text-surface-300 transition-colors"
                >
                  {showPassword ? (
                    <HiOutlineEyeSlash className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={form.password_confirmation}
                onChange={(e) =>
                  setForm({ ...form, password_confirmation: e.target.value })
                }
                placeholder="Repeat new password"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-gradient-to-r from-brand-500 to-brand-600
                         hover:from-brand-600 hover:to-brand-700 disabled:from-brand-400
                         disabled:to-brand-500 text-white font-semibold py-3 rounded-2xl
                         transition-all duration-200 flex items-center justify-center gap-2
                         shadow-lg shadow-brand-500/25"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
          <p className="text-center text-sm text-surface-400 mt-5">
            <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
