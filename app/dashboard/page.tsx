"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "firebase/auth";
import {
  BookOpen, Calendar, Upload, Trash2, LogOut, Loader2,
  Plus, Pencil, X, FileText, Images, Image as ImageIcon, CheckCircle2,
  AlertCircle, ChevronDown, Download, Hash, Clock, MapPin,
  Sparkles, Check, CalendarDays, ExternalLink, Link as LinkIcon,
  RefreshCw, RotateCcw, Trophy, Medal, CheckCheck, Copy, ArrowRight,
  FileUp, Save, UploadCloud, ChevronUp, ImagePlus,
  GraduationCap, BookMarked, Tag, Eye,
  Folder, FolderOpen, Search, ArrowLeft, ChevronRight,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { Timestamp } from "firebase/firestore";
import {
  getMaterials, getEvents,
  addMaterial, updateMaterial, deleteMaterial,
  addEvent, updateEvent, deleteEvent,
  getPhotos, addPhoto, updatePhoto, deletePhoto,
  Material, SchoolEvent, Photo,
} from "@/lib/firestore";
import {
  uploadFile, deleteFile, generateSmartFileName, buildStoragePath,
} from "@/lib/storage";
import { compressFile, formatBytes, CompressionResult } from "@/lib/compression";
import { normalizeAndValidateDriveUrl, cn, getAssetPath } from "@/lib/utils";
import { generateEventWelcomeContent } from "@/lib/ai";
import { motion, AnimatePresence } from "framer-motion";
import { HomeFooter } from "@/components/site-footer";

/* ─────────────────────────────────────────────────────────────────────────────
   Constants & Helpers in Tamil
───────────────────────────────────────────────────────────────────────────── */

type Tab = "materials" | "photos" | "events";
type Toast = { type: "success" | "error" | "info"; msg: string } | null;

const FORMS = [
  { id: "Form 1", label: "படிவம் 1" },
  { id: "Form 2", label: "படிவம் 2" },
  { id: "Form 3", label: "படிவம் 3" },
  { id: "Form 4", label: "படிவம் 4" },
  { id: "Form 5", label: "படிவம் 5" },
];

function getTamilForm(formVal?: string): string {
  const matched = FORMS.find((f) => f.id === formVal);
  return matched ? matched.label : (formVal ? formVal.replace(/Form\s*(\d)/i, "படிவம் $1") : "படிவம் 1");
}

const SUBJECTS = [
  "தமிழ் இலக்கணம்",
  "இலக்கியம்",
  "கட்டுரை",
  "சொல்லகராதி",
  "கவிதை",
  "பொதுப் பாடம்",
  "பிற",
];

const CATEGORIES = [
  "குறிப்புகள்",
  "பயிற்சிகள்",
  "கடந்த காலத் தேர்வுகள்",
  "பயிற்சிக் கையேடு",
  "குறிப்புதவி நூல்",
  "விளக்கக்காட்சி",
];

const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

function formatTamilDateDisplay(dateVal: any): string {
  try {
    let d: Date | null = null;
    if (dateVal?.toDate) d = dateVal.toDate();
    else if (dateVal?.seconds) d = new Date(dateVal.seconds * 1000);
    else if (dateVal) d = new Date(dateVal);

    if (!d || isNaN(d.getTime())) return "—";

    const monthsTamil = [
      "ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்",
      "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"
    ];

    return `${d.getDate()} ${monthsTamil[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return "—";
  }
}

function AnimatedCounter({ value }: { value: number }) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 750;
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (value - start) * easeProgress);
      setDisplayCount(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    const frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return <span>{displayCount}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Educational Decorative Vector Illustrations (Crisp Flat Vector SVG)
───────────────────────────────────────────────────────────────────────────── */

function WelcomeEducationIllustration({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 160 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none pointer-events-none drop-shadow-sm", className)}
      animate={{ y: [0, -3.5, 0] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Background Soft Pastel Glow Orbs */}
      <circle cx="80" cy="50" r="44" fill="#E0F2FE" fillOpacity="0.45" />
      <circle cx="120" cy="30" r="22" fill="#FEF3C7" fillOpacity="0.55" />
      <circle cx="36" cy="40" r="18" fill="#DCFCE7" fillOpacity="0.55" />

      {/* Decorative Sparkles */}
      <path d="M136 18L138 22L142 24L138 26L136 30L134 26L130 24L134 22L136 18Z" fill="#F59E0B" />
      <path d="M22 26L23.5 29L26.5 30.5L23.5 32L22 35L20.5 32L17.5 30.5L20.5 29L22 26Z" fill="#38BDF8" />

      {/* Stacked Book 1 (Bottom - Soft Sky Blue) */}
      <rect x="28" y="70" width="94" height="15" rx="3.5" fill="#38BDF8" />
      <rect x="32" y="72.5" width="88" height="10" rx="1.5" fill="#F0F9FF" />
      <rect x="28" y="70" width="9" height="15" rx="3.5" fill="#0284C7" />

      {/* Stacked Book 2 (Middle - Mint Green) */}
      <rect x="34" y="56" width="82" height="14" rx="3.5" fill="#10B981" />
      <rect x="38" y="58.5" width="76" height="9" rx="1.5" fill="#ECFDF5" />
      <rect x="34" y="56" width="8" height="14" rx="3.5" fill="#059669" />
      {/* Bookmark Ribbon */}
      <path d="M96 56V72L100 69L104 72V56H96Z" fill="#F43F5E" />

      {/* Stacked Book 3 (Top - Soft Coral/Orange) */}
      <rect x="42" y="43" width="68" height="13" rx="3" fill="#FB923C" />
      <rect x="46" y="45" width="62" height="9" rx="1.5" fill="#FFF7ED" />
      <rect x="42" y="43" width="7" height="13" rx="3" fill="#EA580C" />

      {/* Open Notebook Angled */}
      <g transform="rotate(-12 70 24)">
        <rect x="52" y="10" width="46" height="34" rx="3.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <line x1="57" y1="18" x2="88" y2="18" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="57" y1="23" x2="85" y2="23" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="57" y1="28" x2="78" y2="28" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="91" cy="36" r="3" fill="#10B981" />
      </g>

      {/* Yellow Academic Pencil */}
      <g transform="rotate(38 116 46)">
        <rect x="108" y="26" width="6.5" height="38" rx="1" fill="#FBBF24" />
        <rect x="108" y="26" width="6.5" height="6" rx="1" fill="#FB7185" />
        <rect x="108" y="32" width="6.5" height="2" fill="#E2E8F0" />
        <polygon points="108,64 114.5,64 111.25,71" fill="#FDE68A" />
        <polygon points="110,68.5 112.5,68.5 111.25,71" fill="#334155" />
      </g>

      {/* Decorative Mint Leaves */}
      <path d="M124 68C128 60 138 59 142 61C142 69 134 76 124 68Z" fill="#34D399" />
      <path d="M125 67C130 67 134 64 137 62" stroke="#059669" strokeWidth="1" strokeLinecap="round" />
      <path d="M130 76C136 72 144 75 146 79C143 85 134 86 130 76Z" fill="#10B981" />
    </motion.svg>
  );
}

function LearningHeaderIllustration({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 110 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none pointer-events-none drop-shadow-2xs", className)}
      animate={{ y: [0, -2.5, 0] }}
      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <circle cx="55" cy="35" r="28" fill="#ECFDF5" fillOpacity="0.85" />
      <circle cx="82" cy="20" r="14" fill="#EFF6FF" fillOpacity="0.9" />

      {/* Standing Book */}
      <rect x="16" y="16" width="9" height="38" rx="2" fill="#0D9488" />
      <rect x="18" y="18" width="5" height="34" rx="1" fill="#CCFBF1" />
      <rect x="26" y="20" width="8" height="34" rx="2" fill="#3B82F6" />
      <rect x="28" y="22" width="4" height="30" rx="1" fill="#DBEAFE" />

      {/* Open Notebook */}
      <path d="M40 36C44 34 50 34 54 36V54C50 52 44 52 40 54V36Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
      <path d="M54 36C58 34 64 34 68 36V54C64 52 58 52 54 54V36Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
      <line x1="43" y1="41" x2="51" y2="41" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="43" y1="45" x2="51" y2="45" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="57" y1="41" x2="65" y2="41" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
      <line x1="57" y1="45" x2="65" y2="45" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />

      {/* Pencil */}
      <g transform="rotate(42 72 32)">
        <rect x="68" y="16" width="4.5" height="24" rx="1" fill="#F59E0B" />
        <rect x="68" y="16" width="4.5" height="3.5" fill="#F43F5E" />
        <polygon points="68,40 72.5,40 70.25,45" fill="#FDE68A" />
        <polygon points="69.5,43 71,43 70.25,45" fill="#1E293B" />
      </g>

      {/* Decorative leaf & Sparkle */}
      <path d="M80 44C84 38 92 38 95 40C94 46 87 50 80 44Z" fill="#10B981" />
      <path d="M90 12L91.5 15L94.5 16.5L91.5 18L90 21L88.5 18L85.5 16.5L88.5 15L90 12Z" fill="#FBBF24" />
    </motion.svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Root Dashboard Page Component (Fully Tamil)
───────────────────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams?.get("tab") as Tab) || "materials";
  const [tab, setTab] = useState<Tab>(initialTab === "photos" || initialTab === "events" ? initialTab : "materials");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [toast, setToast] = useState<Toast>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([getMaterials(), getEvents(), getPhotos()])
      .then(([m, e, p]) => {
        setMaterials(m);
        setEvents(e);
        setPhotos(p);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [user]);

  const showToast = (type: "success" | "error" | "info", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4500);
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await signOut(auth);
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="flex flex-col items-center gap-3 p-8 rounded-2xl bg-white border border-slate-200 shadow-md">
          <div className="h-12 w-12 rounded-full bg-[#169C87]/10 border border-[#169C87]/20 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-[#169C87] animate-spin" />
          </div>
          <p className="text-sm text-[#0F172A] font-bold font-tamil">ஆசிரியர் தளம் ஏற்றப்படுகிறது…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col justify-between min-h-[100svh] -mt-16 sm:-mt-20 pt-16 sm:pt-20 bg-[#FAF9F6] font-tamil text-[#0F172A] overflow-hidden select-none">
      
      {/* ── Continuous Bharathiyar Background Image (Faint Watermark Far Right) ── */}
      <motion.img
        initial={{ opacity: 0, scale: 1.015 }}
        animate={{ opacity: 0.85, scale: 1.0 }}
        transition={{ duration: 1.0, delay: 0.05, ease: EASE_EXPO }}
        src={getAssetPath("/bharathiyar-bg.jpg")}
        alt="Bharathiyar artwork watermark"
        className="fixed inset-0 size-full object-cover object-right pointer-events-none -z-10"
      />

      {/* ── Seamless Parchment Light Overlay ── */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            "linear-gradient(105deg, rgba(250, 249, 246, 0.99) 0%, rgba(250, 249, 246, 0.96) 55%, rgba(250, 249, 246, 0.72) 78%, rgba(250, 249, 246, 0.25) 92%)",
        }}
      />

      {/* ── Subtle Top Navbar Gradient Overlay for Readability ── */}
      <div
        className="fixed inset-x-0 top-0 h-28 pointer-events-none -z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(250, 249, 246, 0.92) 0%, rgba(250, 249, 246, 0) 100%)",
        }}
      />

      {/* ── Faint Background Tamil Watermark ("அறிவு") ── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none flex items-center justify-start pl-10 overflow-hidden"
      >
        <span
          className="font-serif-tamil select-none"
          style={{
            fontSize: "clamp(240px, 30vw, 420px)",
            fontWeight: 700,
            color: "#169C87",
            opacity: 0.02,
            lineHeight: 1,
            transform: "translateY(18%) rotate(-3deg)",
          }}
        >
          அறிவு
        </span>
      </div>

      {/* ── Page Shell ── */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

          {/* ── Teacher Dashboard Welcome Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE_EXPO }}
            className="flex flex-row items-center justify-between gap-3 sm:gap-6 p-4 sm:p-7 rounded-[20px] sm:rounded-[24px] bg-gradient-to-r from-[#EFF6FF] via-[#FFFDF7] to-[#FFF4EA] border border-slate-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.03)] relative overflow-hidden"
          >
            {/* Inner Printed Frame Border */}
            <div className="absolute inset-2.5 rounded-[16px] sm:rounded-[18px] border border-slate-200/50 pointer-events-none" />

            {/* Left-Aligned Welcome Section */}
            <div className="relative z-10 space-y-1.5 max-w-xl">
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05, ease: EASE_EXPO }}
                className="text-xl sm:text-3xl font-extrabold text-[#0F172A] font-serif-tamil leading-tight tracking-tight flex items-center gap-2 sm:gap-2.5"
              >
                <span>வணக்கம் ஆசிரியரே!</span>
                <motion.span
                  className="inline-block origin-[70%_70%] select-none text-xl sm:text-3xl"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                  transition={{ duration: 1.1, delay: 0.2, ease: "easeInOut", repeat: 0 }}
                >
                  👋
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: EASE_EXPO }}
                className="text-xs sm:text-sm text-[#475569] font-medium font-tamil leading-relaxed"
              >
                மீண்டும் வரவேற்கிறோம்! மாணவர்களுக்காக இன்று புதிதாக ஒன்றை உருவாக்கலாமா?
              </motion.p>
            </div>

            {/* Right: Educational Art + Quote + Sign-out Button */}
            <div className="relative z-10 flex items-center gap-3 sm:gap-5 flex-shrink-0">
              {/* Desktop Educational Quote & Flat Vector Art */}
              <div className="hidden md:flex items-center gap-3 pr-2 border-r border-slate-200/70">
                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#169C87] font-serif-tamil block">
                    அறிவே ஆற்றல்
                  </span>
                  <span className="text-[10px] text-[#64748B] font-medium block">
                    கல்வி நிலையான செல்வம்
                  </span>
                </div>
                <WelcomeEducationIllustration className="w-28 h-20" />
              </div>

              {/* Sign-out Button */}
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                aria-label="வெளியேறு"
                className="group relative inline-flex items-center justify-center h-11 w-11 rounded-xl border border-slate-200 bg-white/95 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#169C87]"
                title="வெளியேறு"
              >
                <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              </button>
            </div>
          </motion.div>

          {/* ── Dashboard Statistics Counter Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
            {[
              {
                id: "materials" as Tab,
                label: "கற்றல் வளங்கள்",
                count: materials.length,
                icon: BookOpen,
                sub: "பதிவேற்றப்பட்ட ஆவணங்கள்",
                theme: {
                  activeCard: "bg-gradient-to-br from-white via-[#F2FAF6] to-[#DDF5EC] border-[#A7E5D1] shadow-[0_8px_25px_rgba(22,156,135,0.12)] -translate-y-1",
                  activeIcon: "bg-[#169C87] text-white border-[#169C87] shadow-xs scale-105",
                  inactiveIcon: "bg-[#DDF5EC] text-[#169C87] border-[#A7E5D1] group-hover:bg-[#169C87] group-hover:text-white",
                  activeText: "text-[#169C87]",
                  hoverBorder: "hover:border-[#169C87]/40 hover:bg-[#F8FCFA]",
                },
              },
              {
                id: "photos" as Tab,
                label: "புகைப்படங்கள்",
                count: photos.length,
                icon: Images,
                sub: "புகைப்பட தொகுப்புகள்",
                theme: {
                  activeCard: "bg-gradient-to-br from-white via-[#F4F9FF] to-[#E5F2FF] border-[#B9DCFF] shadow-[0_8px_25px_rgba(55,139,231,0.12)] -translate-y-1",
                  activeIcon: "bg-[#378BE7] text-white border-[#378BE7] shadow-xs scale-105",
                  inactiveIcon: "bg-[#E5F2FF] text-[#378BE7] border-[#B9DCFF] group-hover:bg-[#378BE7] group-hover:text-white",
                  activeText: "text-[#378BE7]",
                  hoverBorder: "hover:border-[#378BE7]/40 hover:bg-[#F8FBFF]",
                },
              },
              {
                id: "events" as Tab,
                label: "நிகழ்வுகள்",
                count: events.length,
                icon: CalendarDays,
                sub: "நிகழ்வுகள் மற்றும் போட்டிகள்",
                theme: {
                  activeCard: "bg-gradient-to-br from-white via-[#FFF5F5] to-[#FFE8E8] border-[#FFC8C8] shadow-[0_8px_25px_rgba(232,93,93,0.12)] -translate-y-1",
                  activeIcon: "bg-[#E85D5D] text-white border-[#E85D5D] shadow-xs scale-105",
                  inactiveIcon: "bg-[#FFE8E8] text-[#E85D5D] border-[#FFC8C8] group-hover:bg-[#E85D5D] group-hover:text-white",
                  activeText: "text-[#E85D5D]",
                  hoverBorder: "hover:border-[#E85D5D]/40 hover:bg-[#FFFCFC]",
                },
              },
            ].map((stat, idx) => {
              const active = tab === stat.id;
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.1 + idx * 0.08, ease: EASE_EXPO }}
                  onClick={() => setTab(stat.id)}
                  className={cn(
                    "group relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden select-none active:scale-[0.99]",
                    active
                      ? stat.theme.activeCard
                      : cn("bg-white/95 border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-1", stat.theme.hoverBorder)
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-bold font-tamil text-[#64748B] block">
                        {stat.label}
                      </span>
                      <div className="font-jakarta font-extrabold text-2xl sm:text-3xl text-[#0F172A]">
                        <AnimatedCounter value={stat.count} />
                      </div>
                    </div>

                    <div className={cn(
                      "p-2.5 sm:p-3 rounded-xl border transition-all duration-300",
                      active ? stat.theme.activeIcon : stat.theme.inactiveIcon
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="pt-2.5 sm:pt-3 mt-2.5 sm:mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-[#64748B]">
                    <span>{stat.sub}</span>
                    <ArrowRight className={cn(
                      "h-3.5 w-3.5 transition-transform duration-250",
                      active ? cn(stat.theme.activeText, "translate-x-1") : "text-slate-400 group-hover:translate-x-1"
                    )} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Toast Notifications ── */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                className={cn(
                  "p-3.5 rounded-xl text-xs font-bold font-tamil flex items-center gap-2.5 border shadow-sm",
                  toast.type === "success" && "bg-emerald-50 text-emerald-900 border-emerald-300/80",
                  toast.type === "error"   && "bg-red-50 text-red-900 border-red-300/80",
                  toast.type === "info"    && "bg-amber-50 text-amber-900 border-amber-300/80"
                )}
              >
                {toast.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-700 flex-shrink-0" />}
                {toast.type === "error"   && <AlertCircle  className="h-4 w-4 text-red-700 flex-shrink-0" />}
                {toast.type === "info"    && <Hash          className="h-4 w-4 text-amber-700 flex-shrink-0" />}
                <span>{toast.msg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Connected Management Tabs Navigation ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE_EXPO }}
            className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-2xs overflow-x-auto"
          >
            {([
              {
                id: "materials" as Tab,
                label: "கற்றல் வளங்கள்",
                icon: BookOpen,
                count: materials.length,
                activeClass: "bg-gradient-to-r from-[#169C87] to-[#10B981] text-white shadow-xs",
                inactiveClass: "text-[#334155] hover:text-[#169C87] hover:bg-[#DDF5EC]/60",
                iconColor: "text-[#169C87]",
                badgeActive: "bg-white/25 text-white",
                badgeInactive: "bg-[#DDF5EC] text-[#169C87] border border-[#A7E5D1]",
              },
              {
                id: "photos" as Tab,
                label: "புகைப்படங்கள்",
                icon: Images,
                count: photos.length,
                activeClass: "bg-gradient-to-r from-[#378BE7] to-[#2563EB] text-white shadow-xs",
                inactiveClass: "text-[#334155] hover:text-[#378BE7] hover:bg-[#E5F2FF]/60",
                iconColor: "text-[#378BE7]",
                badgeActive: "bg-white/25 text-white",
                badgeInactive: "bg-[#E5F2FF] text-[#378BE7] border border-[#B9DCFF]",
              },
              {
                id: "events" as Tab,
                label: "நிகழ்வுகள்",
                icon: CalendarDays,
                count: events.length,
                activeClass: "bg-gradient-to-r from-[#E85D5D] to-[#DC2626] text-white shadow-xs",
                inactiveClass: "text-[#334155] hover:text-[#E85D5D] hover:bg-[#FFE8E8]/60",
                iconColor: "text-[#E85D5D]",
                badgeActive: "bg-white/25 text-white",
                badgeInactive: "bg-[#FFE8E8] text-[#E85D5D] border border-[#FFC8C8]",
              },
            ]).map((t) => {
              const active = tab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-tamil transition-all duration-250 cursor-pointer outline-none select-none min-h-[44px] min-w-[120px] xs:min-w-0 focus-visible:ring-2 focus-visible:ring-[#378BE7] active:scale-[0.98]",
                    active ? t.activeClass : t.inactiveClass
                  )}
                >
                  <Icon className={cn("h-4 w-4 flex-shrink-0", active ? "text-white" : t.iconColor)} />
                  <span className="truncate">{t.label}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10.5px] font-bold font-jakarta transition-colors flex-shrink-0",
                    active ? t.badgeActive : t.badgeInactive
                  )}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* ── Tab Content Area ── */}
          <AnimatePresence mode="wait">
            {dataLoading ? (
              <div className="space-y-4">
                {[260, 180, 140].map((h, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-xs animate-pulse" style={{ height: `${h}px` }} />
                ))}
              </div>
            ) : (
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE_EXPO }}
              >
                {tab === "materials" && <MaterialsTab materials={materials} setMaterials={setMaterials} showToast={showToast} />}
                {tab === "photos"    && <PhotosTab    photos={photos}       setPhotos={setPhotos}       showToast={showToast} />}
                {tab === "events"    && <EventsTab    events={events}       setEvents={setEvents}       showToast={showToast} />}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* ── Sign-out Confirmation Dialog ── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.22, ease: EASE_EXPO }}
              className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 font-tamil text-[#0F172A]"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="dashboard-logout-title"
              aria-describedby="dashboard-logout-desc"
            >
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <LogOut className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 id="dashboard-logout-title" className="font-serif-tamil font-extrabold text-lg sm:text-xl text-[#0F172A]">
                    வெளியேற விரும்புகிறீர்களா?
                  </h3>
                  <p id="dashboard-logout-desc" className="text-xs sm:text-sm text-[#475569] leading-relaxed font-medium">
                    உங்கள் ஆசிரியர் கணக்கிலிருந்து வெளியேற உள்ளீர்கள்.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  ரத்து செய்யவும்
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  ஆம், வெளியேறு
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Transparent Home Footer ── */}
      <HomeFooter />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. Materials Tab Component (கற்றல் வளங்கள்)
───────────────────────────────────────────────────────────────────────────── */

function MaterialsTab({
  materials, setMaterials, showToast,
}: {
  materials: Material[];
  setMaterials: (m: Material[]) => void;
  showToast: (t: "success" | "error" | "info", m: string) => void;
}) {
  const [form,        setForm]        = useState("Form 1");
  const [subject,     setSubject]     = useState("தமிழ் இலக்கணம்");
  const [category,    setCategory]    = useState("குறிப்புகள்");
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [file,        setFile]        = useState<File | null>(null);
  const [isDragging,  setIsDragging]  = useState(false);

  const [busy,     setBusy]     = useState(false);
  const [progress, setProgress] = useState(0);

  const [isListExpanded, setIsListExpanded] = useState(false);
  const accordionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Edit Material States ──
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editForm,        setEditForm]        = useState("Form 1");
  const [editSubject,     setEditSubject]     = useState("தமிழ் இலக்கணம்");
  const [editCategory,    setEditCategory]    = useState("குறிப்புகள்");
  const [editTitle,       setEditTitle]       = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBusy,        setEditBusy]        = useState(false);

  // ── Folder Navigation States ──
  const [selectedForm,     setSelectedForm]     = useState<string | null>(null);
  const [selectedSubject,  setSelectedSubject]  = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery,      setSearchQuery]      = useState("");

  // 1. Available Forms (only forms that currently have uploaded materials)
  const availableForms = useMemo(() => {
    const map = new Map<string, number>();
    materials.forEach((m) => {
      const f = m.form || "Form 1";
      map.set(f, (map.get(f) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([formKey, count]) => ({
        formKey,
        label: getTamilForm(formKey),
        count,
      }))
      .sort((a, b) => {
        const numA = parseInt(a.formKey.replace(/\D/g, "") || "0", 10);
        const numB = parseInt(b.formKey.replace(/\D/g, "") || "0", 10);
        return numA - numB;
      });
  }, [materials]);

  // 2. Materials for selectedForm
  const formMaterials = useMemo(() => {
    if (!selectedForm) return [];
    return materials.filter((m) => (m.form || "Form 1") === selectedForm);
  }, [materials, selectedForm]);

  // 3. Available Subjects inside selectedForm
  const availableSubjects = useMemo(() => {
    if (!selectedForm) return [];
    const map = new Map<string, number>();
    formMaterials.forEach((m) => {
      const s = m.subject || "பொதுப் பாடம்";
      map.set(s, (map.get(s) || 0) + 1);
    });
    return Array.from(map.entries()).map(([subjectName, count]) => ({
      subjectName,
      count,
    }));
  }, [formMaterials, selectedForm]);

  // 4. Materials for selectedForm & selectedSubject
  const subjectMaterials = useMemo(() => {
    if (!selectedForm || !selectedSubject) return [];
    return formMaterials.filter((m) => (m.subject || "பொதுப் பாடம்") === selectedSubject);
  }, [formMaterials, selectedForm, selectedSubject]);

  // 5. Available Categories inside selectedForm & selectedSubject
  const availableCategories = useMemo(() => {
    if (!selectedForm || !selectedSubject) return [];
    const map = new Map<string, number>();
    subjectMaterials.forEach((m) => {
      const c = m.category || "குறிப்புகள்";
      map.set(c, (map.get(c) || 0) + 1);
    });
    return Array.from(map.entries()).map(([categoryName, count]) => ({
      categoryName,
      count,
    }));
  }, [subjectMaterials, selectedForm, selectedSubject]);

  // 6. Materials for selectedForm, selectedSubject, selectedCategory
  const categoryMaterials = useMemo(() => {
    if (!selectedForm || !selectedSubject || !selectedCategory) return [];
    return subjectMaterials.filter((m) => (m.category || "குறிப்புகள்") === selectedCategory);
  }, [subjectMaterials, selectedForm, selectedSubject, selectedCategory]);

  // 7. Search Results across all materials
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return materials.filter((m) => {
      const matchTitle = m.title?.toLowerCase().includes(q);
      const matchDesc = m.description?.toLowerCase().includes(q);
      const matchSub = m.subject?.toLowerCase().includes(q);
      const matchForm = m.form?.toLowerCase().includes(q) || getTamilForm(m.form).toLowerCase().includes(q);
      const matchCat = m.category?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchSub || matchForm || matchCat;
    });
  }, [materials, searchQuery]);

  // Back Navigation handler
  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else if (selectedSubject) {
      setSelectedSubject(null);
    } else if (selectedForm) {
      setSelectedForm(null);
    }
  };

  const renderMaterialCard = (m: Material, idx: number) => {
    const isPdf = m.fileType === "pdf" || m.fileUrl?.toLowerCase().includes(".pdf");
    return (
      <motion.div
        key={m.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.25) }}
        className="group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-[#169C87]/45 hover:shadow-md transition-all duration-200"
      >
        <div>
          {/* Tags Header */}
          <div className="flex items-center justify-between gap-1.5 mb-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#DDF5EC] text-[#169C87] border border-[#A7E5D1]">
                {getTamilForm(m.form)}
              </span>
              <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {m.category || "குறிப்புகள்"}
              </span>
            </div>
            <span className={cn(
              "text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
              isPdf
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            )}>
              {isPdf ? "PDF" : "DOC"}
            </span>
          </div>

          {/* Title & Subject */}
          <div className="flex items-start gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#DDF5EC] border border-[#A7E5D1] flex items-center justify-center flex-shrink-0 mt-0.5 text-[#169C87]">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <a
                href={m.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-serif-tamil font-bold text-[#0F172A] hover:text-[#169C87] text-xs sm:text-sm leading-snug line-clamp-2 transition-colors cursor-pointer flex items-center gap-1.5 group/link"
              >
                <span>{m.title}</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 text-[#169C87] transition-opacity flex-shrink-0" />
              </a>
              <p className="text-[11px] text-[#169C87] font-semibold mt-0.5">
                {m.subject}
              </p>
            </div>
          </div>

          {/* Optional Description */}
          {m.description && (
            <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed bg-slate-50/80 p-2 rounded-lg border border-slate-200/70">
              {m.description}
            </p>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 font-medium">
            {formatTamilDateDisplay(m.uploadedAt)}
          </span>

          <div className="flex items-center gap-1">
            <a
              href={m.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-7.5 w-7.5 rounded-lg flex items-center justify-center text-[#169C87] hover:bg-[#DDF5EC] transition-colors cursor-pointer"
              title="பார்க்க"
            >
              <Eye className="h-3.5 w-3.5" />
            </a>
            <a
              href={m.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="h-7.5 w-7.5 rounded-lg flex items-center justify-center text-[#169C87] hover:bg-[#DDF5EC] transition-colors cursor-pointer"
              title="பதிவிறக்க"
            >
              <Download className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={() => startEdit(m)}
              className="h-7.5 w-7.5 rounded-lg flex items-center justify-center text-slate-600 hover:text-[#169C87] hover:bg-[#DDF5EC]/70 transition-colors cursor-pointer"
              title="திருத்தவும்"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(m)}
              className="h-7.5 w-7.5 rounded-lg flex items-center justify-center text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="நீக்கவும்"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const validExtensions = [".pdf", ".doc", ".docx"];
      const isExtensionValid = validExtensions.some((ext) => droppedFile.name.toLowerCase().endsWith(ext));
      if (isExtensionValid || droppedFile.type.includes("pdf") || droppedFile.type.includes("word") || droppedFile.type.includes("document")) {
        setFile(droppedFile);
      } else {
        showToast("error", "தயவுசெய்து PDF அல்லது Word (.doc, .docx) கோப்பை மட்டும் தேர்ந்தெடுக்கவும்.");
      }
    }
  };

  const toggleListAccordion = () => {
    setIsListExpanded((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          accordionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 120);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) {
      showToast("error", "கற்றல் வளத்தின் தலைப்பு மற்றும் கோப்பைத் தேர்வு செய்யவும்.");
      return;
    }
    setBusy(true);
    setProgress(0);

    try {
      const fileName  = generateSmartFileName(title, form, subject, file.name);
      const spath     = buildStoragePath(form, subject, category, fileName);
      const { url: fileUrl, storagePath } = await uploadFile(spath, file, (p) => setProgress(p));
      const fileType  = file.type.includes("pdf") ? "pdf" : "doc";

      await addMaterial({
        title: title.trim(),
        subject,
        description: description.trim(),
        fileUrl,
        fileType,
        form,
        category,
        fileSize: file.size,
        fileName,
        storagePath,
      });

      const fresh = await getMaterials();
      setMaterials(fresh);
      setTitle("");
      setDescription("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      showToast("success", "கற்றல் வளம் வெற்றிகரமாகச் சேமிக்கப்பட்டது!");
    } catch (err: any) {
      console.error("[Upload Error]", err);
      showToast("error", err?.message || "பதிவேற்ற முடியவில்லை. மீண்டும் முயலவும்.");
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  const handleDelete = async (m: Material) => {
    if (!confirm(`"${m.title}" கற்றல் வளத்தை நிச்சயமாக நீக்க விரும்புகிறீர்களா?`)) return;
    try {
      if (m.storagePath || m.fileUrl) {
        await deleteFile(m.storagePath || m.fileUrl).catch(() => {});
      }
      await deleteMaterial(m.id);
      setMaterials(materials.filter((x) => x.id !== m.id));
      showToast("success", "கற்றல் வளம் நீக்கப்பட்டது.");
    } catch {
      showToast("error", "கற்றல் வளத்தை நீக்க முடியவில்லை.");
    }
  };

  const startEdit = (m: Material) => {
    setEditingMaterial(m);
    setEditForm(m.form || "Form 1");
    setEditSubject(m.subject || "தமிழ் இலக்கணம்");
    setEditCategory(m.category || "குறிப்புகள்");
    setEditTitle(m.title || "");
    setEditDescription(m.description || "");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;
    if (!editTitle.trim()) {
      showToast("error", "தலைப்பை உள்ளிடவும்.");
      return;
    }
    setEditBusy(true);
    try {
      await updateMaterial(editingMaterial.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        form: editForm,
        subject: editSubject,
        category: editCategory,
      });
      const fresh = await getMaterials();
      setMaterials(fresh);
      setEditingMaterial(null);
      showToast("success", "மாற்றங்கள் வெற்றிகரமாகச் சேமிக்கப்பட்டன!");
    } catch {
      showToast("error", "புதுப்பிக்க முடியவில்லை.");
    } finally {
      setEditBusy(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7 font-tamil">
      {/* ── Materials Upload Form Card ── */}
      <div className="relative p-5 sm:p-7 rounded-[22px] bg-white/98 border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Inner Subtle Accent Frame Border */}
        <div className="absolute inset-2.5 rounded-[16px] border border-slate-100 pointer-events-none" />

        {/* Section Header with Decorative Art */}
        <div className="relative z-10 pb-4 mb-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] font-serif-tamil flex items-center gap-2.5">
              <div className="h-8.5 w-8.5 rounded-xl bg-[#DDF5EC] border border-[#A7E5D1] flex items-center justify-center flex-shrink-0 text-[#169C87]">
                <BookOpen className="h-4.5 w-4.5" />
              </div>
              <span>கற்றல் வளங்கள் மேலாண்மை</span>
            </h2>
            <p className="text-xs text-[#64748B] font-tamil mt-1 leading-relaxed">
              மாணவர்களுக்கான ஆவணங்கள், PDF கோப்புகள் மற்றும் கற்றல் வளங்களை இங்கே பதிவேற்றி நிர்வகிக்கலாம்.
            </p>
          </div>

          {/* Educational Decorative Illustration on the Right */}
          <div className="hidden sm:block flex-shrink-0">
            <LearningHeaderIllustration className="w-24 h-14" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 font-tamil relative z-10">
          {/* Row 1: Grade, Subject, Type Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {/* Grade (படிவம்) - Mint/Teal Icon */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                <span>படிவம்</span>
                <span className="text-[#169C87] font-bold">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#169C87] pointer-events-none" />
                <select
                  value={form}
                  onChange={(e) => setForm(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-[#0F172A] text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#169C87] focus:ring-2 focus:ring-[#169C87]/15 appearance-none cursor-pointer transition-all duration-200 shadow-2xs"
                >
                  {FORMS.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Subject (பாடம்) - Blue Icon */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                <span>பாடம் / தலைப்புப் பிரிவு</span>
                <span className="text-[#378BE7] font-bold">*</span>
              </label>
              <div className="relative">
                <BookMarked className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#378BE7] pointer-events-none" />
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-[#0F172A] text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#378BE7] focus:ring-2 focus:ring-[#378BE7]/15 appearance-none cursor-pointer transition-all duration-200 shadow-2xs"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Category / Type (வகை) - Indigo Icon */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                <span>வகை</span>
                <span className="text-[#6366F1] font-bold">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6366F1] pointer-events-none" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-[#0F172A] text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 appearance-none cursor-pointer transition-all duration-200 shadow-2xs"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 2: Title and Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                <span>கற்றல் வளத்தின் தலைப்பு</span>
                <span className="text-[#378BE7] font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="உதாரணம்: தமிழ் இலக்கணம் - புணர்ச்சி விதிகள்"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#0F172A] text-xs sm:text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#378BE7] focus:ring-2 focus:ring-[#378BE7]/15 transition-all duration-200 shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                <span>விவரம்</span>
                <span className="text-slate-400 font-normal text-[11px]">(விருப்பத்தேர்வு)</span>
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="மாணவர்களுக்கான சுருக்கமான குறிப்புகள்…"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#0F172A] text-xs sm:text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/15 transition-all duration-200 shadow-2xs"
              />
            </div>
          </div>

          {/* Row 3: Modern Pale Blue Drag-and-Drop File Upload Area */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                <span>கோப்பு தேர்வு</span>
                <span className="text-[#378BE7] font-bold">*</span>
              </label>
              <span className="text-[11px] text-[#378BE7] font-bold bg-[#E5F2FF] px-2 py-0.5 rounded-md border border-[#B9DCFF]">
                PDF • DOC • DOCX
              </span>
            </div>

            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileInput}
              className="sr-only"
            />

            {!file ? (
              /* Drag & Drop Upload Zone */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className={cn(
                  "group relative flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center select-none outline-none focus-visible:ring-2 focus-visible:ring-[#378BE7]",
                  isDragging
                    ? "border-[#378BE7] bg-[#E5F2FF] shadow-md scale-[1.008]"
                    : "border-[#B9DCFF] bg-[#F4F9FF]/80 hover:border-[#378BE7] hover:bg-[#EAF4FF] hover:shadow-2xs"
                )}
              >
                <div className="h-11 w-11 rounded-2xl bg-[#E5F2FF] border border-[#B9DCFF] text-[#378BE7] group-hover:bg-[#378BE7] group-hover:text-white group-hover:scale-105 group-hover:shadow-[0_4px_14px_rgba(55,139,231,0.25)] transition-all duration-200 flex items-center justify-center mb-2.5">
                  <UploadCloud className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#378BE7] transition-colors leading-snug">
                  கோப்பை இங்கே இழுக்கவும் அல்லது தேர்வு செய்யவும்
                </p>
                <p className="text-[10.5px] sm:text-[11px] font-semibold text-[#378BE7]/85 tracking-wider uppercase mt-1">
                  PDF • DOC • DOCX
                </p>
              </div>
            ) : (
              /* Compact Selected File Preview Card */
              <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs transition-all duration-200">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="h-10 w-10 rounded-xl bg-[#E5F2FF] border border-[#B9DCFF] flex items-center justify-center flex-shrink-0 text-[#378BE7]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="font-bold text-xs sm:text-sm text-[#0F172A] truncate max-w-[200px] sm:max-w-[340px]">
                      {file.name}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10.5px] font-bold text-[#169C87]">
                        {formatBytes(file.size)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        • {file.name.split(".").pop()?.toUpperCase() || "FILE"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#378BE7] hover:bg-[#E5F2FF] border border-[#B9DCFF] transition-colors cursor-pointer"
                    title="வேறு கோப்பை தேர்வு செய்"
                  >
                    மாற்று
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    aria-label="கோப்பை நீக்குக"
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center cursor-pointer"
                    title="நீக்குக"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {busy && (
            <div className="space-y-1.5 pt-1 max-w-md mx-auto">
              <div className="flex justify-between text-xs font-bold text-[#169C87]">
                <span>பதிவேற்றப்படுகிறது…</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#DDF5EC] overflow-hidden">
                <div
                  className="h-full bg-[#169C87] transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Modern Blue -> Blue-Violet Gradient Save Button with Arrow */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={busy || !title.trim() || !file}
              className="inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#3498DB] via-[#4F78E2] to-[#667EEA] hover:from-[#2980B9] hover:to-[#5A67D8] disabled:opacity-45 disabled:cursor-not-allowed disabled:transform-none text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>சேமிக்கிறது...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>சேமி</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-80" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Uploaded Resources Collapsible Accordion ── */}
      <div
        ref={accordionRef}
        className={cn(
          "relative rounded-[22px] border transition-all duration-300 overflow-hidden font-tamil",
          isListExpanded
            ? "bg-white/98 border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            : "bg-white/95 border-slate-200/80 hover:border-[#169C87]/40 hover:bg-white"
        )}
      >
        <button
          type="button"
          onClick={toggleListAccordion}
          className="w-full flex items-center justify-between p-4.5 sm:p-5 text-left cursor-pointer select-none transition-colors"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div className="h-9 w-9 rounded-xl bg-[#DDF5EC] border border-[#A7E5D1] flex items-center justify-center flex-shrink-0 text-[#169C87]">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <h2 className="font-bold text-[#0F172A] text-sm sm:text-base font-serif-tamil">
              பதிவேற்றப்பட்ட கற்றல் வளங்கள்
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DDF5EC] text-[#169C87] border border-[#A7E5D1]">
              {materials.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#169C87] font-bold">
              {isListExpanded ? "மறைக்கவும்" : "பார்க்கவும்"}
            </span>
            <div
              className={cn(
                "h-8 w-8 rounded-lg bg-[#DDF5EC] flex items-center justify-center transition-transform duration-300 text-[#169C87]",
                isListExpanded && "rotate-180 bg-[#169C87] text-white"
              )}
            >
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isListExpanded && (
            <motion.div
              key="materials-accordion-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_EXPO }}
              className="overflow-hidden"
            >
              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 space-y-3.5">
                {materials.length === 0 ? (
                  <div className="py-10 text-center rounded-2xl bg-white border border-slate-200/80 my-2">
                    <BookOpen className="h-9 w-9 text-[#169C87]/35 mx-auto mb-2" />
                    <h3 className="font-bold text-[#0F172A] text-sm mb-1">கற்றல் வளங்கள் எதுவும் கிடைக்கவில்லை</h3>
                    <p className="text-xs text-[#64748B]">
                      புதிய கற்றல் வளங்களை மேலே உள்ள படிவத்தைப் பயன்படுத்தி சேமிக்கவும்.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5 my-1">
                    {/* ── Breadcrumbs & Quick Search Bar ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                      {/* Breadcrumbs Navigation */}
                      <div className="flex items-center gap-1.5 text-xs font-tamil flex-wrap">
                        {(selectedForm || searchQuery) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (searchQuery) {
                                setSearchQuery("");
                              } else {
                                handleBack();
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#169C87] bg-[#DDF5EC] hover:bg-[#A7E5D1] font-bold text-xs transition-colors cursor-pointer mr-1"
                            title="முந்தைய நிலைக்குச் செல்"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>பின்செல்</span>
                          </button>
                        )}

                        {/* Root Breadcrumb */}
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedForm(null);
                            setSelectedSubject(null);
                            setSelectedCategory(null);
                          }}
                          className={cn(
                            "px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-bold",
                            !selectedForm && !searchQuery
                              ? "text-[#169C87] bg-[#DDF5EC] border border-[#A7E5D1]"
                              : "text-slate-600 hover:text-[#169C87] hover:bg-[#DDF5EC]/50"
                          )}
                        >
                          அனைத்தும்
                        </button>

                        {/* Form Breadcrumb */}
                        {selectedForm && !searchQuery && (
                          <>
                            <ChevronRight className="h-3.5 w-3.5 text-[#169C87]/50 flex-shrink-0" />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSubject(null);
                                setSelectedCategory(null);
                              }}
                              className={cn(
                                "px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-bold",
                                !selectedSubject
                                  ? "text-[#169C87] bg-[#DDF5EC] border border-[#A7E5D1]"
                                  : "text-slate-600 hover:text-[#169C87] hover:bg-[#DDF5EC]/50"
                              )}
                            >
                              {getTamilForm(selectedForm)}
                            </button>
                          </>
                        )}

                        {/* Subject Breadcrumb */}
                        {selectedSubject && !searchQuery && (
                          <>
                            <ChevronRight className="h-3.5 w-3.5 text-[#169C87]/50 flex-shrink-0" />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCategory(null);
                              }}
                              className={cn(
                                "px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-bold",
                                !selectedCategory
                                  ? "text-[#169C87] bg-[#DDF5EC] border border-[#A7E5D1]"
                                  : "text-slate-600 hover:text-[#169C87] hover:bg-[#DDF5EC]/50"
                              )}
                            >
                              {selectedSubject}
                            </button>
                          </>
                        )}

                        {/* Category Breadcrumb */}
                        {selectedCategory && !searchQuery && (
                          <>
                            <ChevronRight className="h-3.5 w-3.5 text-[#169C87]/50 flex-shrink-0" />
                            <span className="px-2.5 py-1 rounded-lg text-[#169C87] bg-[#DDF5EC] border border-[#A7E5D1] font-bold">
                              {selectedCategory}
                            </span>
                          </>
                        )}

                        {/* Search Active Breadcrumb */}
                        {searchQuery && (
                          <>
                            <ChevronRight className="h-3.5 w-3.5 text-[#169C87]/50 flex-shrink-0" />
                            <span className="px-2.5 py-1 rounded-lg text-[#169C87] bg-[#DDF5EC] border border-[#A7E5D1] font-bold">
                              தேடல்: &quot;{searchQuery}&quot;
                            </span>
                          </>
                        )}
                      </div>

                      {/* Quick Search Box */}
                      <div className="relative min-w-[200px] sm:w-60 flex-shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#169C87] pointer-events-none" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="வளங்களைத் தேடுக…"
                          className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#169C87] focus:ring-2 focus:ring-[#169C87]/15 transition-all"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#169C87] p-0.5 rounded cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ── Dynamic Folder / File View Container ── */}
                    <div className="max-h-[520px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                      <AnimatePresence mode="wait">
                        {/* ── Case 1: Search Query Active ── */}
                        {searchQuery.trim() !== "" ? (
                          <motion.div
                            key="search-results-view"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3"
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                              <span>கண்டுபிடிக்கப்பட்ட வளங்கள்:</span>
                              <span className="text-[#169C87] font-extrabold">{searchResults.length} முடிவுகள்</span>
                            </div>

                            {searchResults.length === 0 ? (
                              <div className="py-10 text-center rounded-2xl bg-white border border-slate-200/80">
                                <Search className="h-8 w-8 text-[#169C87]/35 mx-auto mb-2" />
                                <h3 className="font-bold text-[#0F172A] text-sm mb-1">தேடல் முடிவுகள் எதுவும் கிடைக்கவில்லை</h3>
                                <p className="text-xs text-[#64748B]">
                                  வேறு சொற்களைப் பயன்படுத்தி மீண்டும் தேடவும்.
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
                                {searchResults.map((m, idx) => renderMaterialCard(m, idx))}
                              </div>
                            )}
                          </motion.div>
                        ) : !selectedForm ? (
                          /* ── Case 2: Level 0 — Form Folders ── */
                          <motion.div
                            key="level-0-forms-view"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3"
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                              <span>படிவ வாரியாகக் கோப்புறைகள்:</span>
                              <span className="text-[#169C87] font-extrabold">{availableForms.length} படிவங்கள்</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5">
                              {availableForms.map((f, idx) => (
                                <motion.div
                                  key={f.formKey}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.25) }}
                                  onClick={() => setSelectedForm(f.formKey)}
                                  className="group relative p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-[#169C87]/50 hover:bg-[#F0FAF5] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-between select-none"
                                >
                                  <div className="flex items-center gap-3 min-w-0 pr-2">
                                    <div className="h-11 w-11 rounded-xl bg-[#DDF5EC] border border-[#A7E5D1] text-[#169C87] group-hover:bg-[#169C87] group-hover:text-white group-hover:scale-105 group-hover:shadow-xs transition-all duration-200 flex items-center justify-center flex-shrink-0">
                                      <Folder className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-serif-tamil font-bold text-sm text-[#0F172A] group-hover:text-[#169C87] truncate transition-colors">
                                        {f.label}
                                      </h4>
                                      <span className="text-[11px] font-semibold text-[#169C87]/90 mt-0.5 block">
                                        {f.count} {f.count === 1 ? "வளம்" : "வளங்கள்"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="h-7 w-7 rounded-lg bg-[#DDF5EC]/70 group-hover:bg-[#169C87] text-[#169C87] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        ) : !selectedSubject ? (
                          /* ── Case 3: Level 1 — Subject Folders inside Form ── */
                          <motion.div
                            key="level-1-subjects-view"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3"
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                              <span>{getTamilForm(selectedForm)} — பாடப் பிரிவுகள்:</span>
                              <span className="text-[#169C87] font-extrabold">{availableSubjects.length} பாடங்கள்</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5">
                              {availableSubjects.map((s, idx) => (
                                <motion.div
                                  key={s.subjectName}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.25) }}
                                  onClick={() => setSelectedSubject(s.subjectName)}
                                  className="group relative p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-[#169C87]/50 hover:bg-[#F0FAF5] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-between select-none"
                                >
                                  <div className="flex items-center gap-3 min-w-0 pr-2">
                                    <div className="h-11 w-11 rounded-xl bg-[#DDF5EC] border border-[#A7E5D1] text-[#169C87] group-hover:bg-[#169C87] group-hover:text-white group-hover:scale-105 group-hover:shadow-xs transition-all duration-200 flex items-center justify-center flex-shrink-0">
                                      <BookMarked className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-serif-tamil font-bold text-sm text-[#0F172A] group-hover:text-[#169C87] truncate transition-colors">
                                        {s.subjectName}
                                      </h4>
                                      <span className="text-[11px] font-semibold text-[#169C87]/90 mt-0.5 block">
                                        {s.count} {s.count === 1 ? "வளம்" : "வளங்கள்"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="h-7 w-7 rounded-lg bg-[#DDF5EC]/70 group-hover:bg-[#169C87] text-[#169C87] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        ) : !selectedCategory ? (
                          /* ── Case 4: Level 2 — Resource Type Folders inside Subject ── */
                          <motion.div
                            key="level-2-categories-view"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3"
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                              <span>{selectedSubject} — வள வகைகள்:</span>
                              <span className="text-[#169C87] font-extrabold">{availableCategories.length} வகைகள்</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5">
                              {availableCategories.map((c, idx) => (
                                <motion.div
                                  key={c.categoryName}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.25) }}
                                  onClick={() => setSelectedCategory(c.categoryName)}
                                  className="group relative p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-[#169C87]/50 hover:bg-[#F0FAF5] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-between select-none"
                                >
                                  <div className="flex items-center gap-3 min-w-0 pr-2">
                                    <div className="h-11 w-11 rounded-xl bg-[#DDF5EC] border border-[#A7E5D1] text-[#169C87] group-hover:bg-[#169C87] group-hover:text-white group-hover:scale-105 group-hover:shadow-xs transition-all duration-200 flex items-center justify-center flex-shrink-0">
                                      <FolderOpen className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-serif-tamil font-bold text-sm text-[#0F172A] group-hover:text-[#169C87] truncate transition-colors">
                                        {c.categoryName}
                                      </h4>
                                      <span className="text-[11px] font-semibold text-[#169C87]/90 mt-0.5 block">
                                        {c.count} {c.count === 1 ? "ஆவணம்" : "ஆவணங்கள்"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="h-7 w-7 rounded-lg bg-[#DDF5EC]/70 group-hover:bg-[#169C87] text-[#169C87] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        ) : (
                          /* ── Case 5: Level 3 — Files inside Selected Category ── */
                          <motion.div
                            key="level-3-files-view"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3"
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                              <span>
                                {getTamilForm(selectedForm)} &gt; {selectedSubject} &gt; {selectedCategory}
                              </span>
                              <span className="text-[#169C87] font-extrabold">{categoryMaterials.length} ஆவணங்கள்</span>
                            </div>

                            {categoryMaterials.length === 0 ? (
                              <div className="py-10 text-center rounded-2xl bg-white border border-slate-200/80">
                                <BookOpen className="h-8 w-8 text-[#169C87]/35 mx-auto mb-2" />
                                <h3 className="font-bold text-[#0F172A] text-sm mb-1">இந்தக் கோப்புறையில் ஆவணங்கள் எதுவும் கிடைக்கவில்லை</h3>
                                <p className="text-xs text-[#64748B]">
                                  புதிய ஆவணங்களைப் பதிவேற்ற மேலே உள்ள படிவத்தைப் பயன்படுத்தவும்.
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
                                {categoryMaterials.map((m, idx) => renderMaterialCard(m, idx))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Edit Material Modal ── */}
      <AnimatePresence>
        {editingMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs font-tamil">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg p-5 sm:p-6 rounded-[22px] bg-white border border-slate-200 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-[#0F172A] text-base flex items-center gap-2 font-serif-tamil">
                  <Pencil className="h-4 w-4 text-[#169C87]" />
                  <span>கற்றல் வளம் திருத்தம்</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingMaterial(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0F172A]">
                    தலைப்பு <span className="text-[#378BE7]">*</span>
                  </label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#0F172A] text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#169C87] focus:ring-2 focus:ring-[#169C87]/15 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#0F172A]">படிவம்</label>
                    <div className="relative">
                      <select
                        value={editForm}
                        onChange={(e) => setEditForm(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#169C87] appearance-none cursor-pointer"
                      >
                        {FORMS.map((f) => (
                          <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#169C87] pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#0F172A]">பாடம்</label>
                    <div className="relative">
                      <select
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#378BE7] appearance-none cursor-pointer"
                      >
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#378BE7] pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#0F172A]">வகை</label>
                    <div className="relative">
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#6366F1] appearance-none cursor-pointer"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6366F1] pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0F172A]">விவரம்</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-[#0F172A] text-xs font-semibold focus:outline-none focus:border-[#169C87] focus:ring-2 focus:ring-[#169C87]/15 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingMaterial(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold cursor-pointer transition-colors"
                  >
                    ரத்து செய்யவும்
                  </button>
                  <button
                    type="submit"
                    disabled={editBusy}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#3498DB] via-[#4F78E2] to-[#667EEA] hover:from-[#2980B9] hover:to-[#5A67D8] text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{editBusy ? "சேமிக்கிறது…" : "மாற்றங்களைச் சேமிக்கவும்"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PhotosHeaderIllustration({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 140 85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none pointer-events-none drop-shadow-2xs", className)}
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Background Pastel Glows */}
      <circle cx="70" cy="42" r="36" fill="#EAF4FF" fillOpacity="0.9" />
      <circle cx="108" cy="26" r="18" fill="#EDE9FE" fillOpacity="0.75" />
      <circle cx="28" cy="30" r="14" fill="#FEF3C7" fillOpacity="0.6" />

      {/* Sparkles */}
      <path d="M118 14L119.5 17.5L123 19L119.5 20.5L118 24L116.5 20.5L113 19L116.5 17.5L118 14Z" fill="#FBBF24" />
      <path d="M18 20L19 22.5L21.5 23.5L19 24.5L18 27L17 24.5L14.5 23.5L17 22.5L18 20Z" fill="#38BDF8" />

      {/* Polaroid Card 1 (Back Right - Slightly Rotated) */}
      <g transform="rotate(12 88 38)">
        <rect x="68" y="16" width="40" height="48" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
        <rect x="71" y="19" width="34" height="32" rx="1.5" fill="#BAE6FD" />
        {/* Mountain graphic */}
        <polygon points="73,49 84,33 93,49" fill="#38BDF8" />
        <polygon points="86,49 95,37 103,49" fill="#0284C7" />
        <circle cx="79" cy="26" r="3" fill="#FDE047" />
      </g>

      {/* Polaroid Card 2 (Back Left - Rotated Counter) */}
      <g transform="rotate(-10 46 42)">
        <rect x="26" y="20" width="38" height="46" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
        <rect x="29" y="23" width="32" height="30" rx="1.5" fill="#DDD6FE" />
        {/* Sunset & Hill graphic */}
        <path d="M29 45C35 41 45 42 51 46C56 42 59 43 61 45V53H29V45Z" fill="#8B5CF6" />
        <circle cx="45" cy="33" r="4" fill="#FB923C" />
      </g>

      {/* Main Vector Camera (Foreground) */}
      <g transform="translate(42, 30)">
        {/* Camera Base Body */}
        <rect x="0" y="8" width="56" height="38" rx="8" fill="#4D8FE8" />
        <rect x="0" y="8" width="56" height="10" rx="4" fill="#3B82F6" />
        
        {/* Camera Top Flash / Viewfinder */}
        <rect x="18" y="2" width="20" height="7" rx="2" fill="#2563EB" />
        <rect x="23" y="4" width="10" height="3" rx="1" fill="#93C5FD" />
        <rect x="8" y="4" width="6" height="4" rx="1" fill="#F59E0B" />
        <circle cx="47" cy="13" r="2.5" fill="#EF4444" />

        {/* Outer Lens Ring */}
        <circle cx="28" cy="27" r="14" fill="#1E293B" />
        <circle cx="28" cy="27" r="11" fill="#334155" />
        <circle cx="28" cy="27" r="8.5" fill="#60A5FA" />
        <circle cx="28" cy="27" r="5" fill="#1E3A8A" />
        <circle cx="26" cy="25" r="2" fill="#FFFFFF" fillOpacity="0.8" />
      </g>

      {/* Decorative Mint / Green Leaves at Base */}
      <path d="M102 62C106 55 114 54 117 56C117 63 110 69 102 62Z" fill="#34D399" />
      <path d="M103 61C107 61 110 59 113 57" stroke="#059669" strokeWidth="1" strokeLinecap="round" />
      <path d="M22 66C26 60 34 60 36 63C35 69 29 73 22 66Z" fill="#10B981" />
    </motion.svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. Photos Tab Component (புகைப்படங்கள் - 1 Cover Photo + Google Drive Link)
───────────────────────────────────────────────────────────────────────────── */

function PhotosTab({
  photos, setPhotos, showToast,
}: {
  photos: Photo[];
  setPhotos: (p: Photo[]) => void;
  showToast: (t: "success" | "error" | "info", m: string) => void;
}) {
  const formRef = useRef<HTMLDivElement>(null);
  const albumAccordionRef = useRef<HTMLDivElement>(null);

  const [title,           setTitle]           = useState("");
  const [description,     setDescription]     = useState("");
  const [driveUrl,        setDriveUrl]        = useState("");
  const [coverFile,       setCoverFile]       = useState<File | null>(null);
  const [coverPreview,    setCoverPreview]    = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const [editingAlbum,    setEditingAlbum]    = useState<Photo | null>(null);

  const [isListExpanded,  setIsListExpanded]  = useState(false);

  const [busy,            setBusy]            = useState(false);
  const [progress,        setProgress]        = useState(0);
  const [status,          setStatus]          = useState("");
  const [urlError,        setUrlError]        = useState<string | null>(null);

  const validateDriveFolderUrl = (val: string): { isValid: boolean; normalizedUrl: string; error?: string } => {
    if (!val || !val.trim()) {
      return { isValid: false, normalizedUrl: "", error: "Google Drive படத்தொகுப்பு இணைப்பை உள்ளிடவும்." };
    }
    let url = val.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      if (!host.includes("drive.google.com") && !host.includes("google.com") && !host.includes("photos.app.goo.gl")) {
        return { isValid: false, normalizedUrl: url, error: "சரியான Google Drive கோப்புறை இணைப்பை உள்ளிடவும்." };
      }
      return { isValid: true, normalizedUrl: url };
    } catch {
      return { isValid: false, normalizedUrl: url, error: "சரியான Google Drive கோப்புறை இணைப்பை உள்ளிடவும்." };
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "சரியான படக் கோப்பைத் தேர்வு செய்யவும் (JPG, PNG, WebP).");
      return;
    }
    setStatus("படத்தை தயார் செய்கிறோம்…");
    try {
      const r = await compressFile(file);
      setCompressionInfo(r);
      setCoverFile(new File([r.file], file.name, { type: file.type }));
    } catch {
      setCompressionInfo({ file, originalSize: file.size, compressedSize: file.size });
      setCoverFile(file);
    }
    setCoverPreview(URL.createObjectURL(file));
    setStatus("");
  };

  const removeCoverPhoto = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setCompressionInfo(null);
  };

  const startEdit = (album: Photo) => {
    setEditingAlbum(album);
    setTitle(album.title || "");
    setDescription(album.description || "");
    setDriveUrl(album.driveUrl || "");
    setCoverFile(null);
    setCoverPreview(album.url || null);
    setCompressionInfo(null);
    setUrlError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelEdit = () => {
    setEditingAlbum(null);
    setTitle("");
    setDescription("");
    setDriveUrl("");
    setCoverFile(null);
    setCoverPreview(null);
    setCompressionInfo(null);
    setUrlError(null);
  };

  const handleDriveUrlChange = (val: string) => {
    setDriveUrl(val);
    if (urlError) {
      const check = validateDriveFolderUrl(val);
      if (check.isValid) setUrlError(null);
    }
  };

  const toggleListAccordion = () => {
    setIsListExpanded((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          albumAccordionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 100);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast("error", "நிகழ்வின் பெயரை உள்ளிடவும்.");
      return;
    }

    const driveCheck = validateDriveFolderUrl(driveUrl);
    if (!driveCheck.isValid) {
      const errMsg = driveCheck.error || "சரியான Google Drive கோப்புறை இணைப்பை உள்ளிடவும்.";
      setUrlError(errMsg);
      showToast("error", errMsg);
      return;
    }
    setUrlError(null);

    if (!editingAlbum && !coverFile) {
      showToast("error", "ஒரு அட்டைப்படத்தைத் தேர்வு செய்யவும்.");
      return;
    }

    if (editingAlbum && !coverFile && !coverPreview) {
      showToast("error", "ஒரு அட்டைப்படத்தை வழங்கவும்.");
      return;
    }

    setBusy(true);
    setProgress(0);
    try {
      let finalUrl = editingAlbum ? editingAlbum.url : "";
      let finalStoragePath = editingAlbum ? editingAlbum.storagePath : "";

      if (coverFile) {
        setStatus("அட்டைப்படம் பதிவேற்றுகிறோம்…");
        const ext = coverFile.name.split(".").pop() ?? "jpg";
        const fname = `album-cover-${Date.now()}.${ext}`;
        const spath = `gallery/${fname}`;
        const { url } = await uploadFile(spath, coverFile, (p) => setProgress(p));

        if (editingAlbum && editingAlbum.storagePath && editingAlbum.storagePath !== spath) {
          await deleteFile(editingAlbum.storagePath).catch(() => {});
        }

        finalUrl = url;
        finalStoragePath = spath;
      }

      if (editingAlbum) {
        setStatus("படத்தொகுப்பு புதுப்பிக்கப்படுகிறது…");
        await updatePhoto(editingAlbum.id, {
          title: title.trim(),
          description: description.trim(),
          driveUrl: driveCheck.normalizedUrl,
          url: finalUrl,
          storagePath: finalStoragePath,
        });
        showToast("success", "படத்தொகுப்பு வெற்றிகரமாகச் சேமிக்கப்பட்டது!");
      } else {
        setStatus("படத்தொகுப்பு சேமிக்கப்படுகிறது…");
        await addPhoto({
          title: title.trim(),
          description: description.trim(),
          driveUrl: driveCheck.normalizedUrl,
          url: finalUrl,
          storagePath: finalStoragePath,
        });
        showToast("success", "படத்தொகுப்பு வெற்றிகரமாகச் சேமிக்கப்பட்டது!");
      }

      const fresh = await getPhotos();
      setPhotos(fresh);
      cancelEdit();
    } catch (err: any) {
      console.error("[Photos Save Error]", err);
      showToast("error", err?.message || "சேமிக்க முடியவில்லை. மீண்டும் முயலவும்.");
    } finally {
      setBusy(false);
      setProgress(0);
      setStatus("");
    }
  };

  const handleDelete = async (p: Photo) => {
    if (!confirm(`"${p.title}" படத்தொகுப்பை நிச்சயமாக நீக்க விரும்புகிறீர்களா?`)) {
      return;
    }
    try {
      if (p.storagePath || p.url) {
        await deleteFile(p.storagePath || p.url).catch(() => {});
      }
      await deletePhoto(p.id);
      setPhotos(photos.filter((x) => x.id !== p.id));
      if (editingAlbum?.id === p.id) {
        cancelEdit();
      }
      showToast("success", "படத்தொகுப்பு நீக்கப்பட்டது.");
    } catch {
      showToast("error", "நீக்க முடியவில்லை.");
    }
  };

  const canSubmit = !busy && Boolean(title.trim()) && Boolean(driveUrl.trim()) && (editingAlbum ? Boolean(coverFile || coverPreview) : Boolean(coverFile));

  return (
    <div className="space-y-8 font-tamil">
      {/* ── Main Upload & Edit Form Card ── */}
      <div
        ref={formRef}
        className="relative p-5 sm:p-7 rounded-[24px] bg-white/98 border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden"
      >
        <div className="absolute inset-2.5 rounded-[18px] border border-slate-100 pointer-events-none" />

        {/* ── Photo Management Header with Subtle Blue Gradient & Vector Art ── */}
        <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#F0F7FF] via-[#F8FBFF] to-[#F3F7FE] border border-[#DCEBFF] mb-6 flex items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#DCEBFF] border border-[#BBD8FA] flex items-center justify-center flex-shrink-0 text-[#4D8FE8] shadow-2xs">
                <ImageIcon className="h-5 w-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] font-serif-tamil">
                {editingAlbum ? "புகைப்படங்கள் திருத்தம்" : "புகைப்படங்கள் மேலாண்மை"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed pt-0.5">
              நிறைவடைந்த ஒவ்வொரு நிகழ்விற்கும் ஒரு அட்டைப்படத்தை பதிவேற்றி, முழு படத்தொகுப்புக்கான Google Drive இணைப்பை வழங்கவும்.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Flat Vector Photography Illustration (Desktop Only) */}
            <div className="hidden sm:block">
              <PhotosHeaderIllustration className="w-28 sm:w-32 h-16 sm:h-20" />
            </div>

            {editingAlbum && (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#4D8FE8] text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              >
                <X className="h-3.5 w-3.5" />
                <span>ரத்து</span>
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* நிகழ்வின் பெயர் */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                <span>நிகழ்வின் பெயர்</span>
                <span className="text-[#4D8FE8] font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="உதாரணம்: தமிழ் தின விழா 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#0F172A] text-xs sm:text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#4D8FE8] focus:ring-2 focus:ring-[#4D8FE8]/15 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Google Drive படத்தொகுப்பு இணைப்பு */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                <span>Google Drive படத்தொகுப்பு இணைப்பு</span>
                <span className="text-[#4D8FE8] font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  value={driveUrl}
                  onChange={(e) => handleDriveUrlChange(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className={cn(
                    "w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border text-[#0F172A] text-xs sm:text-sm font-medium focus:outline-none transition-all shadow-2xs",
                    urlError
                      ? "border-rose-300 focus:border-rose-500 bg-rose-50/20"
                      : "border-slate-200 focus:border-[#4D8FE8] focus:ring-2 focus:ring-[#4D8FE8]/15"
                  )}
                />
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4D8FE8] pointer-events-none" />
              </div>
              {urlError ? (
                <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  <span>{urlError}</span>
                </p>
              ) : (
                <p className="text-[10.5px] text-slate-500 font-medium">
                  முழு புகைப்படங்கள் அடங்கிய Google Drive கோப்புறை இணைப்பை உள்ளிடவும்.
                </p>
              )}
            </div>
          </div>

          {/* சிறு விளக்கம் */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0F172A]">
              சிறு விளக்கம் <span className="text-slate-400 font-normal text-[11px]">(விருப்பத்தேர்வு)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="நிகழ்வின் சுருக்கமான விளக்கம்…"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#0F172A] text-xs sm:text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#4D8FE8] focus:ring-2 focus:ring-[#4D8FE8]/15 resize-none transition-all shadow-2xs"
            />
          </div>

          {/* ── Cover Image Upload Area Redesign ── */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                <span>அட்டைப்படம் தேர்வு</span>
                {!editingAlbum && <span className="text-[#4D8FE8] font-bold">*</span>}
              </label>
              <span className="text-[11px] text-[#4D8FE8] font-bold bg-[#EAF4FF] px-2 py-0.5 rounded-md border border-[#DCEBFF]">
                JPG • PNG • WebP
              </span>
            </div>

            <input
              type="file"
              id="cover-upload-input"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleCoverChange}
              className="sr-only"
            />

            {!coverFile && !coverPreview ? (
              /* Drag & Drop Upload Zone with Decorative Polaroids & Sticky Note */
              <label
                htmlFor="cover-upload-input"
                className="group relative flex flex-col items-center justify-center p-6 sm:p-7 rounded-2xl border-2 border-dashed border-[#BBD8FA] bg-[#F2F7FD]/80 hover:border-[#4D8FE8] hover:bg-[#EBF3FC] transition-all duration-200 cursor-pointer text-center select-none overflow-hidden outline-none focus-within:ring-2 focus-within:ring-[#4D8FE8]"
              >
                {/* Decorative Bottom-Left Faded Mini Polaroids */}
                <div className="absolute -bottom-2 -left-2 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity hidden sm:block">
                  <div className="w-14 h-16 rounded-md bg-white border border-slate-200 p-1 shadow-2xs rotate-[-12deg]">
                    <div className="w-full h-10 rounded bg-[#BAE6FD]" />
                  </div>
                </div>

                {/* Decorative Bottom-Right Cute Sticky Note */}
                <div className="absolute bottom-2.5 right-3 pointer-events-none hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF9EB] border border-[#FDE68A] text-[#B45309] text-[10.5px] font-bold shadow-2xs rotate-[-2deg] group-hover:scale-105 transition-transform">
                  <span>நினைவுகளை பகிர்வோம்! 📸</span>
                </div>

                <div className="h-12 w-12 rounded-2xl bg-[#EAF4FF] border border-[#DCEBFF] text-[#4D8FE8] group-hover:bg-[#4D8FE8] group-hover:text-white group-hover:scale-105 group-hover:shadow-[0_4px_16px_rgba(77,143,232,0.25)] transition-all duration-200 flex items-center justify-center mb-2.5">
                  <UploadCloud className="h-6 w-6 transition-transform duration-200 group-hover:-translate-y-0.5" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#4D8FE8] transition-colors leading-snug">
                  படத்தை இங்கே இழுக்கவும் அல்லது தேர்வு செய்யவும்
                </p>
                <p className="text-[10.5px] sm:text-[11px] font-semibold text-[#4D8FE8]/85 tracking-wider uppercase mt-1">
                  JPG • PNG • WebP
                </p>
              </label>
            ) : (
              /* Selected Cover Image Preview Card */
              <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs transition-all duration-200">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="relative h-12 w-16 sm:h-14 sm:w-20 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100 shadow-2xs">
                    <img
                      src={coverPreview || ""}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="font-bold text-xs sm:text-sm text-[#0F172A] truncate max-w-[200px] sm:max-w-[340px]">
                      {coverFile ? coverFile.name : (editingAlbum?.title || "அட்டைப்படம்")}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {compressionInfo ? (
                        <span className="text-[10.5px] font-bold text-emerald-600">
                          {formatBytes(compressionInfo.compressedSize)}
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-semibold text-[#4D8FE8]">
                          அட்டைப்படம்
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        • {coverFile ? (coverFile.name.split(".").pop()?.toUpperCase() || "IMAGE") : "SAVED"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <label
                    htmlFor="cover-upload-input"
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#4D8FE8] hover:bg-[#EAF4FF] border border-[#DCEBFF] transition-colors cursor-pointer"
                    title="வேறு படத்தை தேர்வு செய்"
                  >
                    மாற்று
                  </label>
                  <button
                    type="button"
                    onClick={removeCoverPhoto}
                    aria-label="அட்டைப்படத்தை நீக்குக"
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center cursor-pointer"
                    title="நீக்குக"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {busy && (
            <div className="space-y-1.5 pt-1 max-w-md mx-auto">
              <div className="flex justify-between text-xs font-bold text-[#4D8FE8]">
                <span>{status || "செயலாக்கப்படுகிறது…"}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#EAF4FF] overflow-hidden">
                <div
                  className="h-full bg-[#4D8FE8] transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Save Button: Modern Blue -> Blue-Violet Gradient (#3D9BF2 → #6C63F5) with Arrow ── */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="group inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#3D9BF2] via-[#5289F4] to-[#6C63F5] hover:from-[#2F8AE0] hover:to-[#5B51E8] disabled:opacity-45 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(61,155,242,0.25)] hover:shadow-[0_6px_22px_rgba(108,99,245,0.35)] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>சேமிக்கிறது...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>சேமி</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-85 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>

            {editingAlbum && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
              >
                ரத்து செய்யவும்
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Photo Albums Collapsible Accordion ── */}
      <div
        ref={albumAccordionRef}
        className={cn(
          "relative rounded-[24px] border transition-all duration-300 overflow-hidden font-tamil",
          isListExpanded
            ? "bg-white/98 border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            : "bg-white/95 border-slate-200/80 hover:border-[#4D8FE8]/40 hover:bg-white"
        )}
      >
        {/* Clickable Accordion Header */}
        <button
          type="button"
          onClick={toggleListAccordion}
          className="w-full flex items-center justify-between p-4.5 sm:p-5 text-left cursor-pointer select-none transition-colors"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div className="h-9 w-9 rounded-xl bg-[#EAF4FF] border border-[#DCEBFF] flex items-center justify-center flex-shrink-0 text-[#4D8FE8] shadow-2xs">
              <Images className="h-4.5 w-4.5" />
            </div>
            <h2 className="font-bold text-[#0F172A] text-base sm:text-lg font-serif-tamil">
              பதிவேற்றப்பட்ட படத்தொகுப்புகள்
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF4FF] text-[#4D8FE8] border border-[#DCEBFF]">
              {photos.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#4D8FE8] font-bold hidden sm:inline">
              {isListExpanded ? "மறைக்கவும்" : "பார்க்கவும்"}
            </span>
            <div
              className={cn(
                "h-8 w-8 rounded-lg bg-[#EAF4FF] flex items-center justify-center transition-transform duration-300 text-[#4D8FE8]",
                isListExpanded ? "rotate-180 bg-[#4D8FE8] text-white" : "text-[#4D8FE8]"
              )}
            >
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </button>

        {/* Collapsible Content */}
        <AnimatePresence initial={false}>
          {isListExpanded && (
            <motion.div
              key="photos-accordion-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_EXPO }}
              className="overflow-hidden"
            >
              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100">
                {photos.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl bg-white border border-slate-200/80 my-2">
                    <Images className="h-10 w-10 text-[#4D8FE8]/40 mx-auto mb-2.5" />
                    <h3 className="font-bold text-[#0F172A] text-sm mb-1">
                      இதுவரை எந்த புகைப்படத் தொகுப்பும் சேர்க்கப்படவில்லை
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      முதல் நிகழ்விற்கான அட்டைப்படம் மற்றும் Google Drive இணைப்புடன் மேலே உள்ள படிவத்தில் சேர்க்கவும்.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[540px] overflow-y-auto pr-1 sm:pr-2 space-y-3 custom-scrollbar my-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {photos.map((p, idx) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.3) }}
                          className="group relative flex flex-col rounded-2xl overflow-hidden bg-white border border-blue-100/90 hover:border-[#4D8FE8]/45 hover:shadow-md transition-all duration-200"
                        >
                          {/* Cover Photo */}
                          <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                            <img
                              src={p.url}
                              alt={p.title}
                              loading="lazy"
                              className="h-full w-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                            />

                            {/* Action Buttons */}
                            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => startEdit(p)}
                                className="p-1.5 rounded-lg bg-white/95 backdrop-blur-xs text-slate-700 hover:text-[#4D8FE8] hover:bg-white border border-slate-200 shadow-xs cursor-pointer transition-all duration-200"
                                title="திருத்தவும்"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(p)}
                                className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-xs cursor-pointer transition-all duration-200"
                                title="நீக்கவும்"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="flex-1 flex flex-col justify-between p-4 space-y-3">
                            <div>
                              <h3 className="font-serif-tamil font-bold text-[#0F172A] text-sm sm:text-base leading-snug line-clamp-2">
                                {p.title}
                              </h3>
                              {p.description && (
                                <p className="text-slate-600 text-xs mt-1.5 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                                  {p.description}
                                </p>
                              )}
                            </div>

                            {/* Google Drive Link Button */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              {p.driveUrl ? (
                                <a
                                  href={p.driveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#4D8FE8] to-[#6C63F5] hover:from-[#3D9BF2] hover:to-[#5B51E8] text-white text-xs font-bold transition-all shadow-2xs"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  <span>அனைத்துப் படங்களையும் காண்க</span>
                                </a>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">
                                  Google Drive இணைப்பு இல்லை
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => startEdit(p)}
                                className="text-xs font-bold text-slate-600 hover:text-[#4D8FE8] transition-colors cursor-pointer"
                              >
                                திருத்தவும்
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EventsHeaderIllustration({ mode, className }: { mode: "நிகழ்வு" | "போட்டி"; className?: string }) {
  const isComp = mode === "போட்டி";
  return (
    <motion.svg
      viewBox="0 0 145 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none pointer-events-none drop-shadow-2xs", className)}
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Background Pastel Glows */}
      <circle cx="72" cy="44" r="38" fill={isComp ? "#FFF4E5" : "#FFEAEA"} fillOpacity="0.85" />
      <circle cx="112" cy="28" r="18" fill={isComp ? "#FEF3C7" : "#FFE4E6"} fillOpacity="0.7" />
      <circle cx="28" cy="32" r="15" fill={isComp ? "#FFEDD5" : "#FFF1F2"} fillOpacity="0.6" />

      {/* Confetti & Celebration Stars */}
      <path d="M120 14L121.5 17.5L125 19L121.5 20.5L120 24L118.5 20.5L115 19L118.5 17.5L120 14Z" fill="#FBBF24" />
      <path d="M16 20L17 22.5L19.5 23.5L17 24.5L16 27L15 24.5L12.5 23.5L15 22.5L16 20Z" fill={isComp ? "#F97316" : "#E85D5D"} />
      <circle cx="128" cy="38" r="2.5" fill="#EC4899" />
      <circle cx="18" cy="52" r="2" fill="#F59E0B" />
      <rect x="108" y="60" width="4" height="4" rx="1" fill="#3B82F6" transform="rotate(25 110 62)" />
      <rect x="26" y="14" width="4" height="4" rx="1" fill="#10B981" transform="rotate(-20 28 16)" />

      <AnimatePresence mode="wait">
        {isComp ? (
          /* ── Competition Mode: Trophy + Medal + Certificate + Stars ── */
          <motion.g
            key="comp-illustration"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
          >
            {/* Certificate / Award Card (Back Right) */}
            <g transform="rotate(10 95 38)">
              <rect x="76" y="16" width="38" height="48" rx="4" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="1.2" />
              <rect x="80" y="21" width="30" height="4" rx="1" fill="#FDE68A" />
              <rect x="80" y="28" width="22" height="2.5" rx="1" fill="#E2E8F0" />
              <rect x="80" y="33" width="26" height="2.5" rx="1" fill="#E2E8F0" />
              <rect x="80" y="38" width="18" height="2.5" rx="1" fill="#E2E8F0" />
              <circle cx="95" cy="50" r="4.5" fill="#F59E0B" />
              <path d="M93 54L91 60L95 58L99 60L97 54" fill="#D97706" />
            </g>

            {/* Shiny Gold Medal (Back Left) */}
            <g transform="rotate(-8 40 40)">
              {/* Ribbon */}
              <path d="M34 16L40 32L36 32L30 16Z" fill="#3B82F6" />
              <path d="M46 16L40 32L44 32L50 16Z" fill="#EF4444" />
              <circle cx="40" cy="38" r="10" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
              <circle cx="40" cy="38" r="7.5" fill="#FDE047" />
              <path d="M40 32.5L41.5 35.5L44.5 36L42.2 38.2L42.8 41.5L40 39.8L37.2 41.5L37.8 38.2L35.5 36L38.5 35.5L40 32.5Z" fill="#D97706" />
            </g>

            {/* Central Golden Trophy (Foreground) */}
            <g transform="translate(48, 20)">
              {/* Base */}
              <rect x="14" y="44" width="22" height="6" rx="2" fill="#78350F" />
              <rect x="17" y="39" width="16" height="5" rx="1" fill="#B45309" />
              <rect x="22" y="32" width="6" height="8" rx="1" fill="#D97706" />
              
              {/* Trophy Cup */}
              <path d="M12 8H38V22C38 29.1797 32.1797 34 25 34C17.8203 34 12 29.1797 12 22V8Z" fill="#FBBF24" />
              <path d="M15 11H35V21C35 26.5 30.5 30.5 25 30.5C19.5 30.5 15 26.5 15 21V11Z" fill="#FDE047" />
              {/* Cup handles */}
              <path d="M12 12C6 12 6 22 12 22" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
              <path d="M38 12C44 12 44 22 38 22" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
              {/* Star on trophy */}
              <path d="M25 15L26.2 18L29.5 18.3L27 20.4L27.7 23.5L25 21.8L22.3 23.5L23 20.4L20.5 18.3L23.8 18L25 15Z" fill="#D97706" />
            </g>
          </motion.g>
        ) : (
          /* ── Event Mode: Calendar + Clock + Party Flag Banner ── */
          <motion.g
            key="event-illustration"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
          >
            {/* Clock Card (Back Left) */}
            <g transform="rotate(-12 42 42)">
              <rect x="24" y="20" width="36" height="42" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
              <circle cx="42" cy="40" r="11" fill="#FFE4E6" />
              <circle cx="42" cy="40" r="9" fill="#FFFFFF" stroke="#E85D5D" strokeWidth="1" />
              <line x1="42" y1="40" x2="42" y2="34" stroke="#E85D5D" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="42" y1="40" x2="46" y2="40" stroke="#E85D5D" strokeWidth="1.2" strokeLinecap="round" />
            </g>

            {/* Party Flag Banner (Back Right) */}
            <g transform="rotate(10 94 36)">
              <rect x="74" y="16" width="38" height="46" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
              <path d="M78 24L86 34L94 24L102 34L110 24" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <polygon points="80,25 86,33 92,25" fill="#FBBF24" />
              <polygon points="96,25 102,33 108,25" fill="#38BDF8" />
              <circle cx="93" cy="46" r="3" fill="#EC4899" />
              <circle cx="83" cy="50" r="2" fill="#10B981" />
            </g>

            {/* Central Calendar Card (Foreground) */}
            <g transform="translate(48, 22)">
              <rect x="2" y="8" width="46" height="42" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />
              {/* Calendar Red/Coral Header */}
              <path d="M2 14C2 10.6863 4.68629 8 8 8H42C45.3137 8 48 10.6863 48 14V19H2V14Z" fill="#E85D5D" />
              {/* Binder rings */}
              <rect x="10" y="4" width="4" height="8" rx="2" fill="#94A3B8" />
              <rect x="23" y="4" width="4" height="8" rx="2" fill="#94A3B8" />
              <rect x="36" y="4" width="4" height="8" rx="2" fill="#94A3B8" />
              {/* Calendar Date Number / Center Dot */}
              <rect x="8" y="24" width="34" height="20" rx="3" fill="#FFF1F2" />
              <circle cx="25" cy="34" r="6.5" fill="#E85D5D" />
              <path d="M23 34.5L24.5 32H26.5L25 34.5H27V36H23V34.5Z" fill="#FFFFFF" />
            </g>
          </motion.g>
        )}
      </AnimatePresence>
    </motion.svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. Events Tab Component (நிகழ்வுகள் & போட்டிகள் + AI Generator)
───────────────────────────────────────────────────────────────────────────── */

function EventsTab({
  events, setEvents, showToast,
}: {
  events: SchoolEvent[];
  setEvents: (e: SchoolEvent[]) => void;
  showToast: (t: "success" | "error" | "info", m: string) => void;
}) {
  const formRef = useRef<HTMLDivElement>(null);
  const eventsAccordionRef = useRef<HTMLDivElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const [editingEvent,    setEditingEvent]    = useState<SchoolEvent | null>(null);
  const [isListExpanded,  setIsListExpanded]  = useState(false);

  // Form Fields
  const [eventType,       setEventType]       = useState<"நிகழ்வு" | "போட்டி">("நிகழ்வு");
  const [title,           setTitle]           = useState("");
  const [date,            setDate]            = useState("");
  const [time,            setTime]            = useState("");
  const [venue,           setVenue]           = useState("");
  const [coverFile,       setCoverFile]       = useState<File | null>(null);
  const [coverPreview,    setCoverPreview]    = useState<string | null>(null);
  const [compression,     setCompression]     = useState<CompressionResult | null>(null);
  const [isDraggingCover, setIsDraggingCover] = useState(false);

  // AI Welcome Generator State
  const [aiGeneratedText, setAiGeneratedText] = useState<string>("");
  const [aiGenerating,    setAiGenerating]    = useState(false);
  const [isEditingAiText, setIsEditingAiText] = useState(false);
  const [copiedAi,        setCopiedAi]        = useState(false);

  const [busy,            setBusy]            = useState(false);
  const [progress,        setProgress]        = useState(0);
  const [status,          setStatus]          = useState("");

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      showToast("error", "சரியான படக் கோப்பைத் தேர்வு செய்யவும் (JPG, PNG, WebP).");
      return;
    }
    setStatus("படம் தயாராகிறது…");
    try {
      const r = await compressFile(f);
      setCompression(r);
      setCoverFile(new File([r.file], f.name, { type: f.type }));
    } catch {
      setCompression({ file: f, originalSize: f.size, compressedSize: f.size });
      setCoverFile(f);
    }
    setCoverPreview(URL.createObjectURL(f));
    setStatus("");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    if (!droppedFile.type.startsWith("image/")) {
      showToast("error", "சரியான படக் கோப்பைத் தேர்வு செய்யவும் (JPG, PNG, WebP).");
      return;
    }
    setStatus("படம் தயாராகிறது…");
    try {
      const r = await compressFile(droppedFile);
      setCompression(r);
      setCoverFile(new File([r.file], droppedFile.name, { type: droppedFile.type }));
    } catch {
      setCompression({ file: droppedFile, originalSize: droppedFile.size, compressedSize: droppedFile.size });
      setCoverFile(droppedFile);
    }
    setCoverPreview(URL.createObjectURL(droppedFile));
    setStatus("");
  };

  const removeCoverPhoto = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setCompression(null);
    if (coverFileInputRef.current) coverFileInputRef.current.value = "";
  };

  const resetForm = () => {
    setEditingEvent(null);
    setEventType("நிகழ்வு");
    setTitle("");
    setDate("");
    setTime("");
    setVenue("");
    setCoverFile(null);
    setCoverPreview(null);
    setCompression(null);
    setAiGeneratedText("");
    setIsEditingAiText(false);
    setProgress(0);
    setStatus("");
    if (coverFileInputRef.current) coverFileInputRef.current.value = "";
  };

  const startEdit = (evt: SchoolEvent) => {
    setEditingEvent(evt);
    setEventType(evt.eventType === "போட்டி" || evt.category === "போட்டி" ? "போட்டி" : "நிகழ்வு");
    setTitle(evt.title || "");

    let dateStr = "";
    if (evt.eventDate?.toDate) {
      dateStr = evt.eventDate.toDate().toISOString().split("T")[0];
    } else if (evt.eventDate?.seconds) {
      dateStr = new Date(evt.eventDate.seconds * 1000).toISOString().split("T")[0];
    }
    setDate(dateStr);

    setTime(evt.time || "");
    setVenue(evt.location || "");
    setCoverFile(null);
    setCoverPreview(evt.photoUrls && evt.photoUrls.length > 0 ? evt.photoUrls[0] : null);
    setCompression(null);
    setAiGeneratedText(evt.description || "");
    setIsEditingAiText(false);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleListAccordion = () => {
    setIsListExpanded((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          eventsAccordionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 100);
      }
      return next;
    });
  };

  const handleGenerateAiContent = async () => {
    if (!title.trim() || !date) {
      showToast("error", "முதலில் தலைப்பு மற்றும் நடைபெறும் தேதியை உள்ளிடவும்.");
      return;
    }

    setAiGenerating(true);
    try {
      const data = await generateEventWelcomeContent({
        type: eventType,
        title: title.trim(),
        date: date,
        time: time.trim(),
        venue: venue.trim(),
      });

      if (!data.success || !data.content) {
        if (data.error && data.error.includes("API key")) {
          showToast("error", "AI சேவை தற்போது இணைக்கப்படவில்லை.");
        } else {
          showToast("error", data.error || "வரவேற்பை உருவாக்க முடியவில்லை. மீண்டும் முயற்சி செய்யவும்.");
        }
        return;
      }

      setAiGeneratedText(data.content);
      setIsEditingAiText(false);
      showToast("success", "மாணவர்களுக்கான வரவேற்பு வெற்றிகரமாக உருவாக்கப்பட்டது!");
    } catch (err: any) {
      console.error("[AI Generation Error]", err);
      showToast("error", "வரவேற்பை உருவாக்க முடியவில்லை. மீண்டும் முயற்சி செய்யவும்.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCopyAiText = async () => {
    if (!aiGeneratedText) return;
    try {
      await navigator.clipboard.writeText(aiGeneratedText);
      setCopiedAi(true);
      showToast("success", "வரவேற்பு உரை நகலெடுக்கப்பட்டது!");
      setTimeout(() => setCopiedAi(false), 2000);
    } catch {
      showToast("error", "நகலெடுக்க முடியவில்லை.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast("error", "தலைப்பை உள்ளிடவும்.");
      return;
    }
    if (!date) {
      showToast("error", "நடைபெறும் தேதியைத் தேர்வு செய்யவும்.");
      return;
    }
    if (!aiGeneratedText.trim()) {
      showToast("error", "முதலில் 'AI வரவேற்பை உருவாக்கு' பொத்தானை அழுத்தவும்.");
      return;
    }

    setBusy(true);
    setProgress(0);
    try {
      const photoUrls: string[] = editingEvent?.photoUrls ? [...editingEvent.photoUrls] : [];

      if (coverFile) {
        setStatus("அட்டைப்படம் பதிவேற்றுகிறோம்…");
        const ext = coverFile.name.split(".").pop() ?? "jpg";
        const fname = `event-cover-${Date.now()}.${ext}`;
        const spath = `events/${fname}`;
        const { url } = await uploadFile(spath, coverFile, (p) => setProgress(p));
        photoUrls[0] = url;
      }

      const eventDateObj = new Date(date);
      const eventTimestamp = Timestamp.fromDate(eventDateObj);

      const eventPayload = {
        title: title.trim(),
        description: aiGeneratedText.trim(),
        location: venue.trim(),
        time: time.trim(),
        category: eventType,
        eventType: eventType,
        eventDate: eventTimestamp,
        photoUrls,
      };

      if (editingEvent) {
        setStatus("புதுப்பிக்கப்படுகிறது…");
        await updateEvent(editingEvent.id, eventPayload);
        showToast("success", "மாற்றங்கள் வெற்றிகரமாகச் சேமிக்கப்பட்டன!");
      } else {
        setStatus("வெளியிடப்படுகிறது…");
        await addEvent(eventPayload);
        showToast("success", "அறிவிப்பு வெற்றிகரமாக வெளியிடப்பட்டது!");
      }

      const fresh = await getEvents();
      setEvents(fresh);
      resetForm();
    } catch (err: any) {
      console.error("[Event Save Error]", err);
      showToast("error", err?.message || "சேமிக்க முடியவில்லை. மீண்டும் முயலவும்.");
    } finally {
      setBusy(false);
      setProgress(0);
      setStatus("");
    }
  };

  const handleDelete = async (evt: SchoolEvent) => {
    if (!confirm(`"${evt.title}" அறிவிப்பை நிச்சயமாக நீக்க விரும்புகிறீர்களா?`)) return;
    try {
      await deleteEvent(evt.id);
      setEvents(events.filter((x) => x.id !== evt.id));
      if (editingEvent?.id === evt.id) resetForm();
      showToast("success", "அறிவிப்பு நீக்கப்பட்டது.");
    } catch {
      showToast("error", "அறிவிப்பை நீக்க முடியவில்லை.");
    }
  };

  const canSubmit = !busy && Boolean(title.trim()) && Boolean(date) && Boolean(aiGeneratedText.trim());
  const hasFormContent = Boolean(title.trim() || date || time || venue || coverFile || aiGeneratedText.trim() || editingEvent);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  return (
    <div className="space-y-8 font-tamil">
      {/* ── Main Event Creation & Editing Form Card ── */}
      <div
        ref={formRef}
        className="relative p-5 sm:p-7 rounded-[24px] bg-white/98 border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden"
      >
        <div className="absolute inset-2.5 rounded-[18px] border border-slate-100 pointer-events-none" />

        {/* ── Header with Subtle Coral/Peach Gradient Background & Vector Art ── */}
        <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FFF0F0] via-[#FFF8F5] to-[#FFF0DF] border border-[#FFD8D8] mb-6 flex items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#FFE4E6] border border-[#FFCCD2] flex items-center justify-center flex-shrink-0 text-[#EB6B67] shadow-2xs">
                <Calendar className="h-5 w-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] font-serif-tamil">
                {editingEvent ? "அறிவிப்பு திருத்தம்" : "நிகழ்வுகள் & போட்டிகள் மேலாண்மை"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed pt-0.5">
              மாணவர்களுக்கான புதிய நிகழ்வுகள் மற்றும் போட்டிகளை உருவாக்கி, தமிழ் வாழ்த்துரையுடன் அறிவிக்கலாம்.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Flat Vector Events/Competition Illustration (Desktop Only) */}
            <div className="hidden sm:block">
              <EventsHeaderIllustration mode={eventType} className="w-28 sm:w-32 h-16 sm:h-20" />
            </div>

            {editingEvent && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#EB6B67] text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              >
                <X className="h-3.5 w-3.5" />
                <span>ரத்து</span>
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          {/* ── Event vs Competition Selector (Pill Style) ── */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
              <span>வகை தேர்வு</span>
              <span className="text-[#EB6B67] font-bold">*</span>
            </label>

            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/90 gap-2">
              <button
                type="button"
                onClick={() => setEventType("நிகழ்வு")}
                className={cn(
                  "inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none",
                  eventType === "நிகழ்வு"
                    ? "bg-white text-[#EB6B67] shadow-sm border border-[#FFCCD2]"
                    : "text-slate-600 hover:text-[#0F172A] hover:bg-white/50"
                )}
              >
                <Calendar className={cn("h-4 w-4 transition-colors", eventType === "நிகழ்வு" ? "text-[#EB6B67]" : "text-slate-400")} />
                <span>நிகழ்வு (Event)</span>
              </button>

              <button
                type="button"
                onClick={() => setEventType("போட்டி")}
                className={cn(
                  "inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none",
                  eventType === "போட்டி"
                    ? "bg-white text-[#E98319] shadow-sm border border-[#FFE0BD]"
                    : "text-slate-600 hover:text-[#0F172A] hover:bg-white/50"
                )}
              >
                <Trophy className={cn("h-4 w-4 transition-colors", eventType === "போட்டி" ? "text-[#E98319]" : "text-slate-400")} />
                <span>போட்டி (Competition)</span>
              </button>
            </div>
          </div>

          {/* ── Title ── */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
              <span>{eventType === "போட்டி" ? "போட்டியின் பெயர் / தலைப்பு" : "நிகழ்வின் பெயர் / தலைப்பு"}</span>
              <span className="text-[#EB6B67] font-bold">*</span>
            </label>
            <div className="relative">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={eventType === "போட்டி" ? "உதாரணம்: மாநில அளவிலான திருக்குறள் மனனப் போட்டி 2026" : "உதாரணம்: தமிழர் திருநாள் பொங்கல் விழா 2026"}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#0F172A] text-xs sm:text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#7B75F5] focus:ring-2 focus:ring-[#7B75F5]/15 transition-all shadow-2xs"
              />
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B75F5] pointer-events-none" />
            </div>
          </div>

          {/* ── Date, Time, Venue Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {/* நடைபெறும் தேதி */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                <span>நடைபெறும் தேதி</span>
                <span className="text-[#EB6B67] font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#0F172A] text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#EB6B67] focus:ring-2 focus:ring-[#EB6B67]/15 transition-all shadow-2xs cursor-pointer"
                />
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#EB6B67] pointer-events-none" />
              </div>
              {date && (
                <span className="text-[11px] text-[#EB6B67] font-semibold block">
                  {formatTamilDateDisplay(date)}
                </span>
              )}
            </div>

            {/* நடைபெறும் நேரம் */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                <span>நடைபெறும் நேரம்</span>
                <span className="text-slate-400 font-normal text-[11px]">(விருப்பத்தேர்வு)</span>
              </label>
              <div className="relative">
                <input
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="உதாரணம்: காலை 9:00 மணி"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#0F172A] text-xs sm:text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#378BE7] focus:ring-2 focus:ring-[#378BE7]/15 transition-all shadow-2xs"
                />
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#378BE7] pointer-events-none" />
              </div>
            </div>

            {/* நடைபெறும் இடம் */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                <span>நடைபெறும் இடம்</span>
                <span className="text-slate-400 font-normal text-[11px]">(விருப்பத்தேர்வு)</span>
              </label>
              <div className="relative">
                <input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="உதாரணம்: பள்ளி பிரதான அரங்கம்"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#0F172A] text-xs sm:text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#F2A34A] focus:ring-2 focus:ring-[#F2A34A]/15 transition-all shadow-2xs"
                />
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#F2A34A] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ── Cover-Image Upload Redesign: Compact Drag & Drop Zone ── */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                <span>அட்டைப்படம் தேர்வு</span>
                <span className="text-slate-400 font-normal text-[11px]">(விருப்பத்தேர்வு)</span>
              </label>
              <span className="text-[11px] font-bold bg-[#FFF0DF] text-[#E98319] px-2 py-0.5 rounded-md border border-[#FFE0BD]">
                JPG • PNG • WebP
              </span>
            </div>

            <input
              ref={coverFileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleCoverChange}
              className="sr-only"
            />

            {!coverFile && !coverPreview ? (
              /* Drag & Drop Upload Zone */
              <div
                onClick={() => coverFileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    coverFileInputRef.current?.click();
                  }
                }}
                className={cn(
                  "group relative flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#EB6B67]",
                  isDraggingCover
                    ? "border-[#EB6B67] bg-[#FFF0F0] shadow-md scale-[1.008]"
                    : "border-[#FFC8C8] bg-[#FFF8F5]/85 hover:border-[#EB6B67] hover:bg-[#FFF0F0] hover:shadow-2xs"
                )}
              >
                {/* Decorative Bottom-Left Mini Polaroid / Event Card */}
                <div className="absolute -bottom-2 -left-2 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity hidden sm:block">
                  <div className="w-13 h-15 rounded-md bg-white border border-slate-200 p-1 shadow-2xs rotate-[-10deg]">
                    <div className="w-full h-9 rounded bg-[#FFE4E6]" />
                  </div>
                </div>

                {/* Decorative Bottom-Right Cute Sticky Note */}
                <div className="absolute bottom-2.5 right-3 pointer-events-none hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF9EB] border border-[#FDE68A] text-[#B45309] text-[10.5px] font-bold shadow-2xs rotate-[-2deg] group-hover:scale-105 transition-transform">
                  <span>{eventType === "போட்டி" ? "வெற்றியை கொண்டாடுவோம்! 🏆" : "நிகழ்வில் இணைவோம்! 🎉"}</span>
                </div>

                <div className="h-11 w-11 rounded-2xl bg-[#FFE4E6] border border-[#FFCCD2] text-[#EB6B67] group-hover:bg-[#EB6B67] group-hover:text-white group-hover:scale-105 group-hover:shadow-[0_4px_16px_rgba(235,107,103,0.25)] transition-all duration-200 flex items-center justify-center mb-2">
                  <UploadCloud className="h-5.5 w-5.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#EB6B67] transition-colors leading-snug">
                  படத்தை இங்கே இழுக்கவும் அல்லது தேர்வு செய்யவும்
                </p>
                <p className="text-[10.5px] sm:text-[11px] font-semibold text-[#EB6B67]/80 tracking-wider uppercase mt-1">
                  JPG • PNG • WebP
                </p>
              </div>
            ) : (
              /* Selected Cover Image Preview Card */
              <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs transition-all duration-200">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="relative h-12 w-16 sm:h-14 sm:w-20 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100 shadow-2xs">
                    <img
                      src={coverPreview || ""}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="font-bold text-xs sm:text-sm text-[#0F172A] truncate max-w-[200px] sm:max-w-[340px]">
                      {coverFile ? coverFile.name : (editingEvent?.title || "அட்டைப்படம்")}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {compression ? (
                        <span className="text-[10.5px] font-bold text-emerald-600">
                          {formatBytes(compression.compressedSize)}
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-semibold text-[#EB6B67]">
                          அட்டைப்படம்
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        • {coverFile ? (coverFile.name.split(".").pop()?.toUpperCase() || "IMAGE") : "SAVED"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#EB6B67] hover:bg-[#FFE4E6] border border-[#FFCCD2] transition-colors cursor-pointer"
                    title="வேறு படத்தை தேர்வு செய்"
                  >
                    மாற்று
                  </button>
                  <button
                    type="button"
                    onClick={removeCoverPhoto}
                    aria-label="அட்டைப்படத்தை நீக்குக"
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center cursor-pointer"
                    title="நீக்குக"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── AI Welcome Generator: Peach -> Orange -> Light Coral Gradient Button ── */}
          <div className="pt-2 flex flex-col items-center justify-center">
            <button
              type="button"
              disabled={aiGenerating}
              onClick={handleGenerateAiContent}
              className="group inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F2A34A] via-[#FB923C] to-[#EB6B67] hover:from-[#E69235] hover:to-[#DC5854] disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(242,163,74,0.25)] hover:shadow-[0_6px_22px_rgba(235,107,103,0.35)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              {aiGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-amber-100" />
                  <span>உருவாக்குகிறது...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-100 transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110" />
                  <span>✨ AI வரவேற்பை உருவாக்கு</span>
                </>
              )}
            </button>
          </div>

          {/* ── AI Welcome Message Preview Card ── */}
          {aiGeneratedText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative p-5 rounded-2xl bg-gradient-to-br from-white via-[#FFF8F5] to-[#FFF0F0] border border-[#FFD0D0] shadow-[0_4px_20px_rgba(235,107,103,0.08)] space-y-3.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-rose-100">
                <h4 className="font-serif-tamil font-bold text-[#EB6B67] text-sm sm:text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#EB6B67]" />
                  <span>✨ மாணவர்களுக்கான AI வரவேற்புரை</span>
                </h4>

                <div className="flex items-center flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateAiContent}
                    disabled={aiGenerating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-[#EB6B67] border border-[#FFCCD2] text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", aiGenerating && "animate-spin")} />
                    <span>மீண்டும் உருவாக்கவும்</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditingAiText(!isEditingAiText)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-2xs",
                      isEditingAiText
                        ? "bg-[#EB6B67] text-white border-[#EB6B67]"
                        : "bg-white hover:bg-rose-50 text-[#EB6B67] border-[#FFCCD2]"
                    )}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>{isEditingAiText ? "திருத்தி முடிந்தது" : "திருத்தவும்"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyAiText}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-[#EB6B67] border border-[#FFCCD2] text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    {copiedAi ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedAi ? "நகலெடுக்கப்பட்டது!" : "நகலெடுக்கவும்"}</span>
                  </button>
                </div>
              </div>

              {isEditingAiText ? (
                <div className="space-y-1.5">
                  <textarea
                    value={aiGeneratedText}
                    onChange={(e) => setAiGeneratedText(e.target.value)}
                    rows={4}
                    className="w-full p-3.5 rounded-xl bg-white border border-[#FFCCD2] text-[#0F172A] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#EB6B67]/20 resize-y leading-relaxed font-tamil shadow-inner"
                    placeholder="மாணவர்களுக்கான வரவேற்பை இங்கே திருத்தலாம்..."
                  />
                  <span className="text-[11px] text-[#EB6B67] font-medium block">
                    உரையைத் திருத்திய பின் கீழே உள்ள 'சேமி' பொத்தானை அழுத்தவும்.
                  </span>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-[#0F172A] leading-relaxed whitespace-pre-line font-tamil bg-white/90 p-3.5 rounded-xl border border-rose-100/80 shadow-2xs">
                  {aiGeneratedText}
                </p>
              )}
            </motion.div>
          )}

          {/* Progress Bar */}
          {busy && (
            <div className="space-y-1.5 pt-1 max-w-md mx-auto">
              <div className="flex justify-between text-xs font-bold text-[#EB6B67]">
                <span>{status || "செயலாக்கப்படுகிறது…"}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#FFE8E8] overflow-hidden">
                <div
                  className="h-full bg-[#EB6B67] transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Save & Cancel Actions: Modern Blue -> Blue-Violet Gradient (#3D9BF2 → #6C63F5) with Arrow ── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#3D9BF2] via-[#5289F4] to-[#6C63F5] hover:from-[#2F8AE0] hover:to-[#5B51E8] disabled:opacity-45 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(61,155,242,0.25)] hover:shadow-[0_6px_22px_rgba(108,99,245,0.35)] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>சேமிக்கிறது...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>சேமி</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-85 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>

            {hasFormContent && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
                <span>ரத்து</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Events & Competitions Collapsible Accordion ── */}
      <div
        ref={eventsAccordionRef}
        className={cn(
          "relative rounded-[24px] border transition-all duration-300 overflow-hidden font-tamil",
          isListExpanded
            ? "bg-white/98 border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            : "bg-white/95 border-slate-200/80 hover:border-[#EB6B67]/40 hover:bg-white"
        )}
      >
        {/* Clickable Accordion Header */}
        <button
          type="button"
          onClick={toggleListAccordion}
          className="w-full flex items-center justify-between p-4.5 sm:p-5 text-left cursor-pointer select-none transition-colors"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div className="h-9 w-9 rounded-xl bg-[#FFE4E6] border border-[#FFCCD2] flex items-center justify-center flex-shrink-0 text-[#EB6B67] shadow-2xs">
              <CalendarDays className="h-4.5 w-4.5" />
            </div>
            <h2 className="font-bold text-[#0F172A] text-base sm:text-lg font-serif-tamil">
              பதிவேற்றப்பட்ட நிகழ்வுகள் மற்றும் போட்டிகள்
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFE4E6] text-[#EB6B67] border border-[#FFCCD2]">
              {events.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#EB6B67] font-bold hidden sm:inline">
              {isListExpanded ? "மறைக்கவும்" : "பார்க்கவும்"}
            </span>
            <div
              className={cn(
                "h-8 w-8 rounded-lg bg-[#FFE4E6] flex items-center justify-center transition-transform duration-300 text-[#EB6B67]",
                isListExpanded ? "rotate-180 bg-[#EB6B67] text-white" : "text-[#EB6B67]"
              )}
            >
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </button>

        {/* Collapsible Content */}
        <AnimatePresence initial={false}>
          {isListExpanded && (
            <motion.div
              key="events-accordion-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_EXPO }}
              className="overflow-hidden"
            >
              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100">
                {events.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl bg-white border border-slate-200/80 my-2">
                    <Calendar className="h-10 w-10 text-[#EB6B67]/40 mx-auto mb-2.5" />
                    <h3 className="font-bold text-[#0F172A] text-sm mb-1">
                      இதுவரை எந்த அறிவிப்பும் சேர்க்கப்படவில்லை
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      மாணவர்களுக்கான முதல் நிகழ்வு அல்லது போட்டியை மேலே உள்ள படிவத்தைப் பயன்படுத்தி உருவாக்கவும்.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[540px] overflow-y-auto pr-1 sm:pr-2 space-y-3 custom-scrollbar my-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {events.map((evt, idx) => {
                        const evtTime = evt.eventDate?.toDate ? evt.eventDate.toDate().getTime() : (evt.eventDate?.seconds ? evt.eventDate.seconds * 1000 : 0);
                        const isUpcoming = evtTime >= startOfToday;
                        const isComp = evt.eventType === "போட்டி" || evt.category === "போட்டி";
                        const coverImg = evt.photoUrls && evt.photoUrls.length > 0 ? evt.photoUrls[0] : null;

                        return (
                          <motion.div
                            key={evt.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.3) }}
                            className={cn(
                              "group relative flex flex-col rounded-2xl overflow-hidden bg-white border transition-all duration-200",
                              isComp
                                ? "border-amber-100/90 hover:border-[#F2A34A]/50 hover:shadow-md"
                                : "border-rose-100/90 hover:border-[#EB6B67]/50 hover:shadow-md"
                            )}
                          >
                            {/* Cover Image */}
                            <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                              {coverImg ? (
                                <img
                                  src={coverImg}
                                  alt={evt.title}
                                  loading="lazy"
                                  className="h-full w-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                                />
                              ) : (
                                <div className={cn(
                                  "h-full w-full flex items-center justify-center",
                                  isComp
                                    ? "bg-gradient-to-br from-[#FFF8F0] to-[#FFE9CF] text-[#F2A34A]"
                                    : "bg-gradient-to-br from-[#FFF0F0] to-[#FFE4E6] text-[#EB6B67]"
                                )}>
                                  {isComp ? <Trophy className="h-10 w-10 opacity-40" /> : <Calendar className="h-10 w-10 opacity-40" />}
                                </div>
                              )}

                              {/* Badges */}
                              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs text-white",
                                  isComp ? "bg-gradient-to-r from-[#F59E0B] to-[#F97316]" : "bg-gradient-to-r from-[#EB6B67] to-[#F43F5E]"
                                )}>
                                  {isComp ? "போட்டி" : "நிகழ்வு"}
                                </span>
                                {isUpcoming ? (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                                    வரவிருக்கிறது
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-100 backdrop-blur-xs shadow-xs">
                                    நிறைவடைந்தது
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons: Edit & Delete */}
                              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => startEdit(evt)}
                                  className="p-1.5 rounded-lg bg-white/95 backdrop-blur-xs text-slate-700 hover:text-[#EB6B67] hover:bg-white border border-slate-200 shadow-xs cursor-pointer transition-all duration-200"
                                  title="திருத்தவும்"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(evt)}
                                  className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-xs cursor-pointer transition-all duration-200"
                                  title="நீக்கவும்"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="flex-1 flex flex-col justify-between p-4 space-y-3">
                              <div className="space-y-2">
                                <h3 className="font-serif-tamil font-bold text-[#0F172A] text-sm sm:text-base leading-snug line-clamp-2">
                                  {evt.title}
                                </h3>

                                <div className={cn(
                                  "flex items-center flex-wrap gap-x-3 gap-y-1 text-xs font-semibold",
                                  isComp ? "text-[#E98319]" : "text-[#EB6B67]"
                                )}>
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>{formatTamilDateDisplay(evt.eventDate)}</span>
                                  </div>
                                  {evt.time && (
                                    <div className="flex items-center gap-1 text-[#378BE7]">
                                      <Clock className="h-3 w-3 flex-shrink-0" />
                                      <span>{evt.time}</span>
                                    </div>
                                  )}
                                </div>

                                {evt.location && (
                                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                    <MapPin className={cn("h-3.5 w-3.5 flex-shrink-0", isComp ? "text-[#F2A34A]" : "text-[#EB6B67]")} />
                                    <span className="truncate">{evt.location}</span>
                                  </div>
                                )}

                                {evt.description && (
                                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                                    {evt.description}
                                  </p>
                                )}
                              </div>

                              {/* Card Bottom: Edit Action link */}
                              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {isComp ? "போட்டி விவரங்கள்" : "நிகழ்வு விவரங்கள்"}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => startEdit(evt)}
                                  className={cn(
                                    "text-xs font-bold transition-colors cursor-pointer",
                                    isComp ? "text-slate-600 hover:text-[#E98319]" : "text-slate-600 hover:text-[#EB6B67]"
                                  )}
                                >
                                  திருத்தவும்
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


