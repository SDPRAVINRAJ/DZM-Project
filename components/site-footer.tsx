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

  /* No footer in layout for Home, Materials, Gallery, Events, Competitions, Login, or Dashboard pages */
  if (isHome || isMaterials || isGallery || isEvents || isCompetitions || isLogin || isDashboard) return null;

  // Fallback expanded footer for other pages
  return (
    <footer className="relative overflow-hidden bg-navy border-t border-gold/15">
      <div className="mx-auto max-w-5xl px-5 sm:px-8 pt-9 pb-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 md:gap-10">

          {/* Left: Tamil Mozhi Kalagam Branding */}
          <div className="flex flex-col items-start gap-3 flex-shrink-0 max-w-[220px]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex-shrink-0 h-11 w-11 rounded-full bg-white/95 p-0.5 border border-gold/30">
                <img src={getAssetPath("/tamil-mozhi-kalagam.jpg")} alt="Tamil Mozhi Kalagam logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <div className="leading-tight">
                <span className="font-tamil font-extrabold text-cream text-[15px] tracking-tight block">
                  தமிழ் மொழிக் கழகம்
                </span>
                <span className="text-[10px] font-medium text-gold/70 tracking-wide block mt-px">
                  SMK Dato&apos; Zulkifli Muhammad
                </span>
              </div>
            </Link>
            <p className="text-[11px] text-cream/60 italic font-light leading-relaxed pl-3 text-left border-l-2 border-gold/40">
              Preserving Tamil language,<br />culture and learning for<br />future generations.
            </p>
          </div>

          {/* Right: Developer Signature Card */}
          <div className="w-full md:max-w-[400px] flex-shrink-0">
            <div className="rounded-[20px] p-5 sm:p-6 bg-navy/60 border border-gold/20 shadow-md">
              <p className="uppercase font-bold tracking-[0.2em] mb-0.5 text-[8.5px] text-gold">
                Designed &amp; Developed By
              </p>
              <h3 className="text-[18px] font-black text-cream tracking-tight">
                Pravinraj Sivabathi
              </h3>
              <p className="text-[10.5px] text-gold/60 mt-0.5 mb-3">
                Former Student of SMK Dato&apos; Zulkifli Muhammad
              </p>

              {/* Role badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[
                  { label: "Full Stack Developer", color: "#F7F5EF", bg: "rgba(216,180,90,0.08)", border: "rgba(216,180,90,0.18)" },
                  { label: "Data Engineer",        color: "#E5C77A", bg: "rgba(216,180,90,0.08)", border: "rgba(216,180,90,0.22)" },
                  { label: "UI/UX Designer",       color: "#D8B45A", bg: "rgba(216,180,90,0.12)", border: "rgba(216,180,90,0.28)" },
                ].map(({ label, color, bg, border }) => (
                  <span
                    key={label}
                    className="text-[9px] font-semibold px-2.5 py-[3px] rounded-full"
                    style={{ color, background: bg, border: `1px solid ${border}` }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="my-3.5 h-[1px] bg-gold/15" />

              <div className="flex items-center gap-2">
                <a
                  href="https://sdpravinraj.github.io/eportfolio/"
                  title="View ePortfolio"
                  aria-label="Pravinraj ePortfolio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full border border-gold/25 hover:border-gold hover:bg-gold/10 hover:shadow-[0_0_6px_rgba(216,180,90,0.2)] text-gold transition-all duration-300 hover:-translate-y-[2px]"
                >
                  <Globe className="h-3.5 w-3.5" />
                </a>
                <a
                  href={links.linkedin || undefined}
                  title="LinkedIn"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full border border-gold/25 hover:border-gold hover:bg-gold/10 hover:shadow-[0_0_6px_rgba(216,180,90,0.2)] text-gold transition-all duration-300 hover:-translate-y-[2px]"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                </a>
                <a
                  href={links.email || undefined}
                  title="Email"
                  aria-label="Email"
                  className="p-1.5 rounded-full border border-gold/25 hover:border-gold hover:bg-gold/10 hover:shadow-[0_0_6px_rgba(216,180,90,0.2)] text-gold transition-all duration-300 hover:-translate-y-[2px]"
                >
                  <Mail className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-gold/15">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 font-tamil text-[11px] text-cream/40">
          <p suppressHydrationWarning>
            © 2026 தமிழ் மொழிக் கழகம் · SMK Dato&apos; Zulkifli Muhammad
          </p>
          <p className="font-light">
            Designed &amp; Developed by{" "}
            <span className="font-semibold text-cream/60">Pravinraj Sivabathi</span>
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
    <footer className="w-full bg-[#FAF7F0]/90 backdrop-blur-md border-t border-[#8D3823]/14 flex items-center justify-between px-5 sm:px-8 lg:px-12 py-3.5 sm:py-4 h-16 sm:h-18 select-none z-20 relative">
      {/* Left: Logo & Tamil Mozhi Kalagam Branding */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3"
      >
        <img
          src={getAssetPath("/tamil-mozhi-kalagam.jpg")}
          alt="Tamil Mozhi Kalagam Logo"
          className="h-8 sm:h-9 w-auto object-contain rounded-full bg-white/95 p-0.5 border border-[#8D3823]/25 flex-shrink-0"
        />
        <div className="flex flex-col leading-tight">
          <span className="font-tamil font-bold text-[#1E0B05] text-[13px] sm:text-[13.5px]">
            தமிழ் மொழிக் கழகம்
          </span>
          <span className="text-[8.5px] sm:text-[9px] font-semibold text-[#8D3823] tracking-wider uppercase mt-0.5 hidden sm:block">
            SMK Dato&apos; Zulkifli Muhammad
          </span>
        </div>
      </motion.div>

      {/* Center: Tamil Motto — Language · Heritage · Knowledge */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:flex items-center font-serif-tamil select-none"
      >
        <span className="text-[14.5px] sm:text-[15.5px] tracking-wider font-semibold cursor-default text-[#2D160C]">
          மொழி
        </span>
        <span className="text-[#8D3823] font-bold text-[11px] px-2.5 sm:px-3.5 select-none">·</span>
        <span className="text-[14.5px] sm:text-[15.5px] tracking-wider font-semibold cursor-default text-[#2D160C]">
          மரபு
        </span>
        <span className="text-[#8D3823] font-bold text-[11px] px-2.5 sm:px-3.5 select-none">·</span>
        <span className="text-[14.5px] sm:text-[15.5px] tracking-wider font-semibold cursor-default text-[#2D160C]">
          அறிவு
        </span>
      </motion.div>

      {/* Right: Developer Info & Social Links */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3.5 text-right"
      >
        <div className="hidden lg:flex flex-col leading-tight text-right">
          <span className="text-[8px] font-bold text-[#8D3823] tracking-[0.18em] uppercase">
            DEVELOPED BY
          </span>
          <span className="text-[12.5px] font-bold text-[#1E0B05] mt-[1px] tracking-tight">
            Pravinraj Sivabathi
          </span>
          <span className="text-[9.5px] text-[#5A3525] mt-0.5 font-medium">
            Junior Data Engineer
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href="https://sdpravinraj.github.io/eportfolio/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 sm:p-2 rounded-full border border-[#8D3823]/25 bg-white/60 text-[#8D3823] hover:border-[#8D3823] hover:bg-[#8D3823]/10 transition-all duration-200 hover:scale-[1.05]"
            title="View ePortfolio"
            aria-label="Pravinraj ePortfolio"
          >
            <Globe className="h-3.5 w-3.5" />
          </a>
          <a
            href={links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 sm:p-2 rounded-full border border-[#8D3823]/25 bg-white/60 text-[#8D3823] hover:border-[#8D3823] hover:bg-[#8D3823]/10 transition-all duration-200 hover:scale-[1.05]"
            title="LinkedIn"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-3.5 w-3.5" />
          </a>
          <a
            href={links.email}
            className="p-1.5 sm:p-2 rounded-full border border-[#8D3823]/25 bg-white/60 text-[#8D3823] hover:border-[#8D3823] hover:bg-[#8D3823]/10 transition-all duration-200 hover:scale-[1.05]"
            title="Email"
            aria-label="Email"
          >
            <Mail className="h-3.5 w-3.5" />
          </a>
        </div>
      </motion.div>
    </footer>
  );
}
