import { TRPCError } from "@trpc/server";

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export function sanitizeFileName(fileName: string): string {
  const normalized = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/-\./g, ".")
    .replace(/^[-.]+|[-.]+$/g, "");

  return (normalized || "upload").slice(0, 120);
}

export function decodeAndValidateUpload(input: {
  contentBase64: string;
  contentType: string;
}): Buffer {
  if (!ALLOWED_FILE_TYPES.has(input.contentType)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Only JPG, PNG, WEBP, or PDF files are accepted.",
    });
  }

  if (!/^[A-Za-z0-9+/=]+$/.test(input.contentBase64)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "The file payload is invalid." });
  }

  const bytes = Buffer.from(input.contentBase64, "base64");
  if (bytes.length === 0 || bytes.length > MAX_FILE_BYTES) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Files must be between 1 byte and 5 MB.",
    });
  }

  return bytes;
}
