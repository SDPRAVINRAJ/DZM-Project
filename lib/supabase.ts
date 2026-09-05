import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (typeof window !== "undefined" || process.env.NODE_ENV !== "production") {
  console.log("[Supabase Init] URL:", url ? url : "MISSING");
  console.log("[Supabase Init] Key Exists:", !!key);
}

if (!url) {
  throw new Error("[Supabase] NEXT_PUBLIC_SUPABASE_URL is missing in environment variables.");
}

if (!key) {
  throw new Error("[Supabase] Neither NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY nor NEXT_PUBLIC_SUPABASE_ANON_KEY is set in environment variables.");
}

// Singleton client
export const supabase = createClient(url, key);

