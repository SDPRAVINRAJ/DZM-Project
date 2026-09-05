import { supabase } from "./supabase";

export type UploadProgressCallback = (progress: number) => void;

export interface UploadResult {
  url: string;
  storagePath: string;
}

/* ---------------------------------------------------------------------------
   Sanitize a filename: lowercase, hyphens only, date suffix.
   "Pravinraj Notes Final.pdf" -> "pravinraj-notes-final-20260802.pdf"
--------------------------------------------------------------------------- */
export function sanitizeFileName(original: string): string {
  const ext = original.split(".").pop()?.toLowerCase() ?? "pdf";
  const base = original
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${base || "file"}-${date}.${ext}`;
}

/* ---------------------------------------------------------------------------
   Mappings for Tamil form, subject and category names to ASCII slugs for storage
--------------------------------------------------------------------------- */
const SUBJECT_SLUGS: Record<string, string> = {
  "தமிழ் இலக்கணம்": "tamil-grammar",
  "இலக்கியம்": "literature",
  "கட்டுரை": "essay",
  "சொல்லகராதி": "vocabulary",
  "கவிதை": "poetry",
  "பொதுப் பாடம்": "general",
  "பிற": "other",
};

const CATEGORY_SLUGS: Record<string, string> = {
  "குறிப்புகள்": "notes",
  "பயிற்சிகள்": "exercises",
  "கடந்த காலத் தேர்வுகள்": "past-papers",
  "பயிற்சிக் கையேடு": "handbook",
  "குறிப்புதவி நூல்": "reference",
  "விளக்கக்காட்சி": "presentation",
};

function toSafeSlug(str: string, map?: Record<string, string>): string {
  if (map && map[str]) return map[str];
  const cleaned = str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (cleaned) return cleaned;
  // If no ASCII characters (e.g. arbitrary Tamil text), create a stable hash slug
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return `item-${Math.abs(hash).toString(36)}`;
}

/* ---------------------------------------------------------------------------
   Build the hierarchical storage path.
   "Form 1" / "தமிழ் இலக்கணம்" / "குறிப்புகள்" / "file.pdf" ->
   "form-1/tamil-grammar/notes/file.pdf"
--------------------------------------------------------------------------- */
export function buildStoragePath(
  form: string,
  subject: string,
  category: string,
  fileName: string
): string {
  const formSlug = toSafeSlug(form);
  const subjectSlug = toSafeSlug(subject, SUBJECT_SLUGS);
  const categorySlug = toSafeSlug(category, CATEGORY_SLUGS);
  return `${formSlug}/${subjectSlug}/${categorySlug}/${fileName}`;
}

/* ---------------------------------------------------------------------------
   Generate a smart display-friendly filename from the material title.
--------------------------------------------------------------------------- */
export function generateSmartFileName(
  title: string,
  _form: string,
  _subject: string,
  originalName: string
): string {
  const ext = originalName.split(".").pop()?.toLowerCase() ?? "pdf";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6);
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 35);
  return `${slug || "material"}-${date}-${rand}.${ext}`;
}

export function generateFileName(original: string): string {
  return sanitizeFileName(original);
}

/* ---------------------------------------------------------------------------
   Upload a file to Supabase Storage with live progress reporting.
--------------------------------------------------------------------------- */
export async function uploadFile(
  storagePath: string,
  file: File | Blob,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  const t0 = performance.now();
  const elapsed = () => `+${(performance.now() - t0).toFixed(1)} ms`;
  const log = (msg: string) =>
    console.log(`[Upload] ${msg.padEnd(42)} ${elapsed()}`);

  const fileName = storagePath.split("/").pop() ?? "file";
  console.group(`Upload: ${fileName} (${(file.size / 1024).toFixed(1)} KB)`);
  log("Upload started");

  // 1. Validate
  if (!file || file.size === 0) {
    console.groupEnd();
    throw new Error("File is empty or missing.");
  }
  if (file.size > 50 * 1024 * 1024) {
    console.groupEnd();
    throw new Error("File exceeds the 50 MB limit.");
  }
  log("Validation passed");

  // 2. Upload to Supabase Storage
  log("Calling Supabase storage.upload()...");

  try {
    const { data, error } = await (supabase.storage
      .from("materials")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: true,
        onUploadProgress: (evt: { loaded: number; total?: number }) => {
          if (evt.total) {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            onProgress?.(pct);
          }
        },
      } as Parameters<ReturnType<typeof supabase.storage.from>["upload"]>[2]) as ReturnType<ReturnType<typeof supabase.storage.from>["upload"]>);

    if (error) {
      console.error("[Upload] Supabase Storage error:", JSON.stringify(error, null, 2));
      console.error("[Upload] Error message:", error.message);
      console.error("[Upload] Error name:", error.name);
      console.error("[Upload] Storage path was:", storagePath);
      console.groupEnd();
      throw new Error(`Upload failed: ${error.message}`);
    }

    log("Supabase upload complete");

    // 3. Get public URL
    const { data: urlData } = supabase.storage.from("materials").getPublicUrl(storagePath);
    const url = urlData.publicUrl;
    log("Public URL generated");

    console.groupEnd();
    return { url, storagePath };
  } catch (err: unknown) {
    console.groupEnd();
    if (err instanceof Error) {
      if (err.message.includes("Failed to fetch")) {
        throw new Error("Upload failed: Failed to fetch (Check NEXT_PUBLIC_SUPABASE_URL in .env.local — make sure the project URL is reachable and the server is restarted).");
      }
      throw err;
    }
    throw new Error(`Upload failed: ${String(err)}`);
  }
}

/* ---------------------------------------------------------------------------
   Delete a file from Supabase Storage.
   Accepts either a storage path ("Form 4/...") or a full public URL.
--------------------------------------------------------------------------- */
export async function deleteFile(storagePathOrUrl: string): Promise<void> {
  if (!storagePathOrUrl) return;

  let path = storagePathOrUrl;
  const marker = "/object/public/materials/";
  if (storagePathOrUrl.includes(marker)) {
    path = decodeURIComponent(storagePathOrUrl.split(marker)[1].split("?")[0]);
  }

  try {
    const { error } = await supabase.storage.from("materials").remove([path]);
    if (error) {
      console.error("[Storage] Delete error:", error.message, "path:", path);
    }
  } catch (err) {
    console.warn("[Delete] Could not delete file from Supabase Storage:", err);
  }
}

/* ---------------------------------------------------------------------------
   Hash utility - call AFTER upload, never before.
--------------------------------------------------------------------------- */
export function computeFileHash(file: File): Promise<string | null> {
  return file
    .arrayBuffer()
    .then((buffer) => crypto.subtle.digest("SHA-256", buffer))
    .then((hashBuffer) =>
      Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    )
    .catch(() => null);
}
