import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { decodeAndValidateUpload, sanitizeFileName } from "./fileUploadValidation";

describe("file upload validation", () => {
  it("normalizes unsafe file names without changing the extension", () => {
    expect(sanitizeFileName(" Invoice April 2026!!.PDF ")).toBe("invoice-april-2026.pdf");
  });

  it("accepts a small permitted payload", () => {
    expect(decodeAndValidateUpload({ contentType: "image/png", contentBase64: "aGVsbG8=" }).toString()).toBe("hello");
  });

  it("rejects unsupported media types", () => {
    expect(() => decodeAndValidateUpload({ contentType: "application/zip", contentBase64: "aGVsbG8=" })).toThrow(TRPCError);
  });
});
