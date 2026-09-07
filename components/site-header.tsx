"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  House,
  BookOpen,
  Images,
  CalendarDays,
  CircleUserRound,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, getAssetPath } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const navLinks = [
  { href: "/",          label: "முகப்பு",              icon: House        },
  { href: "/materials", label: "கற்றல் வளங்கள்",       icon: BookOpen     },
  { href: "/gallery",   label: "புகைப்படங்கள்",        icon: Images       },
  { href: "/events",    label: "நிகழ்வுகள்",          icon: CalendarDays },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = (open || showLogoutConfirm) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open, showLogoutConfirm]);

  const handleSignOut = async () => {
    setShowLogoutConfirm(false);
    await signOut(auth);
    window.location.href = getAssetPath("/");
  };

  const isTeacherPage = pathname === "/dashboard" || pathname === "/login";

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
          scrolled
            ? "bg-[#FAF7F0]/98 backdrop-blur-md border-b border-[#8D3823]/15 shadow-[0_4px_20px_rgba(141,56,35,0.06)]"
            : "bg-[#FAF7F0]/90 backdrop-blur-xs border-b border-[#8D3823]/08 shadow-none"
        )}
      >
        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
          <div className={cn("flex items-center justify-between transition-all duration-300", scrolled ? "h-[62px] sm:h-16" : "h-[68px] sm:h-20")}>
            
            {/* ── Brand Logo / Left Section ── */}
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 group transition-all duration-300 min-w-0 pr-1 sm:pr-0"
            >
              <img
                src={getAssetPath("/image.png")}
                alt="DZM School Logo"
                className={cn(
                  "w-auto object-contain rounded-full bg-white/95 p-0.5 border flex-shrink-0 transition-all duration-300 group-hover:scale-105 border-[#8D3823]/25 group-hover:border-[#8D3823] group-hover:shadow-[0_0_12px_rgba(141,56,35,0.18)]",
                  scrolled ? "h-[34px] sm:h-[38px]" : "h-[38px] sm:h-[46px]"
                )}
              />
              <div className="flex flex-col leading-tight justify-center transition-all duration-300 min-w-0">
                <span
                  className={cn(
                    "font-tamil font-bold tracking-tight leading-snug transition-colors duration-300 text-[#1E0B05] group-hover:text-[#8D3823] truncate",
                    scrolled ? "text-[13px] sm:text-[15.5px]" : "text-[13.5px] sm:text-[17px]"
                  )}
                >
                  DZM தமிழ் மையம்
                </span>
                <span
                  className={cn(
                    "font-semibold uppercase tracking-wider transition-all duration-300 text-[#8D3823] truncate max-w-[130px] xxs:max-w-[160px] xs:max-w-[210px] sm:max-w-none",
                    scrolled ? "text-[7.5px] sm:text-[9px] mt-0" : "text-[8px] sm:text-[9.5px] mt-0.5"
                  )}
                >
                  SMK DATO&apos; ZULKIFLI MUHAMMAD
                </span>
              </div>
            </Link>

            {/* ── Desktop Navigation ── */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2.5 font-tamil text-[13.5px]" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "group relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium tracking-wide transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8D3823]",
                      active
                        ? "bg-[#8D3823] text-white font-bold shadow-[0_3px_12px_rgba(141,56,35,0.22)] -translate-y-0.5"
                        : "text-[#2D160C] hover:text-[#8D3823] hover:bg-[#8D3823]/08 hover:-translate-y-0.5"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 transition-transform duration-200 group-hover:scale-110", active ? "text-white" : "text-[#8D3823]")} />
                    <span>{link.label}</span>
                    
                    {/* Animated Underline for inactive items on hover */}
                    {!active && (
                      <span className="absolute bottom-1 left-3 right-3 h-[1.5px] bg-[#8D3823] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center rounded-full" />
                    )}
                  </Link>
                );
              })}

              {/* Teacher Profile Icon Button (NO TEXT, NO TOOLTIP) */}
              <div className="ml-1.5 pl-1.5 border-l border-[#8D3823]/15 flex items-center gap-1.5">
                <Link
                  href={user ? "/dashboard" : "/login"}
                  aria-label="User Account"
                  className={cn(
                    "relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-250 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8D3823] hover:scale-[1.04]",
                    isTeacherPage
                      ? "bg-[#8D3823] text-white shadow-[0_3px_12px_rgba(141,56,35,0.25)] border border-[#8D3823]"
                      : "bg-[#FFFCF6] text-[#8D3823] border border-[#8D3823]/25 hover:bg-[#F3E8DE] hover:border-[#8D3823]/60 hover:shadow-xs"
                  )}
                >
                  <CircleUserRound className="h-[21px] w-[21px] transition-transform duration-200" />
                </Link>

                {user && (
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    aria-label="Logout"
                    className="p-2 rounded-full text-[#8D3823]/70 hover:text-red-700 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            </nav>

            {/* ── Mobile Hamburger & Profile Quick Action (Touch friendly 44px min) ── */}
            <div className="md:hidden flex items-center gap-1.5 xs:gap-2 flex-shrink-0">
              <Link
                href={user ? "/dashboard" : "/login"}
                aria-label="User Account"
                className={cn(
                  "relative inline-flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 active:scale-95",
                  isTeacherPage
                    ? "bg-[#8D3823] text-white shadow-xs border border-[#8D3823]"
                    : "bg-[#FFFCF6] text-[#8D3823] border border-[#8D3823]/30"
                )}
              >
                <CircleUserRound className="h-5 w-5" />
              </Link>
              
              <button
                className="flex items-center justify-center w-11 h-11 rounded-xl text-[#1E0B05] hover:text-[#8D3823] hover:bg-[#8D3823]/10 border border-[#8D3823]/20 bg-[#FFFCF6] transition-colors cursor-pointer active:scale-95"
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* ── Mobile Drawer Menu with Backdrop ── */}
        <AnimatePresence>
          {open && (
            <>
              {/* Dim Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 top-[62px] sm:top-16 bg-black/40 backdrop-blur-xs md:hidden z-40"
              />

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="md:hidden relative z-50 border-t border-[#8D3823]/15 bg-[#FAF7F0] shadow-2xl max-h-[calc(100svh-4.25rem)] overflow-y-auto overscroll-contain"
              >
                <nav className="flex flex-col space-y-1.5 p-4 sm:p-5 font-tamil" aria-label="Mobile Navigation">
                  {navLinks.map((link) => {
                    const active = pathname === link.href;
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3.5 rounded-xl text-[14.5px] font-semibold transition-all duration-200 min-h-[48px] active:scale-[0.98]",
                          active
                            ? "bg-[#8D3823] text-white shadow-xs font-bold"
                            : "text-[#2D160C] hover:bg-[#8D3823]/10 hover:text-[#8D3823]"
                        )}
                      >
                        <Icon className={cn("h-4.5 w-4.5 flex-shrink-0", active ? "text-white" : "text-[#8D3823]")} />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}

                  <div className="pt-3 mt-2 border-t border-[#8D3823]/12 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2.5">
                    <Link
                      href={user ? "/dashboard" : "/login"}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-xs sm:text-sm min-h-[48px] transition-all duration-200 active:scale-[0.98]",
                        isTeacherPage
                          ? "bg-[#8D3823] text-white shadow-xs font-bold"
                          : "bg-[#FFFCF6] text-[#8D3823] border border-[#8D3823]/30 hover:bg-[#8D3823]/10"
                      )}
                    >
                      <CircleUserRound className="h-4.5 w-4.5 flex-shrink-0" />
                      <span>{user ? "ஆசிரியர் கணக்கு" : "ஆசிரியர் உள்நுழைவு"}</span>
                    </Link>

                    {user && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer min-h-[48px] active:scale-[0.98]"
                      >
                        <LogOut className="h-4 w-4 flex-shrink-0" />
                        <span>வெளியேறு</span>
                      </button>
                    )}
                  </div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ── Sign-out Confirmation Dialog ── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md rounded-2xl bg-[#FFFCF6] border border-[#8B2E15]/30 shadow-2xl p-6 sm:p-7 space-y-5 font-tamil text-[#18080A]"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="logout-title"
              aria-describedby="logout-desc"
            >
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <LogOut className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 id="logout-title" className="font-serif-tamil font-extrabold text-lg sm:text-xl text-[#18080A]">
                    வெளியேற விரும்புகிறீர்களா?
                  </h3>
                  <p id="logout-desc" className="text-xs sm:text-sm text-[#4A2818]/80 leading-relaxed font-medium">
                    உங்கள் ஆசிரியர் கணக்கிலிருந்து வெளியேற உள்ளீர்கள்.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F6F5F2] hover:bg-[#EAE8E2] border border-[#8B2E15]/20 text-[#3A2018] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  ரத்து செய்யவும்
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  ஆம், வெளியேறு
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
