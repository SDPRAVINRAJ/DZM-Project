import imageCompression from "browser-image-compression";

export interface CompressionResult {
  file: File | Blob;
  originalSize: number;
  compressedSize: number;
}

/**
 * Compress an image file using a web worker so the UI thread stays responsive.
 * Only called for images (competition photos, teacher profile photo).
 * PDFs are uploaded raw — pdf-lib "compression" is CPU-heavy and rarely reduces size.
 */
export async function compressImage(file: File): Promise<CompressionResult> {
  const originalSize = file.size;
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.6,
    maxWidthOrHeight: 1280,
    useWebWorker: true,     // stays off the main thread
    initialQuality: 0.80,
  });
  return { file: compressed, originalSize, compressedSize: compressed.size };
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 1) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/**
 * Smart file handler:
 * - Images → compress (web worker, non-blocking)
 * - PDFs   → pass through raw (no pdf-lib; avoids double-read + CPU spike)
 * - Others → pass through raw
 *
 * This is the key performance fix: pdf-lib re-serialisation blocked the UI
 * for 1-3 seconds on every file selection AND read the file a second time.
 */
export async function compressFile(file: File): Promise<CompressionResult> {
  if (file.type.startsWith("image/")) return compressImage(file);
  // For PDFs and docs: skip compression entirely — upload the raw File.
  return { file, originalSize: file.size, compressedSize: file.size };
}
