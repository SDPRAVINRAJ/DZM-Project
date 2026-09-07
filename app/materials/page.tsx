"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Download, FileText, ChevronRight,
  Folder, FolderOpen, Eye, X, BookOpen, Bookmark, Library, ArrowRight,
  Grid as GridIcon, List as ListIcon, ArrowLeft, Sparkles,
  GraduationCap, Globe, BookMarked, Layers,
} from "lucide-react";
import { getMaterials, Material } from "@/lib/firestore";
import { cn, getAssetPath } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { HomeFooter } from "@/components/site-footer";

/* ─────────────────────────────────────────────────────────────────────────────
   Constants & Folder Theme Configurations
───────────────────────────────────────────────────────────────────────────── */

const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const PRIMARY_FORMS = ["Form 1", "Form 2", "Form 3", "Form 4", "Form 5"];

function parseFormNumber(formKey: string): number {
  const match = formKey.match(/\d+/);
  return match ? parseInt(match[0], 10) : Number.MAX_SAFE_INTEGER;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

interface FormStyleConfig {
  label: string;
  tamilLabel: string;
  subtitle: string;
  themeBg: string;        // Very light pastel card background
  accentColor: string;    // Main accent color for buttons/borders
  tabBg: string;
  tabBorder: string;
  tabText: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  btnBg: string;
  btnHover: string;
  folderIconColor: string;
  folderHoverBg: string;
  borderColor: string;
  glowColor: string;
}

const FORM_STYLES: Record<string, FormStyleConfig> = {
  "Form 1": {
    label: "FORM 1",
    tamilLabel: "படிவம் 1",
    subtitle: "அடிப்படைக் கற்றல் வளங்கள்",
    themeBg: "#FFF1EE",
    accentColor: "#E86B61",
    tabBg: "bg-[#FFE8E3]",
    tabBorder: "border-[#E86B61]/30",
    tabText: "text-[#D94F45]",
    badgeBg: "bg-[#FFE5E0]",
    badgeBorder: "border-[#E86B61]/25",
    badgeText: "text-[#D94F45]",
    btnBg: "bg-[#E86B61]",
    btnHover: "hover:bg-[#D94F45]",
    folderIconColor: "#E86B61",
    folderHoverBg: "hover:bg-[#FFF5F2]",
    borderColor: "border-[#F8D2CC]",
    glowColor: "rgba(232, 107, 97, 0.12)",
  },
  "Form 2": {
    label: "FORM 2",
    tamilLabel: "படிவம் 2",
    subtitle: "தொடர் கற்றல் வளங்கள்",
    themeBg: "#FFF7DC",
    accentColor: "#E9A52E",
    tabBg: "bg-[#FEF0C3]",
    tabBorder: "border-[#E9A52E]/30",
    tabText: "text-[#C6851B]",
    badgeBg: "bg-[#FDEBB6]",
    badgeBorder: "border-[#E9A52E]/25",
    badgeText: "text-[#C6851B]",
    btnBg: "bg-[#E9A52E]",
    btnHover: "hover:bg-[#D89420]",
    folderIconColor: "#E9A52E",
    folderHoverBg: "hover:bg-[#FFF9E6]",
    borderColor: "border-[#F7E5B5]",
    glowColor: "rgba(233, 165, 46, 0.12)",
  },
  "Form 3": {
    label: "FORM 3",
    tamilLabel: "படிவம் 3",
    subtitle: "இடைநிலைக் கற்றல் வளங்கள்",
    themeBg: "#EAF4FF",
    accentColor: "#438BE5",
    tabBg: "bg-[#DCEBFF]",
    tabBorder: "border-[#438BE5]/30",
    tabText: "text-[#2874D4]",
    badgeBg: "bg-[#D0E4FF]",
    badgeBorder: "border-[#438BE5]/25",
    badgeText: "text-[#2874D4]",
    btnBg: "bg-[#438BE5]",
    btnHover: "hover:bg-[#2F7CD9]",
    folderIconColor: "#438BE5",
    folderHoverBg: "hover:bg-[#F2F8FF]",
    borderColor: "border-[#C9E0FC]",
    glowColor: "rgba(67, 139, 229, 0.12)",
  },
  "Form 4": {
    label: "FORM 4",
    tamilLabel: "படிவம் 4",
    subtitle: "உயர்நிலைக் கற்றல் வளங்கள்",
    themeBg: "#FFEAF2",
    accentColor: "#E55B91",
    tabBg: "bg-[#FED7E7]",
    tabBorder: "border-[#E55B91]/30",
    tabText: "text-[#CE3D76]",
    badgeBg: "bg-[#FDCDE2]",
    badgeBorder: "border-[#E55B91]/25",
    badgeText: "text-[#CE3D76]",
    btnBg: "bg-[#E55B91]",
    btnHover: "hover:bg-[#D5457E]",
    folderIconColor: "#E55B91",
    folderHoverBg: "hover:bg-[#FFF2F7]",
    borderColor: "border-[#F9C9DC]",
    glowColor: "rgba(229, 91, 145, 0.12)",
  },
  "Form 5": {
    label: "FORM 5",
    tamilLabel: "படிவம் 5",
    subtitle: "மேல்நிலைக் கற்றல் வளங்கள்",
    themeBg: "#E7F8F1",
    accentColor: "#28A77B",
    tabBg: "bg-[#D1F2E4]",
    tabBorder: "border-[#28A77B]/30",
    tabText: "text-[#1B8963]",
    badgeBg: "bg-[#C2EEDC]",
    badgeBorder: "border-[#28A77B]/25",
    badgeText: "text-[#1B8963]",
    btnBg: "bg-[#28A77B]",
    btnHover: "hover:bg-[#1E956C]",
    folderIconColor: "#28A77B",
    folderHoverBg: "hover:bg-[#F0FAF5]",
    borderColor: "border-[#BDE7D5]",
    glowColor: "rgba(40, 167, 123, 0.12)",
  },
};

const DEFAULT_STYLE: FormStyleConfig = {
  label: "COLLECTION",
  tamilLabel: "மற்றவை",
  subtitle: "பொதுவான கற்றல் வளங்கள்",
  themeBg: "#F4F6F9",
  accentColor: "#55758D",
  tabBg: "bg-[#E8EFF4]",
  tabBorder: "border-[#55758D]/30",
  tabText: "text-[#3D5B70]",
  badgeBg: "bg-[#DEE7EE]",
  badgeBorder: "border-[#55758D]/25",
  badgeText: "text-[#3D5B70]",
  btnBg: "bg-[#55758D]",
  btnHover: "hover:bg-[#436279]",
  folderIconColor: "#55758D",
  folderHoverBg: "hover:bg-[#F6F9FB]",
  borderColor: "border-[#D3DFE8]",
  glowColor: "rgba(85, 117, 141, 0.12)",
};

interface FolderNode {
  label: string;
  subjects: Record<string, { label: string; categories: Record<string, Material[]> }>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Vector Illustrations
───────────────────────────────────────────────────────────────────────────── */

// 1. Top Hero Vector Artwork (Books, open book, pencils, leaves, lightbulb)
function LearningHeroIllustration({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 170 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none pointer-events-none drop-shadow-2xs", className)}
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Background Pastel Glows */}
      <circle cx="85" cy="55" r="46" fill="#E8F4FE" fillOpacity="0.85" />
      <circle cx="132" cy="38" r="22" fill="#EAF8F2" fillOpacity="0.8" />
      <circle cx="36" cy="42" r="18" fill="#FFF4E6" fillOpacity="0.75" />

      {/* Little Lightbulb (Inspiration) */}
      <g transform="translate(126, 12)">
        <circle cx="10" cy="10" r="7" fill="#FDE047" />
        <path d="M7 16H13V18H7V16Z" fill="#94A3B8" />
        <path d="M10 3V1M4 5L2 3M16 5L18 3" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M8 9C8 8 9 7 10 7C11 7 12 8 12 9C12 11 10 11 10 13" stroke="#D97706" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Sparkles */}
      <path d="M22 18L23.5 21.5L27 23L23.5 24.5L22 28L20.5 24.5L17 23L20.5 21.5L22 18Z" fill="#38BDF8" />
      <path d="M148 52L149 54.5L151.5 55.5L149 56.5L148 59L147 56.5L144.5 55.5L147 54.5L148 52Z" fill="#34D399" />

      {/* Stacked Books at Base */}
      {/* Bottom Book (Mint Green) */}
      <rect x="26" y="80" width="76" height="13" rx="3" fill="#10B981" />
      <rect x="29" y="82" width="70" height="9" rx="1.5" fill="#ECFDF5" />
      <rect x="26" y="80" width="8" height="13" rx="2" fill="#059669" />

      {/* Middle Book (Coral Pink) */}
      <rect x="32" y="68" width="68" height="13" rx="3" fill="#F43F5E" />
      <rect x="35" y="70" width="62" height="9" rx="1.5" fill="#FFF1F2" />
      <rect x="32" y="68" width="8" height="13" rx="2" fill="#E11D48" />

      {/* Top Book (Sky Blue) */}
      <rect x="38" y="56" width="60" height="13" rx="3" fill="#3B82F6" />
      <rect x="41" y="58" width="54" height="9" rx="1.5" fill="#EFF6FF" />
      <rect x="38" y="56" width="7" height="13" rx="2" fill="#2563EB" />

      {/* Open Book (Center-Right Foreground) */}
      <g transform="translate(82, 38)">
        <path d="M34 40C26 37 10 38 2 41V17C10 14 26 13 34 16C42 13 58 14 66 17V41C58 38 42 37 34 40Z" fill="#1E293B" fillOpacity="0.08" />
        <path d="M34 38C26 35 10 36 2 39V15C10 12 26 11 34 14C42 11 58 12 66 15V39C58 36 42 35 34 38Z" fill="#3B82F6" />
        <path d="M34 36C26 33 12 34 4 37V14C12 11 26 10 34 13V36Z" fill="#FFFFFF" />
        <line x1="8" y1="18" x2="28" y2="16" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="23" x2="26" y2="21" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="28" x2="24" y2="26" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M34 36C42 33 56 34 64 37V14C56 11 42 10 34 13V36Z" fill="#F8FAFC" />
        <line x1="40" y1="16" x2="60" y2="18" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="40" y1="21" x2="58" y2="23" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="40" y1="26" x2="54" y2="28" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M33 13V32L35 30L37 32V13H33Z" fill="#EF4444" />
      </g>

      {/* Pencil Pot & Stationery (Left Foreground) */}
      <g transform="translate(18, 48)">
        <rect x="2" y="18" width="16" height="24" rx="3" fill="#F59E0B" />
        <rect x="4" y="20" width="12" height="4" rx="1" fill="#D97706" />
        <g transform="rotate(-15 6 18)">
          <rect x="4" y="0" width="4" height="20" rx="1" fill="#F43F5E" />
          <polygon points="4,0 6,-5 8,0" fill="#FDE047" />
          <polygon points="5,-3 6,-5 7,-3" fill="#1E293B" />
        </g>
        <g transform="rotate(12 12 18)">
          <rect x="10" y="2" width="4" height="18" rx="1" fill="#06B6D4" />
          <polygon points="10,2 12,-3 14,2" fill="#FDE047" />
        </g>
        <rect x="7" y="-2" width="5" height="22" rx="1" fill="#FBBF24" />
        <line x1="10" y1="2" x2="12" y2="2" stroke="#B45309" strokeWidth="0.8" />
        <line x1="10" y1="6" x2="12" y2="6" stroke="#B45309" strokeWidth="0.8" />
        <line x1="10" y1="10" x2="12" y2="10" stroke="#B45309" strokeWidth="0.8" />
      </g>

      {/* Delicate Green Sprout/Leaves */}
      <path d="M106 88C108 81 116 80 120 82C119 89 113 94 106 88Z" fill="#10B981" />
      <path d="M107 87C110 87 113 85 116 83" stroke="#047857" strokeWidth="1" strokeLinecap="round" />
      <path d="M128 86C131 80 138 81 140 84C139 90 134 94 128 86Z" fill="#34D399" />
    </motion.svg>
  );
}

// 2. Individual Form Educational Artwork Icons
function FormSpecificArtwork({ formKey }: { formKey: string }) {
  switch (formKey) {
    case "Form 1":
      return (
        <svg viewBox="0 0 90 70" fill="none" className="w-20 sm:w-24 h-16 sm:h-18 select-none pointer-events-none drop-shadow-2xs">
          <circle cx="45" cy="38" r="26" fill="#FFE8E3" fillOpacity="0.8" />
          <rect x="18" y="46" width="46" height="9" rx="2" fill="#E86B61" />
          <rect x="20" y="47.5" width="42" height="6" rx="1" fill="#FFF1EE" />
          <rect x="22" y="37" width="40" height="9" rx="2" fill="#F97316" />
          <rect x="24" y="38.5" width="36" height="6" rx="1" fill="#FFEDD5" />
          <rect x="56" y="28" width="16" height="24" rx="3" fill="#FFFFFF" stroke="#E86B61" strokeWidth="1.2" />
          <rect x="59" y="14" width="3" height="15" rx="1" fill="#3B82F6" />
          <rect x="65" y="12" width="3" height="17" rx="1" fill="#10B981" />
          <polygon points="59,14 60.5,10 62,14" fill="#FDE047" />
          <polygon points="65,12 66.5,8 68,12" fill="#FDE047" />
          <circle cx="28" cy="20" r="2" fill="#E86B61" />
        </svg>
      );
    case "Form 2":
      return (
        <svg viewBox="0 0 90 70" fill="none" className="w-20 sm:w-24 h-16 sm:h-18 select-none pointer-events-none drop-shadow-2xs">
          <circle cx="45" cy="38" r="26" fill="#FEF3C7" fillOpacity="0.8" />
          <path d="M22 48C28 46 38 46 44 48C50 46 60 46 66 48V34C60 32 50 32 44 34C38 32 28 32 22 34V48Z" fill="#FFFFFF" stroke="#E9A52E" strokeWidth="1.2" />
          <line x1="44" y1="34" x2="44" y2="48" stroke="#E9A52E" strokeWidth="1.2" />
          <g transform="translate(50, 10)">
            <circle cx="14" cy="14" r="10" fill="#60A5FA" />
            <path d="M9 12C12 10 16 11 18 14C17 18 13 20 9 18" fill="#34D399" />
            <ellipse cx="14" cy="14" rx="10" ry="4" stroke="#D97706" strokeWidth="1" fill="none" transform="rotate(-20 14 14)" />
            <path d="M14 24V28H10H18" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        </svg>
      );
    case "Form 3":
      return (
        <svg viewBox="0 0 90 70" fill="none" className="w-20 sm:w-24 h-16 sm:h-18 select-none pointer-events-none drop-shadow-2xs">
          <circle cx="45" cy="38" r="26" fill="#DCEBFF" fillOpacity="0.8" />
          <rect x="22" y="44" width="46" height="10" rx="2" fill="#438BE5" />
          <rect x="24" y="46" width="42" height="6" rx="1" fill="#EFF6FF" />
          <rect x="26" y="34" width="40" height="10" rx="2" fill="#60A5FA" />
          <g transform="translate(24, 12)">
            <polygon points="20,4 38,11 20,18 2,11" fill="#1E293B" />
            <polygon points="20,6 35,11 20,16 5,11" fill="#334155" />
            <path d="M10 14V22C10 25 30 25 30 22V14" fill="#1E293B" />
            <path d="M34 12V24" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="34" cy="24" r="1.5" fill="#F59E0B" />
          </g>
        </svg>
      );
    case "Form 4":
      return (
        <svg viewBox="0 0 90 70" fill="none" className="w-20 sm:w-24 h-16 sm:h-18 select-none pointer-events-none drop-shadow-2xs">
          <circle cx="45" cy="38" r="26" fill="#FED7E7" fillOpacity="0.8" />
          <rect x="24" y="24" width="36" height="38" rx="4" fill="#FFFFFF" stroke="#E55B91" strokeWidth="1.2" />
          <rect x="24" y="24" width="7" height="38" rx="2" fill="#E55B91" />
          <path d="M42 20V26H46V20L44 22L42 20Z" fill="#F43F5E" />
          <path d="M48 18V26H52V18L50 20L48 18Z" fill="#F59E0B" />
          <line x1="36" y1="36" x2="52" y2="36" stroke="#FCE7F3" strokeWidth="2" strokeLinecap="round" />
          <line x1="36" y1="42" x2="52" y2="42" stroke="#FCE7F3" strokeWidth="2" strokeLinecap="round" />
          <line x1="36" y1="48" x2="48" y2="48" stroke="#FCE7F3" strokeWidth="2" strokeLinecap="round" />
          <g transform="rotate(35 62 38)">
            <rect x="58" y="20" width="5" height="28" rx="1.5" fill="#F43F5E" />
            <polygon points="58,20 60.5,14 63,20" fill="#FDE047" />
          </g>
        </svg>
      );
    case "Form 5":
      return (
        <svg viewBox="0 0 90 70" fill="none" className="w-20 sm:w-24 h-16 sm:h-18 select-none pointer-events-none drop-shadow-2xs">
          <circle cx="45" cy="38" r="26" fill="#D1F2E4" fillOpacity="0.8" />
          <rect x="18" y="44" width="44" height="10" rx="2" fill="#28A77B" />
          <rect x="20" y="46" width="40" height="6" rx="1" fill="#ECFDF5" />
          <rect x="22" y="34" width="38" height="10" rx="2" fill="#10B981" />
          <g transform="translate(54, 20)">
            <polygon points="4,24 16,24 14,34 6,34" fill="#D97706" />
            <path d="M10 24V14" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M10 16C6 14 6 8 10 10" fill="#34D399" />
            <path d="M10 14C14 12 14 6 10 8" fill="#10B981" />
          </g>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 90 70" fill="none" className="w-20 sm:w-24 h-16 sm:h-18 select-none pointer-events-none drop-shadow-2xs">
          <circle cx="45" cy="38" r="26" fill="#E2E8F0" fillOpacity="0.8" />
          <rect x="20" y="40" width="50" height="12" rx="2" fill="#64748B" />
          <rect x="24" y="30" width="42" height="10" rx="2" fill="#94A3B8" />
        </svg>
      );
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Student Materials Page Component
───────────────────────────────────────────────────────────────────────────── */

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading]     = useState(true);
  const [preview, setPreview]     = useState<Material | null>(null);

  // Folder Explorer State (when a student clicks into a Form)
  const [selectedForm, setSelectedForm]         = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject]   = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Sort & View controls for inside folders
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy]     = useState<"newest" | "alpha">("newest");

  useEffect(() => {
    getMaterials()
      .then(setMaterials)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Organize resources into dynamic tree strictly by Form -> Subject -> Category -> Materials
  const folderTree = useMemo(() => {
    const tree: Record<string, FolderNode> = {};
    
    // Initialize PRIMARY_FORMS
    PRIMARY_FORMS.forEach((f) => {
      tree[f] = { label: f, subjects: {} };
    });

    for (const m of materials) {
      const form     = m.form     ?? "Form 1";
      const subject  = m.subject  ?? "பொதுவானவை";
      const category = m.category ?? "குறிப்புகள்";
      if (!tree[form]) tree[form] = { label: form, subjects: {} };
      if (!tree[form].subjects[subject])
        tree[form].subjects[subject] = { label: subject, categories: {} };
      if (!tree[form].subjects[subject].categories[category])
        tree[form].subjects[subject].categories[category] = [];
      tree[form].subjects[subject].categories[category].push(m);
    }

    // Numerical form sorting (Form 1 -> Form 2 -> Form 3 -> Form 4 -> Form 5)
    const sortedFormKeys = Object.keys(tree).sort((a, b) => {
      const numA = parseFormNumber(a);
      const numB = parseFormNumber(b);
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
    });

    const ordered: Record<string, FolderNode> = {};
    sortedFormKeys.forEach((f) => {
      if (PRIMARY_FORMS.includes(f) || Object.keys(tree[f].subjects).length > 0) {
        ordered[f] = tree[f];
      }
    });

    return ordered;
  }, [materials]);

  // Active form data when inside explorer
  const activeFormNode = selectedForm ? folderTree[selectedForm] : null;
  const activeFormStyle = selectedForm ? (FORM_STYLES[selectedForm] ?? DEFAULT_STYLE) : DEFAULT_STYLE;

  // Materials for active subject (all categories merged or selected category)
  const activeCategoryMaterials = useMemo(() => {
    if (!selectedForm || !selectedSubject || !activeFormNode) return [];
    
    let items: Material[] = [];
    if (selectedCategory) {
      items = activeFormNode.subjects[selectedSubject]?.categories[selectedCategory] || [];
    } else {
      items = Object.values(activeFormNode.subjects[selectedSubject]?.categories || {}).flat();
    }

    if (sortBy === "alpha") {
      return [...items].sort((a, b) => a.title.localeCompare(b.title));
    }
    return items;
  }, [selectedForm, selectedSubject, selectedCategory, activeFormNode, sortBy]);

  // Form entries strictly for the primary 5 forms
  const formEntries = useMemo(() => {
    return PRIMARY_FORMS.map((formKey) => {
      const node = folderTree[formKey] || { label: formKey, subjects: {} };
      return [formKey, node] as [string, FolderNode];
    });
  }, [folderTree]);

  // Navigate back one step in breadcrumb
  const handleBackStep = useCallback(() => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else if (selectedSubject) {
      setSelectedSubject(null);
    } else {
      setSelectedForm(null);
    }
  }, [selectedCategory, selectedSubject]);

  // Reset to main learning materials page
  const handleResetToForms = useCallback(() => {
    setSelectedForm(null);
    setSelectedSubject(null);
    setSelectedCategory(null);
  }, []);

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

      {/* ── Main Content Container ── */}
      <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-9 pb-12 sm:pb-16 space-y-7 sm:space-y-8">

        {/* ── 1. Learning Resources Hero Banner ── */}
        <section className="relative p-5 sm:p-8 rounded-[20px] sm:rounded-[24px] bg-gradient-to-r from-[#EBF5FF] via-[#F8FBFF] to-[#EDFAF4] border border-[#D5E8FA] shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Subtle Inner Accent Ring */}
          <div className="absolute inset-2.5 rounded-[16px] sm:rounded-[18px] border border-white/60 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-2 max-w-xl text-left w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/90 border border-[#C5E1FA] shadow-2xs">
                <div className="h-2 w-2 rounded-full bg-[#378BE7] animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-bold text-[#2874D4] font-jakarta tracking-wider uppercase">
                  DZM DIGITAL LIBRARY
                </span>
              </div>

              <h1 className="font-serif-tamil font-extrabold text-[#0F172A] text-xl sm:text-3xl lg:text-[2.2rem] leading-tight flex items-center gap-2 sm:gap-2.5">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-[#DDF5EC] border border-[#A7E5D1] text-[#169C87] flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <BookOpen className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                </div>
                <span>கற்றல் வளங்கள்</span>
              </h1>

              <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
                படிவ வாரியாக ஒழுங்குபடுத்தப்பட்ட தமிழ் இலக்கணம், இலக்கியம் மற்றும் பயிற்சிக் கையேடுகளை எளிதாகக் கண்டறியுங்கள்.
              </p>
            </div>

            {/* Educational Vector Illustration (Desktop & Tablet) */}
            <div className="flex-shrink-0 flex items-center gap-4">
              <div className="hidden sm:block">
                <LearningHeroIllustration className="w-36 sm:w-44 lg:w-48 h-24 sm:h-28" />
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Content Section: Main Form Folders OR Form Folder Explorer ── */}
        <section className="flex-1">
          {loading ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="min-h-[260px] rounded-2xl border border-slate-200 bg-white/70 animate-pulse"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
          ) : selectedForm ? (
            /* ── VIEW B: Dedicated Form Page (Clean Folder-Style Layout) ── */
            <div className="space-y-6">
              {/* Breadcrumb Navigation Toolbar (No Search Bar) */}
              <section className="p-3.5 sm:p-4 rounded-2xl bg-white/95 border border-slate-200/90 shadow-xs flex items-center justify-between flex-wrap gap-3">
                {/* Breadcrumb path */}
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold flex-wrap">
                  <button
                    onClick={handleResetToForms}
                    className="text-[#378BE7] hover:underline flex items-center gap-1.5 cursor-pointer font-tamil"
                  >
                    <BookOpen className="h-4 w-4 text-[#378BE7]" />
                    <span>கற்றல் வளங்கள்</span>
                  </button>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />

                  <button
                    onClick={() => { setSelectedSubject(null); setSelectedCategory(null); }}
                    className={cn(
                      "transition-colors cursor-pointer font-tamil",
                      !selectedSubject ? "text-[#0F172A] font-extrabold" : "text-[#378BE7] hover:underline"
                    )}
                  >
                    <span>{activeFormStyle.tamilLabel}</span>
                  </button>

                  {selectedSubject && (
                    <>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={cn(
                          "transition-colors cursor-pointer font-tamil",
                          !selectedCategory ? "text-[#0F172A] font-extrabold" : "text-[#378BE7] hover:underline"
                        )}
                      >
                        <span>{selectedSubject}</span>
                      </button>
                    </>
                  )}

                  {selectedCategory && (
                    <>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-[#0F172A] font-extrabold font-tamil">{selectedCategory}</span>
                    </>
                  )}
                </div>

                {/* Back Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBackStep}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer font-tamil"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>{selectedSubject ? "பின்செல்ல" : "கற்றல் வளங்கள்"}</span>
                  </button>
                </div>
              </section>

              {/* Explorer Levels Inside Form */}
              {!selectedSubject ? (
                /* Level 1: Subject Folders inside the selected Form */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: activeFormStyle.accentColor }}
                      />
                      <h2 className="font-serif-tamil font-bold text-base sm:text-lg text-[#0F172A]">
                        {activeFormStyle.tamilLabel} — பாடக் கோப்புறைகள்
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-[#378BE7]">
                      {Object.keys(activeFormNode?.subjects || {}).length} பாடங்கள்
                    </span>
                  </div>

                  {Object.keys(activeFormNode?.subjects || {}).length === 0 ? (
                    /* Empty Form State */
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="py-16 text-center rounded-[24px] bg-white border border-slate-200/90 shadow-xs p-8"
                    >
                      <div
                        className="h-14 w-14 rounded-2xl mb-3.5 mx-auto flex items-center justify-center"
                        style={{ backgroundColor: activeFormStyle.themeBg, color: activeFormStyle.accentColor }}
                      >
                        <Folder className="h-7 w-7" />
                      </div>
                      <h3 className="font-serif-tamil font-bold text-[#0F172A] text-base mb-1">
                        இந்தப் படிவத்திற்கு இன்னும் கற்றல் வளங்கள் பதிவேற்றப்படவில்லை
                      </h3>
                      <p className="font-tamil text-xs text-slate-500 max-w-md mx-auto mb-5">
                        ஆசிரியர் புதிய கற்றல் வளங்களைப் பதிவேற்றும் போது இங்கே கோப்புறைகளாகத் தோன்றும்.
                      </p>
                      <button
                        onClick={handleResetToForms}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>கற்றல் வளங்களுக்குத் திரும்பு</span>
                      </button>
                    </motion.div>
                  ) : (
                    /* Subject Folder Cards Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {Object.entries(activeFormNode?.subjects || {}).map(([sKey, sNode], idx) => {
                        const count = Object.values(sNode.categories).flat().length;
                        return (
                          <motion.div
                            key={sKey}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.04 }}
                            onClick={() => setSelectedSubject(sKey)}
                            className={cn(
                              "group relative p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer flex items-center justify-between select-none shadow-2xs hover:shadow-md hover:-translate-y-0.5",
                              activeFormStyle.borderColor,
                              activeFormStyle.folderHoverBg
                            )}
                          >
                            <div className="flex items-center gap-3.5 min-w-0 pr-2">
                              <div
                                className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 shadow-2xs"
                                style={{ backgroundColor: activeFormStyle.themeBg, color: activeFormStyle.accentColor }}
                              >
                                <Folder className="h-6 w-6" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-serif-tamil font-bold text-sm sm:text-base text-[#0F172A] truncate group-hover:text-[#0F172A]">
                                  {sKey}
                                </h3>
                                <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">
                                  {count} {count === 1 ? "வளம்" : "வளங்கள்"}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : !selectedCategory && Object.keys(activeFormNode?.subjects[selectedSubject]?.categories || {}).length > 1 ? (
                /* Level 2: Multiple Categories / Sub-folders inside Subject */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <h2 className="font-serif-tamil font-bold text-base sm:text-lg text-[#0F172A]">
                      {selectedSubject} — வள வகைகள்
                    </h2>
                    <span className="text-xs font-bold text-[#378BE7]">
                      {Object.keys(activeFormNode?.subjects[selectedSubject]?.categories || {}).length} வகைகள்
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {Object.entries(activeFormNode?.subjects[selectedSubject]?.categories || {}).map(([catKey, items], idx) => (
                      <motion.div
                        key={catKey}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                        onClick={() => setSelectedCategory(catKey)}
                        className={cn(
                          "group p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer flex items-center justify-between select-none shadow-2xs hover:shadow-md hover:-translate-y-0.5",
                          activeFormStyle.borderColor,
                          activeFormStyle.folderHoverBg
                        )}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 pr-2">
                          <div
                            className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 shadow-2xs"
                            style={{ backgroundColor: activeFormStyle.themeBg, color: activeFormStyle.accentColor }}
                          >
                            <FolderOpen className="h-6 w-6" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-serif-tamil font-bold text-sm sm:text-base text-[#0F172A] truncate">
                              {catKey}
                            </h3>
                            <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">
                              {items.length} {items.length === 1 ? "ஆவணம்" : "ஆவணங்கள்"}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Level 3: Files & Documents View inside Subject / Category */
                <div className="space-y-4">
                  {/* Category Header Toolbar with Sort & View Controls */}
                  <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-[#EAF4FF] text-[#2A75D3] flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-serif-tamil font-bold text-sm sm:text-base text-[#0F172A]">
                          {selectedCategory ? `${selectedSubject} · ${selectedCategory}` : selectedSubject}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          மொத்தம் {activeCategoryMaterials.length} ஆவணங்கள்
                        </p>
                      </div>
                    </div>

                    {/* Sort & Grid/List Controls */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2.5">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#378BE7] cursor-pointer"
                      >
                        <option value="newest">புதியவை முதலில்</option>
                        <option value="alpha">அகரவரிசை (A-Z)</option>
                      </select>

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
                  </div>

                  {/* Documents List */}
                  {activeCategoryMaterials.length === 0 ? (
                    <div className="py-14 text-center rounded-2xl bg-white border border-slate-200 p-6">
                      <FileText className="h-9 w-9 text-slate-300 mx-auto mb-2" />
                      <h4 className="font-serif-tamil font-bold text-[#0F172A] text-sm">
                        இந்தக் கோப்புறையில் ஆவணங்கள் எதுவும் இல்லை
                      </h4>
                    </div>
                  ) : (
                    <div className={cn(
                      "grid gap-3.5",
                      viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                    )}>
                      {activeCategoryMaterials.map((m) => (
                        <MaterialItemCard
                          key={m.id}
                          material={m}
                          onPreview={() => setPreview(m)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ── VIEW A: Main 5 Form Digital Library Cards (Only Form Folders) ── */
            <div className="space-y-6">
              {/* Informative Header Bar without Search */}
              <section className="p-3.5 sm:p-4 rounded-2xl bg-white/95 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[#EAF4FF] border border-[#C7E2FE] text-[#2874D4] flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Library className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="font-serif-tamil font-bold text-sm sm:text-base text-[#0F172A] leading-tight">
                      படிவ வாரியான கற்றல் கோப்புறைகள்
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      பாட வளங்களைக் காண விரும்பும் படிவத்தைத் தேர்வுசெய்யவும்
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                  <Layers className="h-3.5 w-3.5 text-[#378BE7]" />
                  <span>5 படிவங்கள் (Form 1 – Form 5)</span>
                </div>
              </section>

              {/* Clean 5 Form Folder Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
                {formEntries.map(([formKey, formNode], index) => {
                  const style = FORM_STYLES[formKey] ?? DEFAULT_STYLE;
                  const totalFiles = Object.values(formNode.subjects).flatMap((s) => Object.values(s.categories).flat()).length;

                  return (
                    <StudentFormCard
                      key={formKey}
                      formKey={formKey}
                      style={style}
                      totalFiles={totalFiles}
                      delay={0.08 + index * 0.06}
                      onExplore={() => {
                        setSelectedForm(formKey);
                        setSelectedSubject(null);
                        setSelectedCategory(null);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ── 3. Subtle Decorative Quote & Footer Divider ── */}
        {!selectedForm && (
          <section className="pt-4 pb-2 text-center select-none">
            <div className="inline-flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs max-w-lg mx-auto">
              <div className="flex items-center gap-2 text-[#378BE7] mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-widest font-jakarta">கல்வியின் பெருமை</span>
              </div>
              <p className="font-serif-tamil text-xs sm:text-sm font-bold text-[#0F172A] leading-relaxed">
                “நல்ல கற்றல் வழிகள் நல்ல மனிதர்களை உருவாக்கும்.”
              </p>
              <div className="flex items-center justify-center gap-2 mt-2 text-[10px] font-bold text-slate-400 font-jakarta uppercase tracking-wider">
                <span>Learn</span>
                <span>•</span>
                <span>Grow</span>
                <span>•</span>
                <span>Achieve</span>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ── Home Footer ── */}
      <HomeFooter />

      {/* ── PDF / Document Preview Modal ── */}
      {preview && (
        <div
          className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-tamil"
          onClick={() => setPreview(null)}
        >
          <div
            className="w-full max-w-4xl h-[90svh] sm:h-[85vh] bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-[#FAF9F6]">
              <div className="flex items-center gap-3 min-w-0 pr-3">
                <div className="h-9 w-9 rounded-xl bg-[#EAF4FF] border border-[#DCEBFF] flex items-center justify-center flex-shrink-0 text-[#378BE7]">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#0F172A] text-sm truncate">{preview.title}</p>
                  <p className="text-xs text-slate-500 font-medium">
                    {preview.form} · {preview.subject}{preview.category && ` · ${preview.category}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={preview.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#378BE7] hover:bg-[#2563EB] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>பதிவிறக்கம்</span>
                </a>
                <button
                  onClick={() => setPreview(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 bg-slate-100 overflow-hidden">
              {preview.fileType === "pdf" ? (
                <iframe src={preview.fileUrl} title={preview.title} className="w-full h-full border-0" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center bg-white">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#378BE7]">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-base mb-1">முன்னோட்டம் ஆதரிக்கப்படவில்லை</h4>
                    <p className="text-xs text-slate-500 max-w-md">
                      Word (DOC/DOCX) கோப்புகளை உலாவியில் நேரடியாக முன்னோட்டமிட முடியாது. கோப்பைத் திறந்து பார்க்க பதிவிறக்கவும்.
                    </p>
                  </div>
                  <a
                    href={preview.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#378BE7] hover:bg-[#2563EB] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Download className="h-4 w-4" />
                    <span>கோப்பைப் பதிவிறக்கு</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   StudentFormCard Component — Clean Digital Library Folder Card (No File Leak)
───────────────────────────────────────────────────────────────────────────── */

function StudentFormCard({
  formKey,
  style,
  totalFiles,
  delay,
  onExplore,
}: {
  formKey: string;
  style: FormStyleConfig;
  totalFiles: number;
  delay: number;
  onExplore: () => void;
  formNode?: FolderNode;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isEmpty = totalFiles === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE_EXPO }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onExplore}
      className="group relative flex flex-col w-full select-none cursor-pointer"
    >
      {/* ── Folder Top Tab Shape ── */}
      <motion.div
        animate={{ y: isHovered ? -2 : 0 }}
        transition={{ duration: 0.25 }}
        className={cn(
          "self-start inline-flex items-center gap-1.5 px-4 py-1.5 rounded-t-xl border-t border-x text-[11px] font-extrabold tracking-wider font-jakarta transition-all duration-300 z-10 -mb-[1px]",
          style.tabBg,
          style.tabBorder,
          style.tabText
        )}
      >
        <BookOpen className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.8} />
        <span>{style.label}</span>
      </motion.div>

      {/* ── Main Card Body (Clean Folder Container) ── */}
      <div
        className={cn(
          "relative flex flex-col justify-between w-full h-full min-h-[220px] p-5 sm:p-6 bg-white rounded-b-2xl rounded-tr-2xl border shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all duration-300 overflow-hidden",
          style.borderColor
        )}
        style={{
          boxShadow: isHovered ? `0 14px 32px -8px ${style.glowColor}` : "0 4px 20px rgba(0,0,0,0.03)",
        }}
      >
        {/* Top Colored Accent Stripe */}
        <div
          className="absolute top-0 inset-x-0 h-[3px] transition-opacity duration-300"
          style={{ backgroundColor: style.accentColor }}
        />

        {/* Top Meta Row: Badge + Dynamic Material Count */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
          <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10.5px] font-extrabold font-jakarta uppercase", style.badgeBg, style.badgeBorder, style.badgeText)}>
            <span>படிவம்</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/90 border border-slate-200/60">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: style.accentColor }}
            />
            <span className="text-[10px] font-bold text-slate-600 font-jakarta uppercase tracking-wider">
              {totalFiles} {totalFiles === 1 ? "MATERIAL" : "MATERIALS"}
            </span>
          </div>
        </div>

        {/* Middle Content: Title, Tamil Heading & Form-Specific Artwork */}
        <div className="relative z-10 flex items-center justify-between gap-3 my-2">
          <div className="space-y-0.5">
            <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A] font-jakarta tracking-tight">
              {style.label}
            </h3>
            <p className="text-base sm:text-lg font-extrabold font-serif-tamil text-[#0F172A]">
              {style.tamilLabel}
            </p>
            <p className="text-xs text-slate-500 font-medium font-tamil">
              {style.subtitle}
            </p>
          </div>

          {/* Form Specific Illustration Artwork */}
          <div className="flex-shrink-0">
            <FormSpecificArtwork formKey={formKey} />
          </div>
        </div>

        {/* Bottom Area: Prominent "திறந்து பார்க்க →" Button */}
        <div className="relative z-10 pt-4 mt-2 border-t border-slate-100">
          <button
            type="button"
            className={cn(
              "group/btn w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-tamil font-bold text-xs sm:text-sm transition-all duration-200 shadow-xs cursor-pointer",
              style.btnBg,
              style.btnHover
            )}
          >
            <span>{isEmpty ? "கோப்புறையைத் திறக்க" : "திறந்து பார்க்க"}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MaterialItemCard Component — Single File Row / Card for Students
───────────────────────────────────────────────────────────────────────────── */

function MaterialItemCard({
  material: m,
  onPreview,
}: {
  material: Material;
  onPreview: () => void;
}) {
  const isPdf = m.fileType === "pdf";

  return (
    <div className="group flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-[#378BE7]/50 hover:shadow-md transition-all duration-200 select-none">
      <div className="flex items-center gap-3 min-w-0 pr-2">
        {/* File Type Icon */}
        <div className={cn(
          "h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs",
          isPdf ? "bg-[#FFEAEA] border border-[#FFCCD2] text-[#E85D5D]" : "bg-[#EAF4FF] border border-[#DCEBFF] text-[#378BE7]"
        )}>
          <FileText className="h-5 w-5" />
        </div>

        {/* Title and Metadata */}
        <div className="flex flex-col min-w-0">
          <h4 className="font-bold text-xs sm:text-sm text-[#0F172A] truncate group-hover:text-[#378BE7] transition-colors">
            {m.title}
          </h4>
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[10.5px] sm:text-[11px] font-semibold text-slate-500 mt-0.5">
            <span className="text-[#378BE7] font-bold">{m.form ? m.form.replace(/Form\s*(\d)/i, "படிவம் $1") : "படிவம் 1"}</span>
            <span>•</span>
            <span>{m.subject || "பொதுவானவை"}</span>
            {m.category && (
              <>
                <span>•</span>
                <span className="text-slate-600 font-bold">{m.category}</span>
              </>
            )}
            {m.fileSize && (
              <>
                <span>•</span>
                <span className="text-emerald-600 font-bold">{formatBytes(m.fileSize)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: View & Download */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isPdf && (
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EAF4FF] hover:bg-[#DCEBFF] text-[#2874D4] border border-[#C5E1FA] text-xs font-bold transition-colors cursor-pointer"
            title="முன்னோட்டம்"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">பார்க்க</span>
          </button>
        )}
        <a
          href={m.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
          title="பதிவிறக்கம்"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">பதிவிறக்கு</span>
        </a>
      </div>
    </div>
  );
}
