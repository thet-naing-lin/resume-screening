import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineClipboardDocumentList,
  HiOutlineExclamationCircle,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import { ImSpinner9 } from "react-icons/im";
import useAuthStore from "../../store/authStore";

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    clearError();
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      return;
    }
    const result = await register(form);
    if (result.success) {
      navigate("/dashboard");
    }
  };

  const passwordMatch =
    form.password_confirmation === "" ||
    form.password === form.password_confirmation;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <HiOutlineClipboardDocumentList className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Create an Account
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Join the Resume Screening Tool
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200 p-8">
          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <HiOutlineExclamationCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Smith"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800
                           placeholder:text-slate-400 focus:outline-none focus:ring-2
                           focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800
                           placeholder:text-slate-400 focus:outline-none focus:ring-2
                           focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800
                             placeholder:text-slate-400 focus:outline-none focus:ring-2
                             focus:ring-blue-500 focus:border-transparent transition pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <HiOutlineEyeSlash className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                required
                placeholder="Repeat your password"
                className={`w-full px-4 py-2.5 border rounded-xl text-slate-800
                            placeholder:text-slate-400 focus:outline-none focus:ring-2
                            focus:border-transparent transition
                            ${
                              !passwordMatch
                                ? "border-red-300 focus:ring-red-400"
                                : "border-slate-200 focus:ring-blue-500"
                            }`}
              />
              {!passwordMatch && (
                <p className="mt-1.5 text-xs text-red-500">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !passwordMatch}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                         text-white font-semibold py-2.5 rounded-xl transition
                         flex items-center justify-center gap-2 shadow-md shadow-blue-200"
            >
              {loading ? (
                <>
                  <ImSpinner9 className="animate-spin w-5 h-5" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
