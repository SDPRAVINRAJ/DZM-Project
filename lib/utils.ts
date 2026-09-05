import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Timestamp } from 'firebase/firestore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFirestoreDate(value: Timestamp | Date | null | undefined): string {
  if (!value) return "";
  const d = value instanceof Timestamp ? value.toDate() : value;
  return d.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Validates and normalizes Google Drive or Google Photos album/folder URLs.
 */
export function normalizeAndValidateDriveUrl(rawUrl?: string): {
  isValid: boolean;
  normalizedUrl: string;
  error?: string;
} {
  if (!rawUrl || !rawUrl.trim()) {
    return {
      isValid: false,
      normalizedUrl: "",
      error: "Google Drive படத்தொகுப்பு இணைப்பை உள்ளிடவும்.",
    };
  }

  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    // Check that host is a valid domain (e.g. contains at least one dot)
    if (!host || !host.includes(".")) {
      return {
        isValid: false,
        normalizedUrl: url,
        error: "சரியான Google Drive படத்தொகுப்பு இணைப்பை உள்ளிடவும் (எ.கா: https://drive.google.com/drive/folders/...).",
      };
    }

    return {
      isValid: true,
      normalizedUrl: url,
    };
  } catch {
    return {
      isValid: false,
      normalizedUrl: url,
      error: "சரியான இணைப்பு வடிவத்தை உள்ளிடவும் (எ.கா: https://drive.google.com/drive/folders/...).",
    };
  }
}

