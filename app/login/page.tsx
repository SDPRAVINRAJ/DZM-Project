"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Mail, Lock, LogIn, Loader2, AlertCircle, ArrowLeft, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HomeFooter } from "@/components/site-footer";
import { getAssetPath } from "@/lib/utils";

const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handlePageMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = ((clientX / innerWidth) - 0.5) * 3;
    const y = ((clientY / innerHeight) - 0.5) * 3;
    setMousePos({ x, y });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      console.log("[Firebase Auth Error] code:", err?.code, "| message:", err?.message);
      const code = err?.code || "";
      if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
        setError("Incorrect email or password. Please try again.");
      } else if (code.includes("too-many-requests")) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (code.includes("network")) {
        setError("Network error. Please check your connection.");
      } else {
        setError(`Unable to sign in. (${code || "unknown error"})`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onMouseMove={handlePageMouseMove}
      className="relative flex flex-col justify-between min-h-[100svh] -mt-16 sm:-mt-20 pt-16 sm:pt-20 bg-[#F6F5F2] font-tamil text-[#18080A] overflow-hidden select-none"
    >
      {/* ── Continuous Bharathiyar Background Image (Faint background presence on far right) ── */}
      <motion.img
        initial={{ opacity: 0, scale: 1.015 }}
        animate={{
          opacity: 0.90,
          scale: 1.0,
          x: mousePos.x,
          y: mousePos.y,
        }}
        transition={{
          opacity: { duration: 1.1, delay: 0.05, ease: EASE_EXPO },
          scale: { duration: 1.1, delay: 0.05, ease: EASE_EXPO },
          x: { duration: 0.4, ease: "easeOut" },
          y: { duration: 0.4, ease: "easeOut" },
        }}
        src={getAssetPath("/bharathiyar-bg.jpg")}
        alt="Bharathiyar artwork watermark"
        className="fixed inset-0 size-full object-cover object-right pointer-events-none -z-10"
      />

      {/* ── Seamless Parchment & Readability Overlay ── */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            "linear-gradient(105deg, oklch(0.965 0.017 85 / 0.99) 0%, oklch(0.965 0.017 85 / 0.97) 48%, oklch(0.965 0.017 85 / 0.60) 72%, oklch(0.965 0.017 85 / 0.12) 88%)",
        }}
      />

      {/* ── Subtle Top Navbar Gradient Overlay for Readability ── */}
      <div
        className="fixed inset-x-0 top-0 h-28 pointer-events-none -z-10"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.965 0.017 85 / 0.88) 0%, oklch(0.965 0.017 85 / 0) 100%)",
        }}
      />

      {/* ── Subtle Large Radial Cream/Peach Glow Behind Centered Login ── */}
      <div
        aria-hidden="true"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none -z-10"
        style={{
          background: "radial-gradient(circle, rgba(255, 237, 213, 0.50) 0%, rgba(246, 245, 242, 0) 70%)",
        }}
      />

      {/* ── Faint Tamil Typographic Background Watermark ("கல்வி") ── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none flex items-center justify-center overflow-hidden"
      >
        <span
          className="font-serif-tamil select-none"
          style={{
            fontSize: "clamp(240px, 32vw, 420px)",
            fontWeight: 700,
            color: "#7E2612",
            opacity: 0.022,
            lineHeight: 1,
            transform: "translate(-8%, 10%) rotate(-3deg)",
          }}
        >
          கல்வி
        </span>
      </div>

      {/* ── Faint Botanical / Decorative Line Art on Edges ── */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none -z-10 overflow-hidden hidden md:block">
        {/* Left Edge Decorative Accent */}
        <div className="absolute left-6 top-1/3 opacity-15">
          <svg width="60" height="180" viewBox="0 0 60 180" fill="none" stroke="#7E2612" strokeWidth="1">
            <path d="M30 0 v180 M30 30 c15 15 15 30 0 45 M30 75 c-15 15 -15 30 0 45 M30 120 c15 15 15 30 0 45" />
          </svg>
        </div>
        {/* Right Edge Decorative Accent */}
        <div className="absolute right-6 bottom-1/3 opacity-15">
          <svg width="60" height="180" viewBox="0 0 60 180" fill="none" stroke="#7E2612" strokeWidth="1">
            <path d="M30 0 v180 M30 30 c-15 15 -15 30 0 45 M30 75 c15 15 15 30 0 45 M30 120 c-15 15 -15 30 0 45" />
          </svg>
        </div>
      </div>

      {/* ── Main Content Container (Centered Layout) ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:py-12 my-auto w-full max-w-full">
        <div className="w-full max-w-[440px] mx-auto flex flex-col items-center">

          {/* ── 1. School Logo & Header Text (Centered) ── */}
          <div className="text-center mb-5 sm:mb-6 w-full">
            {/* School Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE_EXPO }}
              className="inline-block relative mb-3"
            >
              <img
                src={getAssetPath("/image.png")}
                alt="DZM School Logo"
                className="h-14 w-14 sm:h-16 sm:w-16 object-contain rounded-full bg-white/95 p-1 border border-[#8B2E15]/30 shadow-md mx-auto"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-1.5 rounded-full border border-dashed border-[#7E2612]/20 pointer-events-none"
              />
            </motion.div>

            {/* Eyebrow Badge */}
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: EASE_EXPO }}
              className="text-[10px] sm:text-[10.5px] font-semibold tracking-[0.28em] sm:tracking-[0.34em] uppercase text-[#7E2612] font-jakarta mb-1"
            >
              DZM · Teacher Portal
            </motion.p>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.25, ease: EASE_EXPO }}
              className="font-jakarta text-2xl sm:text-3xl font-extrabold text-[#18080A] tracking-tight"
            >
              Teacher Login
            </motion.h1>

            {/* Tamil Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32, ease: EASE_EXPO }}
              className="font-serif-tamil text-sm font-bold text-[#7E2612] mt-0.5"
            >
              ஆசிரியர் நுழைவாயில்
            </motion.p>

            {/* Description Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.38 }}
              className="mt-1 text-xs sm:text-sm text-[#4A2818]/75 font-jakarta"
            >
              Sign in to manage materials and competitions
            </motion.p>
          </div>

          {/* ── 2. Centered Premium Parchment Login Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.42, ease: EASE_EXPO }}
            className="w-full"
          >
            <div className="relative w-full p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#8B2E15]/14 bg-[#FFFDF9]/95 shadow-[0_8px_32px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-[#7E2612]/40 hover:shadow-[0_20px_50px_rgba(139,46,21,0.12)] overflow-hidden">
              
              {/* Subtle Top Accent Bar */}
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#7E2612] via-[#A63820] to-[#C17B3E]" />

              {/* Decorative Subtle Sparkles in Corner */}
              <div aria-hidden="true" className="absolute top-3.5 right-3.5 opacity-25 text-[#7E2612]">
                <Sparkles className="w-4 h-4" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Error Alert */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 bg-red-50 text-red-900 border border-red-200/80 rounded-xl p-3.5 text-xs font-medium shadow-2xs"
                  >
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-700" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Email Input Field */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-[11px] font-extrabold uppercase tracking-wider text-[#18080A] font-jakarta">
                    Email Address
                  </label>
                  <div className="relative group/input">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B2E15]/50 group-focus-within/input:text-[#7E2612] transition-colors duration-200 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@example.com"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#FFFCF6] border border-[#8B2E15]/20 text-[#18080A] placeholder-[#6A4030]/45 text-sm font-medium font-jakarta focus:outline-none focus:border-[#7E2612] focus:ring-2 focus:ring-[#7E2612]/15 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Password Input Field */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-[11px] font-extrabold uppercase tracking-wider text-[#18080A] font-jakarta">
                    Password
                  </label>
                  <div className="relative group/input">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B2E15]/50 group-focus-within/input:text-[#7E2612] transition-colors duration-200 pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#FFFCF6] border border-[#8B2E15]/20 text-[#18080A] placeholder-[#6A4030]/45 text-sm font-medium font-jakarta focus:outline-none focus:border-[#7E2612] focus:ring-2 focus:ring-[#7E2612]/15 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6A4030]/70 hover:text-[#7E2612] transition-colors p-1 cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Full-width Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group/btn relative w-full flex items-center justify-center gap-2 text-white font-jakarta font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#7E2612]/20 active:scale-[0.98] cursor-pointer overflow-hidden mt-2"
                  style={{
                    background: "linear-gradient(135deg, #7E2612 0%, #8B2E10 60%, #A63820 100%)",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 text-white" />
                      <span>SIGN IN</span>
                      <ArrowRight className="h-4 w-4 text-[#FFEDD5] transition-transform duration-300 group-hover/btn:translate-x-1" strokeWidth={2} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* ── 3. Back to Home Link (Underneath Card) ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-6 text-center"
          >
            <Link
              href="/"
              className="group/back inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6A4030] hover:text-[#7E2612] transition-colors font-jakarta"
            >
              <ArrowLeft className="h-4 w-4 text-[#7E2612] transition-transform duration-300 group-hover/back:-translate-x-1" />
              <span>Back to home</span>
            </Link>
          </motion.div>

        </div>
      </div>

      {/* ── Transparent Home Footer ── */}
      <HomeFooter />
    </div>
  );
}
