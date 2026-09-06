"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Calendar, MapPin, Clock, X, ChevronLeft, ChevronRight,
  Sparkles, ArrowRight, BookOpen, CheckCircle2,
  CalendarDays, Trophy, Medal, Grid as GridIcon,
  List as ListIcon, Filter, ExternalLink, ChevronDown, ChevronUp,
} from "lucide-react";
import { getEvents, SchoolEvent } from "@/lib/firestore";
import { cn, getAssetPath } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { HomeFooter } from "@/components/site-footer";

/* ─────────────────────────────────────────────────────────────────────────────
   Types & Tamil Date Helper
───────────────────────────────────────────────────────────────────────────── */

const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface FormattedTamilDate {
  day: string;
  month: string;
  year: string;
  full: string;
  isToday: boolean;
  isUpcoming: boolean;
}

function parseEventDate(dateVal: any): FormattedTamilDate {
  try {
    let d: Date | null = null;
    if (dateVal?.toDate) d = dateVal.toDate();
    else if (dateVal?.seconds) d = new Date(dateVal.seconds * 1000);
    else if (dateVal) d = new Date(dateVal);

    if (!d || isNaN(d.getTime())) {
      return { day: "—", month: "—", year: "—", full: "—", isToday: false, isUpcoming: false };
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const eventTime = d.getTime();

    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const isUpcoming = eventTime >= startOfToday;

    const monthsTamil = [
      "ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்",
      "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"
    ];

    const day = String(d.getDate()).padStart(2, "0");
    const month = monthsTamil[d.getMonth()] || "—";
    const year = String(d.getFullYear());
    const full = `${d.getDate()} ${month} ${year}`;

    return { day, month, year, full, isToday, isUpcoming };
  } catch {
    return { day: "—", month: "—", year: "—", full: "—", isToday: false, isUpcoming: false };
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Vector Illustrations
───────────────────────────────────────────────────────────────────────────── */

// 1. Events Hero Vector Artwork (Calendar + Trophy + Medal + Confetti + Ticket)
function EventsHeroIllustration({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 175 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none pointer-events-none drop-shadow-2xs", className)}
      animate={{ y: [0, -3.5, 0] }}
      transition={{ duration: 4.0, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Background Pastel Glows */}
      <circle cx="88" cy="55" r="48" fill="#FFF0F0" fillOpacity="0.85" />
      <circle cx="140" cy="38" r="22" fill="#FFF4DF" fillOpacity="0.8" />
      <circle cx="34" cy="40" r="18" fill="#FFE4E6" fillOpacity="0.75" />

      {/* Confetti & Celebration Stars */}
      <path d="M148 16L149.5 19.5L153 21L149.5 22.5L148 26L146.5 22.5L143 21L146.5 19.5L148 16Z" fill="#FBBF24" />
      <path d="M22 20L23.5 22.5L26 23.5L23.5 24.5L22 27L20.5 24.5L18 23.5L20.5 22.5L22 20Z" fill="#E86868" />
      <circle cx="158" cy="50" r="2.5" fill="#EC4899" />
      <circle cx="28" cy="60" r="2" fill="#F59E0B" />
      <rect x="138" y="74" width="4" height="4" rx="1" fill="#3B82F6" transform="rotate(25 140 76)" />
      <rect x="36" y="16" width="4" height="4" rx="1" fill="#10B981" transform="rotate(-20 38 18)" />

      {/* Event Ticket (Back Right) */}
      <g transform="rotate(14 116 46)">
        <rect x="92" y="16" width="48" height="26" rx="4" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="1.2" />
        <rect x="95" y="19" width="42" height="20" rx="2" fill="#FFF7ED" />
        <circle cx="92" cy="29" r="3.5" fill="#FFF0DF" />
        <circle cx="140" cy="29" r="3.5" fill="#FFF0DF" />
        <line x1="108" y1="20" x2="108" y2="38" stroke="#FDBA74" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M116 26H132M116 30H126" stroke="#F97316" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* Shiny Medal (Back Left) */}
      <g transform="rotate(-12 50 50)">
        {/* Ribbon */}
        <path d="M42 20L48 38L44 38L38 20Z" fill="#3B82F6" />
        <path d="M54 20L48 38L52 38L58 20Z" fill="#EF4444" />
        <circle cx="48" cy="46" r="11" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
        <circle cx="48" cy="46" r="8.5" fill="#FDE047" />
        <polygon points="48,40 50,44.5 54.5,45 51,48 52,52.5 48,50 44,52.5 45,48 41.5,45 46,44.5" fill="#D97706" />
      </g>

      {/* Calendar Card (Center Left) */}
      <g transform="translate(42, 34)">
        <rect x="0" y="8" width="44" height="42" rx="6" fill="#FFFFFF" stroke="#FFCCD2" strokeWidth="1.2" />
        <path d="M0 14C0 10.6863 2.68629 8 6 8H38C41.3137 8 44 10.6863 44 14V18H0V14Z" fill="#E86868" />
        <rect x="8" y="4" width="4" height="8" rx="2" fill="#94A3B8" />
        <rect x="20" y="4" width="4" height="8" rx="2" fill="#94A3B8" />
        <rect x="32" y="4" width="4" height="8" rx="2" fill="#94A3B8" />
        <rect x="8" y="24" width="28" height="18" rx="3" fill="#FFF1F2" />
        <circle cx="22" cy="33" r="5" fill="#E86868" />
      </g>

      {/* Golden Trophy (Foreground Center-Right) */}
      <g transform="translate(86, 26)">
        {/* Base */}
        <rect x="14" y="46" width="24" height="6" rx="2" fill="#78350F" />
        <rect x="17" y="41" width="18" height="5" rx="1" fill="#B45309" />
        <rect x="23" y="34" width="6" height="8" rx="1" fill="#D97706" />
        {/* Cup */}
        <path d="M12 10H40V24C40 31.5 33.5 36 26 36C18.5 36 12 31.5 12 24V10Z" fill="#FBBF24" />
        <path d="M15 13H37V23C37 28.5 32 32.5 26 32.5C20 32.5 15 28.5 15 23V13Z" fill="#FDE047" />
        {/* Handles */}
        <path d="M12 14C5 14 5 24 12 24" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
        <path d="M40 14C47 14 47 24 40 24" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
        {/* Star */}
        <polygon points="26,16 27.5,20 31.5,20.5 28.5,23.5 29.5,27.5 26,25.5 22.5,27.5 23.5,23.5 20.5,20.5 24.5,20" fill="#D97706" />
      </g>

      {/* Mint Green Leaves at Base */}
      <path d="M128 78C133 69 143 68 147 70C146 79 138 85 128 78Z" fill="#34D399" />
      <path d="M129 77C134 77 138 74 142 72" stroke="#059669" strokeWidth="1" strokeLinecap="round" />
    </motion.svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Student Events Page Component
───────────────────────────────────────────────────────────────────────────── */

export default function StudentEventsPage() {
  const [events, setEvents]           = useState<SchoolEvent[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeModal, setActiveModal] = useState<SchoolEvent | null>(null);

  // Filters & View Controls
  const [filterType, setFilterType]   = useState<"all" | "events" | "competitions">("all");
  const [viewMode, setViewMode]       = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy]           = useState<"newest" | "alpha">("newest");
  const [showPastEvents, setShowPastEvents] = useState(false);

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const getEventTimestamp = (e: SchoolEvent) => {
    if (e.eventDate?.toDate) return e.eventDate.toDate().getTime();
    if (e.eventDate?.seconds) return e.eventDate.seconds * 1000;
    if (e.eventDate) return new Date(e.eventDate as any).getTime();
    return 0;
  };

  // Filtered & Sorted Events
  const processedEvents = useMemo(() => {
    let result = [...events];

    // Filter by type
    if (filterType === "events") {
      result = result.filter((e) => e.eventType !== "போட்டி" && e.category !== "போட்டி");
    } else if (filterType === "competitions") {
      result = result.filter((e) => e.eventType === "போட்டி" || e.category === "போட்டி");
    }

    // Sort
    if (sortBy === "alpha") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a));
    }

    return result;
  }, [events, filterType, sortBy]);

  const upcomingEvents = useMemo(() => {
    return processedEvents
      .filter((e) => getEventTimestamp(e) >= startOfToday)
      .sort((a, b) => getEventTimestamp(a) - getEventTimestamp(b)); // Nearest first for upcoming
  }, [processedEvents, startOfToday]);

  const pastEvents = useMemo(() => {
    return processedEvents
      .filter((e) => getEventTimestamp(e) < startOfToday)
      .sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a));
  }, [processedEvents, startOfToday]);

  // Nearest featured upcoming event ID
  const nearestUpcomingId = upcomingEvents.length > 0 ? upcomingEvents[0].id : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModal && e.key === "Escape") {
        setActiveModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModal]);

  useEffect(() => {
    document.body.style.overflow = activeModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeModal]);

  return (
    <div className="relative flex flex-col justify-between min-h-[100svh] -mt-16 sm:-mt-20 pt-16 sm:pt-20 bg-[#FAF9F6] font-tamil text-[#0F172A] overflow-hidden select-none">
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

        {/* ── 1. Compact Events Hero Banner ── */}
        <section className="relative p-6 sm:p-8 rounded-[24px] bg-gradient-to-r from-[#FFF0F0] via-[#FFF8F2] to-[#FFF0DF] border border-[#FFD8D8] shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Subtle Inner Accent Ring */}
          <div className="absolute inset-2.5 rounded-[18px] border border-white/60 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/90 border border-[#FFCCD2] shadow-2xs">
                <div className="h-2 w-2 rounded-full bg-[#E86868] animate-pulse" />
                <span className="text-[11px] font-bold text-[#E86868] font-jakarta tracking-wider uppercase">
                  DZM · நிகழ்வுகள் & போட்டிகள்
                </span>
              </div>

              <h1 className="font-serif-tamil font-extrabold text-[#0F172A] text-2xl sm:text-3xl lg:text-[2.2rem] leading-tight flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-[#FFE4E6] border border-[#FFCCD2] text-[#E86868] flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <CalendarDays className="h-5.5 w-5.5" />
                </div>
                <span>வரவிருக்கும் நிகழ்வுகள் மற்றும் போட்டிகள்</span>
              </h1>

              <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
                பள்ளியின் சிறப்பு விழாக்கள், தமிழ் கலை இலக்கியப் போட்டிகள் மற்றும் நிகழ்வுகளை ஒரே இடத்தில் அறிந்துகொள்ளுங்கள்.
              </p>
            </div>

            {/* Events Vector Artwork (Desktop & Tablet) */}
            <div className="flex-shrink-0 flex items-center gap-4">
              <div className="hidden sm:block">
                <EventsHeroIllustration className="w-36 sm:w-44 lg:w-48 h-24 sm:h-28" />
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Filters & Controls Toolbar ── */}
        <section className="p-3 sm:p-4 rounded-2xl bg-white/95 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Type Filter Buttons (Pill Style) */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 border border-slate-200 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setFilterType("all")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer select-none whitespace-nowrap",
                filterType === "all"
                  ? "bg-white text-[#4F46E5] shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              )}
            >
              <span>அனைத்தும்</span>
              <span className="ml-1.5 text-[10px] opacity-75">({events.length})</span>
            </button>

            <button
              onClick={() => setFilterType("events")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer select-none whitespace-nowrap",
                filterType === "events"
                  ? "bg-white text-[#E86868] shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>நிகழ்வுகள்</span>
            </button>

            <button
              onClick={() => setFilterType("competitions")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer select-none whitespace-nowrap",
                filterType === "competitions"
                  ? "bg-white text-[#E99A3E] shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              )}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>போட்டிகள்</span>
            </button>
          </div>

          {/* Right: Sort + View Mode Controls */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#E86868] cursor-pointer"
            >
              <option value="newest">தேதி அடிப்படையில்</option>
              <option value="alpha">அகரவரிசை (A-Z)</option>
            </select>

            {/* Grid vs List View */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-lg transition-all cursor-pointer",
                  viewMode === "grid"
                    ? "bg-white text-[#E86868] shadow-2xs font-bold"
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
                    ? "bg-white text-[#E86868] shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                )}
                title="List View"
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ── 3. Upcoming Events Section ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#FFE4E6] text-[#E86868] flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="font-serif-tamil font-bold text-lg sm:text-xl text-[#0F172A]">
                  வரவிருக்கும் நிகழ்வுகள் மற்றும் போட்டிகள்
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  விரைவில் நடைபெறவிருக்கும் நிகழ்வுகளைத் தவறவிடாதீர்கள்.
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#FFE4E6] text-[#E86868] border border-[#FFCCD2]">
              {upcomingEvents.length}
            </span>
          </div>

          {loading ? (
            /* Skeleton Loading */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-[22px] border border-slate-200 bg-white/70 animate-pulse p-4 flex flex-col gap-4"
                  style={{ minHeight: "360px", animationDelay: `${i * 0.12}s` }}
                >
                  <div className="w-full aspect-[16/10] rounded-xl bg-slate-100" />
                  <div className="h-5 w-3/4 rounded-md bg-slate-100" />
                  <div className="h-10 w-full rounded-md bg-slate-100" />
                </div>
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            /* Empty Upcoming State */
            <div className="py-14 text-center rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-6">
              <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2.5" />
              <h3 className="font-serif-tamil font-bold text-[#0F172A] text-base mb-1">
                வரவிருக்கும் புதிய நிகழ்வுகள் எதுவும் இல்லை
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                புதிய நிகழ்வுகள் அல்லது போட்டிகள் அறிவிக்கப்படும் போது இங்கே தானாகத் தோன்றும்.
              </p>
            </div>
          ) : (
            /* Upcoming Events Grid */
            <div className={cn(
              "grid gap-6",
              viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-3xl mx-auto"
            )}>
              {upcomingEvents.map((evt, idx) => (
                <StudentEventCard
                  key={evt.id}
                  event={evt}
                  index={idx}
                  isUpcoming={true}
                  isFeatured={evt.id === nearestUpcomingId}
                  viewMode={viewMode}
                  onDetails={() => setActiveModal(evt)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── 4. Past Events Section (Collapsible Accordion) ── */}
        {!loading && pastEvents.length > 0 && (
          <section className="pt-2 space-y-4">
            <div
              onClick={() => setShowPastEvents(!showPastEvents)}
              className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#E86868]/40 transition-all cursor-pointer select-none"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-serif-tamil font-bold text-base sm:text-lg text-[#0F172A]">
                    நிறைவடைந்த நிகழ்வுகள் மற்றும் போட்டிகள்
                  </h3>
                  <p className="text-xs text-slate-500">
                    நமது பள்ளியில் சிறப்பாக நடைபெற்று முடிந்த நிகழ்வுகளின் பதிவுகள் ({pastEvents.length})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#E86868] font-bold hidden sm:inline">
                  {showPastEvents ? "மறைக்கவும்" : "பார்க்கவும்"}
                </span>
                <div className={cn(
                  "h-7 w-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center transition-transform duration-300",
                  showPastEvents && "rotate-180 bg-[#FFE4E6] text-[#E86868]"
                )}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showPastEvents && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE_EXPO }}
                  className="overflow-hidden"
                >
                  <div className={cn(
                    "grid gap-6 pt-2 opacity-95",
                    viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-3xl mx-auto"
                  )}>
                    {pastEvents.map((evt, idx) => (
                      <StudentEventCard
                        key={evt.id}
                        event={evt}
                        index={idx}
                        isUpcoming={false}
                        isFeatured={false}
                        viewMode={viewMode}
                        onDetails={() => setActiveModal(evt)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* ── 5. Subtle Decorative Motivational Quote ── */}
        <section className="pt-4 pb-2 text-center select-none">
          <div className="inline-flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs max-w-md mx-auto">
            <div className="flex items-center gap-2 text-[#E86868] mb-1">
              <Sparkles className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest font-jakarta">மாணவர் ஊக்கம்</span>
            </div>
            <p className="font-serif-tamil text-xs sm:text-sm font-bold text-[#0F172A] leading-relaxed">
              “முயற்சி • பங்கேற்பு • வெற்றி ✨”
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-[10.5px] font-bold text-slate-400 font-tamil">
              <span>DZM EVENTS &amp; COMPETITIONS</span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Home Footer ── */}
      <HomeFooter />

      {/* ── Event Details Modal (விவரங்களைப் பார்க்க) ── */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 select-none bg-slate-900/60 backdrop-blur-xs font-tamil"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ duration: 0.3, ease: EASE_EXPO }}
              className="relative w-full max-w-2xl max-h-[90svh] sm:max-h-[90vh] overflow-y-auto rounded-[24px] bg-white border border-slate-200 shadow-2xl p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-[#E86868] hover:text-white text-slate-600 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header Image */}
              {activeModal.photoUrls && activeModal.photoUrls.length > 0 ? (
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-6 border border-slate-200 bg-slate-100">
                  <img
                    src={activeModal.photoUrls[0]}
                    alt={activeModal.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className={cn(
                  "relative w-full h-40 rounded-2xl overflow-hidden mb-6 flex flex-col items-center justify-center border",
                  (activeModal.eventType === "போட்டி" || activeModal.category === "போட்டி")
                    ? "bg-[#FFF4DF] border-[#FFE0BD] text-[#E99A3E]"
                    : "bg-[#FFF0F0] border-[#FFCCD2] text-[#E86868]"
                )}>
                  {(activeModal.eventType === "போட்டி" || activeModal.category === "போட்டி") ? (
                    <Trophy className="h-12 w-12 mb-2" />
                  ) : (
                    <Calendar className="h-12 w-12 mb-2" />
                  )}
                  <span className="font-serif-tamil font-bold text-sm">
                    {(activeModal.eventType === "போட்டி" || activeModal.category === "போட்டி") ? "DZM போட்டி" : "DZM நிகழ்வு"}
                  </span>
                </div>
              )}

              {/* Status & Type Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-tamil border",
                  (activeModal.eventType === "போட்டி" || activeModal.category === "போட்டி")
                    ? "bg-[#FFF4DF] text-[#E99A3E] border-[#FFE0BD]"
                    : "bg-[#FFF0F0] text-[#E86868] border-[#FFCCD2]"
                )}>
                  <span>{(activeModal.eventType === "போட்டி" || activeModal.category === "போட்டி") ? "🏆 போட்டி" : "📅 நிகழ்வு"}</span>
                </span>

                {parseEventDate(activeModal.eventDate).isUpcoming ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-tamil bg-emerald-100 text-emerald-900 border border-emerald-300">
                    <Sparkles className="h-3 w-3 text-emerald-600" />
                    <span>வரவிருக்கிறது</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-tamil bg-slate-100 text-slate-700 border border-slate-200">
                    <CheckCircle2 className="h-3 w-3 text-slate-500" />
                    <span>நிறைவடைந்தது</span>
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="font-serif-tamil font-extrabold text-xl sm:text-2xl text-[#0F172A] leading-snug mb-4">
                {activeModal.title}
              </h2>

              {/* Info Badges (Date, Time, Location) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 p-4 rounded-xl bg-[#FAF9F6] border border-slate-200/90">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#0F172A] font-tamil">
                  <Calendar className="h-4 w-4 text-[#E86868] flex-shrink-0" />
                  <span>{parseEventDate(activeModal.eventDate).full}</span>
                </div>

                {activeModal.time && (
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#0F172A] font-tamil">
                    <Clock className="h-4 w-4 text-[#378BE7] flex-shrink-0" />
                    <span>{activeModal.time}</span>
                  </div>
                )}

                {activeModal.location && (
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#0F172A] font-tamil sm:col-span-2">
                    <MapPin className="h-4 w-4 text-[#E99A3E] flex-shrink-0" />
                    <span>{activeModal.location}</span>
                  </div>
                )}
              </div>

              {/* Description / Welcome Message */}
              {activeModal.description && (
                <div className="space-y-2 p-5 rounded-2xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F5] to-[#FFF4EF] border border-[#FFCCD2] shadow-2xs">
                  <div className="flex items-center gap-2 text-[#E86868]">
                    <Sparkles className="h-4 w-4" />
                    <h3 className="font-serif-tamil font-bold text-sm sm:text-base text-[#E86868]">
                      அன்பான மாணவர்களே!
                    </h3>
                  </div>
                  <p className="font-tamil text-xs sm:text-sm text-[#0F172A] leading-relaxed whitespace-pre-line">
                    {activeModal.description}
                  </p>
                </div>
              )}

              {/* Bottom Action */}
              <div className="pt-5 mt-5 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-tamil font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  மூடு
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   StudentEventCard Component (Distinct Event vs Competition Identities)
───────────────────────────────────────────────────────────────────────────── */

function StudentEventCard({
  event,
  index,
  isUpcoming,
  isFeatured,
  viewMode,
  onDetails,
}: {
  event: SchoolEvent;
  index: number;
  isUpcoming: boolean;
  isFeatured: boolean;
  viewMode: "grid" | "list";
  onDetails: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const dateInfo = parseEventDate(event.eventDate);
  const isComp = event.eventType === "போட்டி" || event.category === "போட்டி";
  const coverImg = event.photoUrls && event.photoUrls.length > 0 ? event.photoUrls[0] : null;

  // Theme settings based on Event vs Competition
  const cardTheme = isComp
    ? {
        bg: "bg-[#FFFDF8]",
        border: "border-[#FFE0BD]",
        hoverBorder: "hover:border-[#E99A3E]/60",
        glow: "rgba(233, 154, 62, 0.14)",
        badgeBg: "bg-[#FFF4DF]",
        badgeBorder: "border-[#FFE0BD]",
        badgeText: "text-[#E99A3E]",
        dateColor: "text-[#E99A3E]",
        btnBg: "bg-gradient-to-r from-[#E99A3E] to-[#F59E0B] hover:from-[#D8892D] hover:to-[#D97706]",
        accentIconColor: "text-[#E99A3E]",
        placeholderBg: "bg-gradient-to-br from-[#FFFDF8] via-[#FFF6E9] to-[#FFE9CF]",
      }
    : {
        bg: "bg-[#FFFDFA]",
        border: "border-[#FFCCD2]",
        hoverBorder: "hover:border-[#E86868]/60",
        glow: "rgba(232, 104, 104, 0.14)",
        badgeBg: "bg-[#FFF0F0]",
        badgeBorder: "border-[#FFCCD2]",
        badgeText: "text-[#E86868]",
        dateColor: "text-[#E86868]",
        btnBg: "bg-gradient-to-r from-[#E86868] to-[#F43F5E] hover:from-[#D75757] hover:to-[#E11D48]",
        accentIconColor: "text-[#E86868]",
        placeholderBg: "bg-gradient-to-br from-[#FFFDFA] via-[#FFF3F3] to-[#FFE4E6]",
      };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: Math.min(0.06 + index * 0.05, 0.4),
        ease: EASE_EXPO,
      }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "group relative flex flex-col rounded-[22px] border shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300",
        cardTheme.bg,
        cardTheme.border,
        cardTheme.hoverBorder,
        viewMode === "list" && "sm:flex-row sm:items-stretch"
      )}
      style={{
        boxShadow: isHovered ? `0 14px 32px -8px ${cardTheme.glow}` : "0 4px 20px rgba(0,0,0,0.03)",
      }}
    >
      {/* ── Cover Image Frame ── */}
      <div
        className={cn(
          "relative overflow-hidden w-full aspect-[16/10] bg-slate-100 cursor-pointer",
          viewMode === "list" && "sm:w-64 sm:aspect-auto sm:min-h-full flex-shrink-0"
        )}
        onClick={onDetails}
        title="விவரங்களைப் பார்க்க அழுத்தவும்"
      >
        {coverImg ? (
          <img
            src={coverImg}
            alt={event.title}
            loading="lazy"
            className="w-full h-full object-cover block transition-transform duration-500 ease-out group-hover:scale-104"
          />
        ) : (
          /* Default Themed Placeholder */
          <div className={cn("w-full h-full flex flex-col items-center justify-center p-4", cardTheme.placeholderBg)}>
            {isComp ? (
              <Trophy className="h-11 w-11 text-[#E99A3E]/70 mb-1.5" />
            ) : (
              <Calendar className="h-11 w-11 text-[#E86868]/70 mb-1.5" />
            )}
            <span className="font-serif-tamil font-bold text-xs tracking-wider text-[#0F172A]/70">
              {isComp ? "DZM போட்டி" : "DZM நிகழ்வு"}
            </span>
          </div>
        )}

        {/* Status / Featured Badge (Top-Left) */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          {isFeatured && isUpcoming && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-tamil text-[10px] font-extrabold shadow-sm">
              <Sparkles className="h-3 w-3" />
              <span>அடுத்து நடைபெறுகிறது</span>
            </span>
          )}
          <span className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg backdrop-blur-xs font-tamil text-[10px] font-bold border shadow-xs",
            cardTheme.badgeBg,
            cardTheme.badgeBorder,
            cardTheme.badgeText
          )}>
            {isComp ? <Trophy className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
            <span>{isComp ? "போட்டி" : "நிகழ்வு"}</span>
          </span>
        </div>

        {/* Floating Date Badge (Top-Right) */}
        <div className="absolute top-3 right-3 z-10 px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-xs border border-slate-200/90 text-center shadow-md">
          <span className={cn("block text-[15px] font-black font-jakarta leading-none", cardTheme.dateColor)}>
            {dateInfo.day}
          </span>
          <span className="block text-[10px] font-bold text-slate-600 font-tamil uppercase leading-tight mt-0.5">
            {dateInfo.month}
          </span>
        </div>

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-50 group-hover:opacity-65 transition-opacity pointer-events-none" />
      </div>

      {/* ── Card Content Body ── */}
      <div className="flex-1 flex flex-col justify-between p-5 space-y-4">
        {/* Title & Metadata */}
        <div className="space-y-2">
          <h3 className="font-serif-tamil text-base sm:text-[1.15rem] font-bold text-[#0F172A] leading-snug group-hover:text-[#2563EB] transition-colors line-clamp-2">
            {event.title}
          </h3>

          <div className="space-y-1.5 pt-1">
            {/* Time */}
            {event.time && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 font-tamil">
                <Clock className="h-3.5 w-3.5 text-[#378BE7] flex-shrink-0" />
                <span>{event.time}</span>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 font-tamil">
                <MapPin className={cn("h-3.5 w-3.5 flex-shrink-0", cardTheme.accentIconColor)} />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>

          {/* Short Description */}
          {event.description && (
            <p className="font-tamil text-xs text-slate-600 leading-relaxed line-clamp-2 bg-slate-50/90 p-2 rounded-xl border border-slate-100 mt-2">
              {event.description}
            </p>
          )}
        </div>

        {/* ── Action: விவரங்களைப் பார்க்க (View Details) Button ── */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onDetails}
            className={cn(
              "group/btn w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-tamil font-bold text-xs sm:text-sm shadow-xs transition-all duration-200 active:scale-[0.98] cursor-pointer",
              cardTheme.btnBg
            )}
          >
            <span>விவரங்களைப் பார்க்க</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-85 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
