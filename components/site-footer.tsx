"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Linkedin, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAssetPath } from "@/lib/utils";

export function SiteFooter() {
  const pathname = usePathname();
  const [links, setLinks] = useState({
    email: "",
    linkedin: "",
  });

  useEffect(() => {
    setLinks({
      email: "mailto:s.d.pravinraj@gmail.com",
      linkedin: "https://www.linkedin.com/in/pravinraj04/",
    });
  }, []);

  const isHome         = pathname === "/";
  const isMaterials    = pathname === "/materials";
  const isGallery      = pathname === "/gallery";
  const isEvents       = pathname === "/events";
  const isCompetitions = pathname === "/competitions";
  const isLogin        = pathname === "/login";
  const isDashboard    = pathname === "/dashboard";

  /* No expanded footer in layout for specific single-page layouts */
  if (isHome || isMaterials || isGallery || isEvents || isCompetitions || isLogin || isDashboard) return null;

  return (
    <footer className="relative overflow-hidden bg-[#0A102D] border-t border-[#D8B45A]/20 text-[#FAF7F0]">
      {/* Background radial highlight */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(ellipse at 80% 20%, rgba(216, 180, 90, 0.12) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 md:gap-12">

          {/* Left: Tamil Mozhi Kalagam Branding */}
          <div className="flex flex-col items-start gap-3.5 max-w-sm">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex-shrink-0 h-12 w-12 rounded-full bg-white/95 p-0.5 border border-[#D8B45A]/40 shadow-sm">
                <img
                  src={getAssetPath("/tamil-mozhi-kalagam.jpg")}
                  alt="Tamil Mozhi Kalagam logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="leading-tight">
                <span className="font-tamil font-extrabold text-[#FAF7F0] text-[16px] tracking-tight block group-hover:text-[#D8B45A] transition-colors">
                  தமிழ் மொழிக் கழகம்
                </span>
                <span className="text-[10px] sm:text-[10.5px] font-semibold text-[#D8B45A] tracking-wider block uppercase mt-0.5">
                  SMK Dato&apos; Zulkifli Muhammad
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-[13px] text-[#FAF7F0]/75 italic leading-relaxed pl-3.5 border-l-2 border-[#D8B45A]/50">
              Preserving Tamil language, literature, culture, and digital learning for future generations.
            </p>
          </div>

          {/* Right: Developer Signature Card */}
          <div className="w-full md:max-w-[420px] flex-shrink-0">
            <div className="rounded-[22px] p-5 sm:p-6 bg-[#111A42]/90 border border-[#D8B45A]/25 shadow-xl">
              <p className="uppercase font-bold tracking-[0.2em] mb-1 text-[9px] text-[#D8B45A]">
                Designed &amp; Developed By
              </p>
              <h3 className="text-[18px] sm:text-[20px] font-black text-[#FFFFFF] tracking-tight">
                Pravinraj Sivabathi
              </h3>
              <p className="text-[11px] text-[#D8B45A]/85 mt-0.5 mb-3.5 font-medium">
                Former Student of SMK Dato&apos; Zulkifli Muhammad
              </p>

              {/* Role badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { label: "Full Stack Developer", color: "#FAF7F0", bg: "rgba(216,180,90,0.12)", border: "rgba(216,180,90,0.30)" },
                  { label: "Data Engineer",        color: "#F6E5A9", bg: "rgba(216,180,90,0.12)", border: "rgba(216,180,90,0.30)" },
                  { label: "UI/UX Designer",       color: "#D8B45A", bg: "rgba(216,180,90,0.15)", border: "rgba(216,180,90,0.35)" },
                ].map(({ label, color, bg, border }) => (
                  <span
                    key={label}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ color, background: bg, border: `1px solid ${border}` }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="my-3.5 h-[1px] bg-[#D8B45A]/20" />

              {/* Touch friendly social icon buttons (44px min touch target) */}
              <div className="flex items-center gap-2.5">
                <a
                  href="https://sdpravinraj.github.io/eportfolio/"
                  title="View ePortfolio"
                  aria-label="Pravinraj ePortfolio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#D8B45A]/35 bg-[#172352] hover:bg-[#D8B45A]/20 hover:border-[#D8B45A] text-[#D8B45A] flex items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <Globe className="h-4 w-4" />
                </a>
                <a
                  href={links.linkedin || undefined}
                  title="LinkedIn"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#D8B45A]/35 bg-[#172352] hover:bg-[#D8B45A]/20 hover:border-[#D8B45A] text-[#D8B45A] flex items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href={links.email || undefined}
                  title="Email"
                  aria-label="Email"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#D8B45A]/35 bg-[#172352] hover:bg-[#D8B45A]/20 hover:border-[#D8B45A] text-[#D8B45A] flex items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-[#D8B45A]/20 bg-[#070B20]/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 font-tamil text-xs text-[#FAF7F0]/65 text-center sm:text-left">
          <p suppressHydrationWarning>
            © 2026 தமிழ் மொழிக் கழகம் · SMK Dato&apos; Zulkifli Muhammad
          </p>
          <p className="font-light">
            Designed &amp; Developed by{" "}
            <span className="font-semibold text-[#FAF7F0]/90">Pravinraj Sivabathi</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export function HomeFooter() {
  const [links, setLinks] = useState({
    email: "",
    linkedin: "",
  });

  useEffect(() => {
    setLinks({
      email: "mailto:s.d.pravinraj@gmail.com",
      linkedin: "https://www.linkedin.com/in/pravinraj04/",
    });
  }, []);

  return (
    <footer className="w-full bg-[#FAF7F0]/95 backdrop-blur-md border-t border-[#8D3823]/15 px-4 sm:px-8 lg:px-12 py-5 sm:py-4 select-none z-20 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        
        {/* Left: Logo & Tamil Mozhi Kalagam Branding */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 text-center sm:text-left justify-center sm:justify-start"
        >
          <img
            src={getAssetPath("/tamil-mozhi-kalagam.jpg")}
            alt="Tamil Mozhi Kalagam Logo"
            className="h-9 w-9 sm:h-9.5 sm:w-9.5 object-contain rounded-full bg-white/95 p-0.5 border border-[#8D3823]/25 flex-shrink-0 shadow-2xs"
          />
          <div className="flex flex-col leading-tight text-left">
            <span className="font-tamil font-bold text-[#1E0B05] text-[13.5px] sm:text-[14px]">
              தமிழ் மொழிக் கழகம்
            </span>
            <span className="text-[8.5px] sm:text-[9px] font-semibold text-[#8D3823] tracking-wider uppercase mt-0.5">
              SMK Dato&apos; Zulkifli Muhammad
            </span>
          </div>
        </motion.div>

        {/* Center: Tamil Motto — Language · Heritage · Knowledge */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center font-serif-tamil select-none py-1.5 px-4 rounded-xl bg-[#8D3823]/06 border border-[#8D3823]/10 max-w-full overflow-x-auto"
        >
          <span className="text-[13px] sm:text-[14.5px] tracking-wider font-semibold cursor-default text-[#2D160C] whitespace-nowrap">
            மொழி
          </span>
          <span className="text-[#8D3823] font-bold text-[10px] sm:text-[11px] px-2.5 sm:px-3 select-none">·</span>
          <span className="text-[13px] sm:text-[14.5px] tracking-wider font-semibold cursor-default text-[#2D160C] whitespace-nowrap">
            மரபு
          </span>
          <span className="text-[#8D3823] font-bold text-[10px] sm:text-[11px] px-2.5 sm:px-3 select-none">·</span>
          <span className="text-[13px] sm:text-[14.5px] tracking-wider font-semibold cursor-default text-[#2D160C] whitespace-nowrap">
            அறிவு
          </span>
        </motion.div>

        {/* Right: Developer Info & Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3 sm:gap-4 w-full md:w-auto text-center sm:text-right"
        >
          <div className="flex flex-col leading-tight items-center sm:items-end">
            <span className="text-[8px] font-bold text-[#8D3823] tracking-[0.16em] uppercase">
              DEVELOPED BY
            </span>
            <span className="text-[12px] sm:text-[12.5px] font-bold text-[#1E0B05] mt-[1px] tracking-tight">
              Pravinraj Sivabathi
            </span>
            <span className="text-[9px] sm:text-[9.5px] text-[#5A3525] mt-0.5 font-medium">
              Junior Data Engineer
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="https://sdpravinraj.github.io/eportfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 sm:w-10 sm:h-10 rounded-full border border-[#8D3823]/25 bg-white text-[#8D3823] hover:border-[#8D3823] hover:bg-[#8D3823]/10 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-2xs"
              title="View ePortfolio"
              aria-label="Pravinraj ePortfolio"
            >
              <Globe className="h-4 w-4" />
            </a>
            <a
              href={links.linkedin || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 sm:w-10 sm:h-10 rounded-full border border-[#8D3823]/25 bg-white text-[#8D3823] hover:border-[#8D3823] hover:bg-[#8D3823]/10 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-2xs"
              title="LinkedIn"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={links.email || undefined}
              className="w-11 h-11 sm:w-10 sm:h-10 rounded-full border border-[#8D3823]/25 bg-white text-[#8D3823] hover:border-[#8D3823] hover:bg-[#8D3823]/10 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-2xs"
              title="Email"
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

      </div>
    </footer>
  );
}
