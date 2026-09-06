"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Camera, X, ChevronLeft, ChevronRight, Maximize2, ExternalLink,
  Images, Sparkles, Grid as GridIcon, List as ListIcon,
  Image as ImageIcon, ArrowRight, Eye,
} from "lucide-react";
import { getPhotos, Photo } from "@/lib/firestore";
import { cn, getAssetPath } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { HomeFooter } from "@/components/site-footer";

/* ─────────────────────────────────────────────────────────────────────────────
   Types & Accent Color Configurations
───────────────────────────────────────────────────────────────────────────── */

interface EventAlbumItem {
  id: string;
  title: string;
  description?: string;
  coverUrl: string;
  driveUrl?: string;
  year: string;
}

const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface AlbumAccentTheme {
  id: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  btnBg: string;
  btnHover: string;
  borderColor: string;
  cardGlow: string;
  iconBg: string;
  iconColor: string;
}

const ALBUM_THEMES: AlbumAccentTheme[] = [
  // 1. Light Blue
  {
    id: "blue",
    badgeBg: "bg-[#EAF4FF]",
    badgeBorder: "border-[#C7E2FE]",
    badgeText: "text-[#2A75D3]",
    btnBg: "bg-gradient-to-r from-[#438BE5] to-[#3B82F6]",
    btnHover: "hover:from-[#327CD9] hover:to-[#2563EB]",
    borderColor: "border-[#D7E8FA]",
    cardGlow: "rgba(67, 139, 229, 0.12)",
    iconBg: "bg-[#EAF4FF]",
    iconColor: "#438BE5",
  },
  // 2. Light Mint
  {
    id: "mint",
    badgeBg: "bg-[#E7F8F1]",
    badgeBorder: "border-[#BDE7D5]",
    badgeText: "text-[#1B8963]",
    btnBg: "bg-gradient-to-r from-[#28A77B] to-[#10B981]",
    btnHover: "hover:from-[#1E956C] hover:to-[#059669]",
    borderColor: "border-[#CEEFE1]",
    cardGlow: "rgba(40, 167, 123, 0.12)",
    iconBg: "bg-[#E7F8F1]",
    iconColor: "#28A77B",
  },
  // 3. Light Peach
  {
    id: "peach",
    badgeBg: "bg-[#FFF1E4]",
    badgeBorder: "border-[#FED7BA]",
    badgeText: "text-[#C86A28]",
    btnBg: "bg-gradient-to-r from-[#EA8B48] to-[#F97316]",
    btnHover: "hover:from-[#D87936] hover:to-[#EA580C]",
    borderColor: "border-[#FCE2CD]",
    cardGlow: "rgba(234, 139, 72, 0.12)",
    iconBg: "bg-[#FFF1E4]",
    iconColor: "#EA8B48",
  },
  // 4. Light Lavender
  {
    id: "lavender",
    badgeBg: "bg-[#F0ECFF]",
    badgeBorder: "border-[#D8CEFD]",
    badgeText: "text-[#6251D4]",
    btnBg: "bg-gradient-to-r from-[#7868E6] to-[#6366F1]",
    btnHover: "hover:from-[#6655D7] hover:to-[#4F46E5]",
    borderColor: "border-[#E3DCFE]",
    cardGlow: "rgba(120, 104, 230, 0.12)",
    iconBg: "bg-[#F0ECFF]",
    iconColor: "#7868E6",
  },
  // 5. Light Pink
  {
    id: "pink",
    badgeBg: "bg-[#FFEAF2]",
    badgeBorder: "border-[#FDCDE2]",
    badgeText: "text-[#C53F72]",
    btnBg: "bg-gradient-to-r from-[#DF6795] to-[#EC4899]",
    btnHover: "hover:from-[#CF5382] hover:to-[#DB2777]",
    borderColor: "border-[#FAD2E2]",
    cardGlow: "rgba(223, 103, 149, 0.12)",
    iconBg: "bg-[#FFEAF2]",
    iconColor: "#DF6795",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Vector Illustrations
───────────────────────────────────────────────────────────────────────────── */

function GalleryHeroIllustration({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 175 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none pointer-events-none drop-shadow-2xs", className)}
      animate={{ y: [0, -3.5, 0] }}
      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Background Pastel Glows */}
      <circle cx="90" cy="55" r="48" fill="#EAF4FF" fillOpacity="0.9" />
      <circle cx="140" cy="36" r="22" fill="#F0ECFF" fillOpacity="0.8" />
      <circle cx="34" cy="40" r="18" fill="#FFEAF2" fillOpacity="0.7" />

      {/* Sparkles */}
      <path d="M148 18L149.5 21.5L153 23L149.5 24.5L148 28L146.5 24.5L143 23L146.5 21.5L148 18Z" fill="#FBBF24" />
      <path d="M22 24L23 26.5L25.5 27.5L23 28.5L22 31L21 28.5L18.5 27.5L21 26.5L22 24Z" fill="#38BDF8" />
      <circle cx="158" cy="52" r="2.5" fill="#EC4899" />
      <circle cx="28" cy="62" r="2" fill="#F59E0B" />

      {/* Polaroid Card 1 (Back Right - Tilted) */}
      <g transform="rotate(14 112 48)">
        <rect x="88" y="16" width="46" height="56" rx="3.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
        <rect x="91.5" y="19.5" width="39" height="38" rx="2" fill="#BAE6FD" />
        {/* Mountain Scenery */}
        <polygon points="93,57 106,37 117,57" fill="#38BDF8" />
        <polygon points="109,57 120,42 129,57" fill="#0284C7" />
        <circle cx="101" cy="28" r="3.5" fill="#FDE047" />
      </g>

      {/* Polaroid Card 2 (Back Left - Counter Tilted) */}
      <g transform="rotate(-12 56 52)">
        <rect x="32" y="20" width="44" height="54" rx="3.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
        <rect x="35.5" y="23.5" width="37" height="36" rx="2" fill="#DDD6FE" />
        {/* Sunset & Hill Scenery */}
        <path d="M35.5 49C42 44 54 45 61 50C67 45 70 46 72.5 49V59.5H35.5V49Z" fill="#8B5CF6" />
        <circle cx="54" cy="35" r="4.5" fill="#FB923C" />
      </g>

      {/* Foreground Main Vector Camera */}
      <g transform="translate(54, 34)">
        {/* Camera Base Body */}
        <rect x="0" y="10" width="66" height="44" rx="9" fill="#4D8FE8" />
        <rect x="0" y="10" width="66" height="12" rx="4" fill="#3B82F6" />

        {/* Top Flash & Viewfinder */}
        <rect x="22" y="3" width="22" height="8" rx="2.5" fill="#2563EB" />
        <rect x="27" y="5" width="12" height="4" rx="1" fill="#93C5FD" />
        <rect x="10" y="5" width="7" height="5" rx="1.5" fill="#F59E0B" />
        <circle cx="55" cy="16" r="3" fill="#EF4444" />

        {/* Outer Lens Rings */}
        <circle cx="33" cy="32" r="16" fill="#1E293B" />
        <circle cx="33" cy="32" r="12.5" fill="#334155" />
        <circle cx="33" cy="32" r="9.5" fill="#60A5FA" />
        <circle cx="33" cy="32" r="6" fill="#1E3A8A" />
        <circle cx="30.5" cy="29.5" r="2.5" fill="#FFFFFF" fillOpacity="0.85" />
      </g>

      {/* Mint Green Leaves at Base */}
      <path d="M124 76C129 67 139 66 143 68C142 77 134 83 124 76Z" fill="#34D399" />
      <path d="M125 75C130 75 134 72 138 70" stroke="#059669" strokeWidth="1" strokeLinecap="round" />
      <path d="M26 80C31 72 41 72 43 76C42 83 35 88 26 80Z" fill="#10B981" />
    </motion.svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Gallery Page Component
───────────────────────────────────────────────────────────────────────────── */

export default function GalleryPage() {
  const [photos, setPhotos]     = useState<Photo[]>([]);
  const [loading, setLoading]   = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy]     = useState<"newest" | "alpha">("newest");
  const [lightbox, setLightbox] = useState<{ albums: EventAlbumItem[]; index: number } | null>(null);

  useEffect(() => {
    getPhotos()
      .then((p) => {
        setPhotos(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* Map only genuine photo albums from Firestore */
  const allAlbums: EventAlbumItem[] = useMemo(() => {
    return photos.map((p, idx) => ({
      id: p.id || `album-${idx}`,
      title: p.title || "நிகழ்வு ஆல்பம்",
      description: p.description || "",
      coverUrl: p.url,
      driveUrl: p.driveUrl,
      year: p.uploadedAt?.seconds
        ? new Date(p.uploadedAt.seconds * 1000).getFullYear().toString()
        : "2026",
    }));
  }, [photos]);

  /* Sort albums */
  const sortedAlbums = useMemo(() => {
    const result = [...allAlbums];
    if (sortBy === "alpha") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  }, [allAlbums, sortBy]);

  /* Lightbox navigation handlers */
  const openLightbox  = (albums: EventAlbumItem[], index: number) => setLightbox({ albums, index });
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() =>
    setLightbox(lb => lb ? { ...lb, index: (lb.index - 1 + lb.albums.length) % lb.albums.length } : lb), []);
  const next = useCallback(() =>
    setLightbox(lb => lb ? { ...lb, index: (lb.index + 1) % lb.albums.length } : lb), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === "Escape")     closeLightbox();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox, closeLightbox, prev, next]);

  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  return (
    <div className="relative flex flex-col justify-between min-h-[100vh] -mt-16 sm:-mt-20 pt-16 sm:pt-20 bg-[#FAF9F6] font-tamil text-[#0F172A] overflow-hidden select-none">
      {/* ── Background Subtle Watermark Image ── */}
      <img
        src={getAssetPath("/bharathiyar-bg.jpg")}
        alt="Bharathiyar artwork watermark"
        className="fixed inset-0 size-full object-cover object-right pointer-events-none -z-10 opacity-35"
      />

      {/* ── Seamless Parchment & Readability Overlay ── */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            "linear-gradient(110deg, rgba(250, 249, 246, 0.98) 0%, rgba(250, 249, 246, 0.95) 50%, rgba(250, 249, 246, 0.70) 80%, rgba(250, 249, 246, 0.25) 100%)",
        }}
      />

      {/* ── Main Centered Content Container (max-w-6xl / 1200px) ── */}
      <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8 pb-12 sm:pb-16 space-y-6 sm:space-y-7">

        {/* ── 1. Top Gallery Hero Banner ── */}
        <section className="relative p-6 sm:p-8 rounded-[24px] bg-gradient-to-r from-[#EBF5FF] via-[#F8FBFF] to-[#F3F0FF] border border-[#D5E8FA] shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Subtle Inner Accent Ring */}
          <div className="absolute inset-2.5 rounded-[18px] border border-white/60 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/90 border border-[#C5E1FA] shadow-2xs">
                <div className="h-2 w-2 rounded-full bg-[#378BE7] animate-pulse" />
                <span className="text-[11px] font-bold text-[#2874D4] font-jakarta tracking-wider uppercase">
                  DZM · புகைப்படங்கள்
                </span>
              </div>

              <h1 className="font-serif-tamil font-extrabold text-[#0F172A] text-2xl sm:text-3xl lg:text-[2.2rem] leading-tight flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-[#EAF4FF] border border-[#C5E1FA] text-[#378BE7] flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Camera className="h-5.5 w-5.5" />
                </div>
                <span>நிகழ்வுகளின் புகைப்படங்கள்</span>
              </h1>

              <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
                நிறைவடைந்த பள்ளி நிகழ்வுகளின் முழு புகைப்படத் தொகுப்புகளை இங்கே காணலாம்.
              </p>
            </div>

            {/* Photography Vector Artwork (Desktop & Tablet) */}
            <div className="flex-shrink-0 flex items-center gap-4">
              <div className="hidden sm:block">
                <GalleryHeroIllustration className="w-36 sm:w-44 lg:w-48 h-24 sm:h-28" />
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Gallery Controls Toolbar ── */}
        <section className="p-3 sm:p-4 rounded-2xl bg-white/95 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Albums info / count badge */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-start">
            <div className="h-9 w-9 rounded-xl bg-[#EAF4FF] border border-[#C7E2FE] text-[#2A75D3] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Images className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="font-serif-tamil font-bold text-sm sm:text-base text-[#0F172A] leading-tight">
                புகைப்படத் தொகுப்புகள்
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                மொத்தம் {sortedAlbums.length} ஆல்பங்கள்
              </p>
            </div>
          </div>

          {/* Right: View & Sort Controls */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2.5">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#378BE7] cursor-pointer"
            >
              <option value="newest">புதியவை முதலில்</option>
              <option value="alpha">அகரவரிசை (A-Z)</option>
            </select>

            {/* Grid vs List View Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-lg transition-all cursor-pointer",
                  viewMode === "grid"
                    ? "bg-white text-[#378BE7] shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                )}
                title="Grid View"
              >
                <GridIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-lg transition-all cursor-pointer",
                  viewMode === "list"
                    ? "bg-white text-[#378BE7] shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                )}
                title="List View"
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ── 3. Photo Albums Cards Grid ── */}
        <section className="flex-1">
          {loading ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded-[22px] border border-slate-200 bg-white/70 animate-pulse p-4 flex flex-col gap-4"
                  style={{ minHeight: "360px", animationDelay: `${i * 0.12}s` }}
                >
                  <div className="w-full aspect-[16/10] rounded-xl bg-slate-100" />
                  <div className="h-5 w-3/4 rounded-md bg-slate-100" />
                  <div className="h-10 w-full rounded-md bg-slate-100" />
                  <div className="h-10 w-full rounded-xl bg-slate-100 mt-auto" />
                </div>
              ))}
            </div>
          ) : sortedAlbums.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-20 text-center rounded-[24px] bg-white border border-slate-200/90 p-8 shadow-xs"
            >
              <div className="h-14 w-14 rounded-2xl mb-4 bg-[#EAF4FF] border border-[#C7E2FE] flex items-center justify-center text-[#438BE5]">
                <Camera className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <h3 className="font-serif-tamil font-bold text-[#0F172A] text-lg mb-1">
                இன்னும் புகைப்படத் தொகுப்புகள் பதிவேற்றப்படவில்லை
              </h3>
              <p className="font-tamil text-xs sm:text-sm text-slate-500 max-w-md">
                ஆசிரியர் புதிய நிகழ்வுகளுக்கான புகைப்படங்களைச் சேர்க்கும்போது இங்கே அழகாகத் தோன்றும்.
              </p>
            </motion.div>
          ) : (
            /* ── Responsive Album Cards Grid (3 Columns on Desktop) ── */
            <div className={cn(
              "grid gap-6 sm:gap-7",
              viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-3xl mx-auto"
            )}>
              {sortedAlbums.map((album, i) => {
                const theme = ALBUM_THEMES[i % ALBUM_THEMES.length];
                return (
                  <StudentAlbumCard
                    key={album.id}
                    album={album}
                    theme={theme}
                    index={i}
                    viewMode={viewMode}
                    onPreview={() => openLightbox(sortedAlbums, i)}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* ── 4. Subtle Decorative Quote & Memories Note ── */}
        {!loading && sortedAlbums.length > 0 && (
          <section className="pt-4 pb-2 text-center select-none">
            <div className="inline-flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs max-w-md mx-auto">
              <div className="flex items-center gap-2 text-[#438BE5] mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-widest font-jakarta">பள்ளி நினைவுகள்</span>
              </div>
              <p className="font-serif-tamil text-xs sm:text-sm font-bold text-[#0F172A] leading-relaxed">
                “ஒவ்வொரு புகைப்படமும் ஒரு அழகான நினைவு.”
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-2 text-[10.5px] font-bold text-slate-400 font-tamil">
                <span>நினைவுகளை சேமிப்போம் 📸</span>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ── Home Footer ── */}
      <HomeFooter />

      {/* ── Fullscreen Lightbox Modal ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 select-none bg-slate-900/85 backdrop-blur-md font-tamil"
            onClick={closeLightbox}
          >
            {/* Close Button (Top-Right) */}
            <button
              className="absolute top-5 right-5 z-30 p-2.5 rounded-full border border-white/20 bg-slate-900/80 text-white hover:bg-[#378BE7] hover:border-[#378BE7] transition-all duration-200 cursor-pointer shadow-lg"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Previous & Next Arrows */}
            {lightbox.albums.length > 1 && (
              <>
                <button
                  className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border border-white/20 bg-slate-900/80 text-white hover:bg-[#378BE7] hover:border-[#378BE7] transition-all duration-200 cursor-pointer shadow-lg"
                  onClick={e => { e.stopPropagation(); prev(); }}
                  aria-label="Previous album"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border border-white/20 bg-slate-900/80 text-white hover:bg-[#378BE7] hover:border-[#378BE7] transition-all duration-200 cursor-pointer shadow-lg"
                  onClick={e => { e.stopPropagation(); next(); }}
                  aria-label="Next album"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Main Lightbox Content Container */}
            <motion.div
              key={lightbox.index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.28, ease: EASE_EXPO }}
              className="flex flex-col items-center gap-3.5 max-h-[92vh] max-w-[92vw] z-20"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                <img
                  src={lightbox.albums[lightbox.index].coverUrl}
                  alt={lightbox.albums[lightbox.index].title}
                  className="max-h-[68vh] max-w-[88vw] object-contain block"
                />
              </div>

              {/* Caption & Action Bar */}
              <div className="text-center px-4 max-w-xl space-y-2">
                <p className="font-serif-tamil font-bold text-lg text-white tracking-wide leading-snug">
                  {lightbox.albums[lightbox.index].title}
                </p>

                {lightbox.albums[lightbox.index].description && (
                  <p className="font-tamil text-xs text-white/80 line-clamp-2">
                    {lightbox.albums[lightbox.index].description}
                  </p>
                )}

                {/* Google Drive Link Button in Lightbox */}
                {lightbox.albums[lightbox.index].driveUrl && (
                  <div className="pt-1 flex justify-center">
                    <a
                      href={lightbox.albums[lightbox.index].driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#438BE5] to-[#3B82F6] hover:from-[#327CD9] hover:to-[#2563EB] text-white font-tamil font-bold text-xs shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                      <Images className="h-4 w-4" />
                      <span>அனைத்துப் படங்களையும் காண்க</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 text-[11px] font-bold tracking-widest uppercase font-jakarta text-[#93C5FD] pt-1">
                  <span>DZM · புகைப்படங்கள்</span>
                  {lightbox.albums.length > 1 && (
                    <>
                      <span>•</span>
                      <span>{lightbox.index + 1} OF {lightbox.albums.length}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   StudentAlbumCard Component — Modern Digital School Album Card
───────────────────────────────────────────────────────────────────────────── */

function StudentAlbumCard({
  album,
  theme,
  index,
  viewMode,
  onPreview,
}: {
  album: EventAlbumItem;
  theme: AlbumAccentTheme;
  index: number;
  viewMode: "grid" | "list";
  onPreview: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay: Math.min(0.06 + index * 0.05, 0.4),
        ease: EASE_EXPO,
      }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "group relative flex flex-col rounded-[22px] bg-white border shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300",
        theme.borderColor,
        viewMode === "list" && "sm:flex-row sm:items-stretch"
      )}
      style={{
        boxShadow: isHovered ? `0 14px 32px -8px ${theme.cardGlow}` : "0 4px 20px rgba(0,0,0,0.03)",
      }}
    >
      {/* ── Cover Photo Frame (16:10 aspect ratio) ── */}
      <div
        className={cn(
          "relative overflow-hidden w-full aspect-[16/10] bg-slate-100 cursor-pointer",
          viewMode === "list" && "sm:w-64 sm:aspect-auto sm:min-h-full flex-shrink-0"
        )}
        onClick={onPreview}
        title="படத்தை பெரிதாக்கி பார்க்க அழுத்தவும்"
      >
        <img
          src={album.coverUrl}
          alt={album.title}
          loading="lazy"
          className="w-full h-full object-cover block transition-transform duration-500 ease-out group-hover:scale-104"
        />

        {/* Small Year / Photo Album Badge (Top-Left) */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs border border-white/20 text-white font-jakarta text-[10px] font-bold tracking-wider uppercase shadow-xs">
          <ImageIcon className="h-3 w-3 text-[#93C5FD]" />
          <span>PHOTO ALBUM</span>
        </div>

        {/* Expand / Preview Icon Badge (Top-Right) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className="absolute top-3 right-3 z-10 flex items-center justify-center p-2 rounded-lg bg-black/60 hover:bg-[#378BE7] text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md cursor-pointer"
          title="முழுத்திரை முன்னோட்டம்"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </div>

        {/* Subtle Dark Gradient Overlay at Bottom of Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-75 transition-opacity pointer-events-none" />
      </div>

      {/* ── Card Content Body ── */}
      <div className="flex-1 flex flex-col justify-between p-5 space-y-4">
        {/* Title & Short Description */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-extrabold font-jakarta border uppercase", theme.badgeBg, theme.badgeBorder, theme.badgeText)}>
              {album.year}
            </span>
          </div>

          <h3 className="font-serif-tamil text-base sm:text-[1.12rem] font-bold text-[#0F172A] leading-snug group-hover:text-[#2563EB] transition-colors line-clamp-2">
            {album.title}
          </h3>

          {album.description && (
            <p className="font-tamil text-xs text-slate-600 leading-relaxed line-clamp-2 bg-slate-50/80 p-2 rounded-xl border border-slate-100">
              {album.description}
            </p>
          )}
        </div>

        {/* ── Action: View Photos Button with Smooth Arrow Animation ── */}
        <div className="pt-2 border-t border-slate-100">
          {album.driveUrl ? (
            <a
              href={album.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group/btn w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-tamil font-bold text-xs sm:text-sm shadow-xs transition-all duration-200 active:scale-[0.98] cursor-pointer",
                theme.btnBg,
                theme.btnHover
              )}
            >
              <Images className="h-4 w-4 flex-shrink-0" />
              <span>புகைப்படங்களைப் பார்க்க</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-85 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </a>
          ) : (
            <button
              onClick={onPreview}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-tamil font-semibold text-xs transition-colors cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5 text-[#378BE7]" />
              <span>படத்தை பெரிதாக்கு</span>
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
