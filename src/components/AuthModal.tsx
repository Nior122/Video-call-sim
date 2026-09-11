import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User as UserIcon, Sparkles, AlertCircle, ArrowRight, CheckCircle2, UserCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInAsGuest,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">(authModalMode || "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync mode when modal opens
  React.useEffect(() => {
    setMode(authModalMode);
    setError(null);
  }, [authModalMode, authModalOpen]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password, name.trim() || undefined);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let msg = "An error occurred during authentication.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        msg = "Invalid email or password.";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "An account with this email already exists.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password is too weak. Please use at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Google sign in error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInAsGuest();
    } catch (err: any) {
      console.error("Guest sign in error:", err);
      setError("Failed to continue as guest. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#0e101f] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#e1147a] via-[#ec4899] to-[#9333ea] flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {mode === "signin" ? "Welcome Back" : "Join Dream Girl"}
              </h2>
              <p className="text-xs text-neutral-400">
                {mode === "signin"
                  ? "Sign in to chat, call & save your conversations"
                  : "Create an account to connect with verified creators"}
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-[#151728] border border-white/5 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === "signin"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === "signup"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs mb-4"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Social Auth (Google) */}
          <div className="space-y-2.5 mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-[#171a2e] hover:bg-[#1f233d] border border-white/10 text-xs font-semibold text-white transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="w-full border-t border-white/[0.08]" />
            <span className="absolute bg-[#0e101f] px-3 text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              Or with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "signup" && (
              <div>
                <label className="block text-[11px] font-medium text-neutral-300 mb-1.5">
                  Display Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name or nickname"
                    className="w-full bg-[#151728] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-neutral-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#151728] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#151728] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#e1147a] via-[#ec4899] to-[#9333ea] hover:opacity-95 shadow-md shadow-pink-500/25 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In" : "Create My Account"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Guest Access */}
          <div className="mt-5 pt-4 border-t border-white/[0.08] text-center">
            <button
              type="button"
              onClick={handleGuestSignIn}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-pink-300 transition-colors font-medium"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Or continue as Guest (No password required)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
