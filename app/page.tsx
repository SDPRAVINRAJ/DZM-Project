"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";
import { HomeFooter } from "@/components/site-footer";
import { getAssetPath } from "@/lib/utils";

export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = ((clientX / innerWidth) - 0.5) * 2.5; // -1.25px to +1.25px
    const y = ((clientY / innerHeight) - 0.5) * 2.5; // -1.25px to +1.25px
    setMousePos({ x, y });
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative flex flex-col flex-1 min-h-[100svh] -mt-16 sm:-mt-20 pt-16 sm:pt-20 bg-[#FAF7F0] font-tamil text-[#1E0B05] overflow-x-hidden justify-between select-none"
    >
      {/* ── Subtle Background Parchment Texture & Tamil Manuscript Motifs ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] overflow-hidden">
        {/* Repeating faint Tamil letter motifs */}
        <div className="absolute -top-10 -left-10 text-[140px] sm:text-[180px] font-serif-tamil text-[#8D3823] select-none leading-none">
          அ
        </div>
        <div className="absolute top-1/3 left-1/4 text-[100px] sm:text-[130px] font-serif-tamil text-[#8D3823] select-none leading-none">
          ழ
        </div>
        <div className="absolute bottom-20 left-8 sm:left-12 text-[120px] sm:text-[150px] font-serif-tamil text-[#8D3823] select-none leading-none">
          ஔ
        </div>
        <div className="absolute top-1/4 right-1/3 text-[110px] sm:text-[140px] font-serif-tamil text-[#8D3823] select-none leading-none">
          க
        </div>
      </div>

      {/* ── Warm Radial Glow Behind Bharathiyar Portrait (Cream -> Transparent) ── */}
      <div
        className="absolute top-1/2 right-[5%] sm:right-[12%] -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] rounded-full pointer-events-none opacity-60 sm:opacity-70 blur-2xl sm:blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(248, 241, 229, 0.95) 0%, rgba(245, 235, 218, 0.4) 50%, transparent 75%)",
        }}
      />

      {/* ── Continuous Bharathiyar Background Artwork (Desktop: Full Artwork | Mobile: Top-Right Elegant Motif) ── */}
      {/* Desktop Version */}
      <motion.div
        initial={{ opacity: 0, x: 18 }}
        animate={{
          opacity: 1,
          x: mousePos.x,
          y: mousePos.y,
        }}
        transition={{
          opacity: { duration: 0.9, delay: 0.05, ease: [0.16, 1, 0.3, 1] },
          x: { duration: 0.35, ease: "easeOut" },
          y: { duration: 0.35, ease: "easeOut" },
        }}
        className="hidden md:flex absolute inset-0 size-full pointer-events-none justify-end"
      >
        <div className="relative w-full h-full">
          <img
            src={getAssetPath("/bharathiyar-bg.jpg")}
            alt="Tamil poet ink portrait with palm-leaf manuscript and Tamil letterforms"
            width={1920}
            height={1088}
            loading="eager"
            decoding="async"
            className="absolute inset-0 size-full object-cover object-[84%_center] pointer-events-none filter brightness-[0.98] contrast-[1.02]"
          />

          {/* Left edge soft fade mask so sketch naturally blends seamlessly into the parchment */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, #FAF7F0 0%, #FAF7F0 38%, rgba(250, 247, 240, 0.88) 55%, rgba(250, 247, 240, 0.2) 75%, transparent 100%)",
            }}
          />
        </div>
      </motion.div>

      {/* Mobile / Tablet Lightweight Artwork Watermark (Never covers text) */}
      <div className="block md:hidden absolute -right-6 top-12 w-[260px] xs:w-[300px] h-[320px] pointer-events-none opacity-25 overflow-hidden">
        <img
          src={getAssetPath("/bharathiyar-bg.jpg")}
          alt="Tamil poet artwork watermark"
          className="size-full object-cover object-top filter brightness-[0.98] contrast-[1.02]"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 75% 25%, transparent 20%, #FAF7F0 85%)",
          }}
        />
      </div>

      {/* ── Top Subtle Blend for Navigation Area ── */}
      <div
        className="absolute inset-x-0 top-0 h-20 sm:h-28 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(250, 247, 240, 0.95) 0%, rgba(250, 247, 240, 0) 100%)",
        }}
      />

      {/* ── Refined Vertical Tamil Ornamental Line on Right Edge (Desktop only) ── */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "top" }}
        className="hidden xl:flex flex-col items-center gap-3 absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none select-none text-[#8D3823]/30"
      >
        <div className="h-16 w-px bg-gradient-to-b from-transparent via-[#8D3823]/30 to-[#8D3823]/50" />
        <span className="text-[11px] tracking-[0.3em] uppercase [writing-mode:vertical-rl] font-serif-tamil text-[#8D3823]/40">
          தமிழ் மரபு
        </span>
        <div className="h-16 w-px bg-gradient-to-b from-[#8D3823]/50 via-[#8D3823]/30 to-transparent" />
      </motion.div>

      {/* ── Hero Content Section ── */}
      <section className="relative isolate flex-1 flex flex-col justify-center overflow-hidden py-6 sm:py-10 lg:py-14">
        <div className="relative mx-auto flex w-full max-w-7xl items-center px-4 sm:px-8 lg:px-12">
          <div className="max-w-2xl lg:max-w-xl xl:max-w-2xl">
            
            {/* Eyebrow badge — Line expands + Book icon + Text */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
                className="text-[#8D3823] p-1 rounded-md bg-[#8D3823]/08 border border-[#8D3823]/20 flex-shrink-0"
              >
                <BookOpen className="h-3.5 w-3.5" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
                className="h-px w-6 sm:w-10 bg-[#8D3823]/50 flex-shrink-0"
              />
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] sm:tracking-[0.28em] text-[#8D3823] uppercase truncate max-w-[230px] xs:max-w-none"
              >
                Tamil Language • Literature • Culture
              </motion.p>
            </div>

            {/* Main Title — Balanced 4-line structure with unbreakable "கலை &" */}
            <h1 className="mt-3.5 sm:mt-5 font-serif-tamil text-[clamp(32px,8vw,56px)] leading-[1.18] sm:leading-[1.16] font-extrabold tracking-tight text-[#1E0B05]">
              {/* Line 1 */}
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                தமிழ் மொழி,
              </motion.span>
              
              {/* Line 2 — "கலை &" together on one unbreakable line */}
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="block whitespace-nowrap"
              >
                கலை &amp;
              </motion.span>
              
              {/* Line 3 (Rich Terracotta/Bronze Shimmer Accent) */}
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="text-shimmer block"
              >
                பண்பாட்டின்
              </motion.span>

              {/* Line 4 */}
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                பாசறை
              </motion.span>
            </h1>

            {/* Crimson & Terracotta divider line */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.52, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
              className="mt-4 sm:mt-6 h-[1.5px] w-20 sm:w-28 bg-[linear-gradient(90deg,#8D3823_0%,#B85338_60%,transparent_100%)] rounded-full"
            />

            {/* Description — Readable line-height & highlighted key terms */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.58, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3.5 sm:mt-5 max-w-xl font-serif-tamil text-[15px] sm:text-[17.5px] leading-[1.7] sm:leading-[1.8] text-[#382017]"
            >
              தமிழ் என் மொழி மட்டுமல்ல —{" "}
              <span className="font-semibold text-[#8D3823]">என் சிந்தனையின் உயிர்</span>.
              சொல்லில் <span className="font-semibold text-[#8D3823]">இனிமை</span>,
              இலக்கியத்தில் செழுமை, தலைமுறைகள் தாண்டியும் ஒலிக்கும்.
            </motion.p>

            {/* Subtle Classical Tamil Quote Element (Low Opacity Calligraphic Style) */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.68, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 sm:mt-6 pt-3 sm:pt-3.5 border-t border-[#8D3823]/12 max-w-md flex items-start gap-2.5 opacity-90"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#8D3823]/60 flex-shrink-0 mt-0.5" />
              <p className="font-serif-tamil text-[12.5px] sm:text-[13.5px] italic text-[#6A4030] leading-relaxed">
                “யாதும் ஊரே யாவரும் கேளிர்”{" "}
                <span className="text-[11px] sm:text-[11.5px] not-italic text-[#8D3823]/80 block sm:inline sm:ml-1 font-medium">
                  — கணியன் பூங்குன்றனார்
                </span>
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Transparent Home Footer inside the SAME background container */}
      <HomeFooter />

      {/* Custom Styles */}
      <style>{`
        .text-shimmer {
          background: linear-gradient(
            90deg,
            #8D3823 0%,
            #8D3823 25%,
            #D18A45 50%,
            #8D3823 75%,
            #8D3823 100%
          );
          background-size: 250% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s 1 forwards;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          65%, 100% {
            background-position: 200% center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .text-shimmer {
            animation: none !important;
            background: #8D3823;
            -webkit-background-clip: unset;
            -webkit-text-fill-color: #8D3823;
            background-clip: unset;
          }
        }
      `}</style>
    </div>
  );
}
