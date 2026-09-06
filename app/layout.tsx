import "./globals.css";
import type { Metadata } from "next";
import { Poppins, Noto_Sans_Tamil, Noto_Serif_Tamil, Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-tamil",
  display: "swap",
});

const notoSerifTamil = Noto_Serif_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif-tamil",
  display: "swap",
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  metadataBase: new URL("https://sdpravinraj.github.io/DZM-Project/"),
  title: "DZM தமிழ் மையம்",
  description:
    "Tamil class materials, notes, and competition announcements from SMK Dato' Zulkifli Muhammad. Download notes, view competitions, and learn Tamil.",
  icons: {
    icon: [
      { url: `${basePath}/image.png`, type: "image/png" },
    ],
    shortcut: `${basePath}/image.png`,
    apple: `${basePath}/image.png`,
  },
  openGraph: {
    title: "DZM தமிழ் மையம்",
    description: "Tamil class materials and competitions — SMK Dato' Zulkifli Muhammad",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ta" className={`${poppins.variable} ${plusJakarta.variable} ${notoTamil.variable} ${notoSerifTamil.variable}`}>
      <body className="font-jakarta min-h-screen flex flex-col relative">

        {/* ── Full-page fixed background ── */}
        <div
          className="global-bg fixed inset-0 -z-10"
          aria-hidden="true"
        />

        <AuthProvider>
          <SiteHeader />
          <main className="flex-1 pt-16 sm:pt-20 relative z-10">{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
