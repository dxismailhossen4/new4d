import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  createStoredFile: vi.fn(),
  getStoredFileForUser: vi.fn(),
  listStoredFilesForUser: vi.fn(),
}));
const storageMocks = vi.hoisted(() => ({ storageGet: vi.fn(), storagePut: vi.fn() }));

vi.mock("./db", () => dbMocks);
vi.mock("./storage", () => storageMocks);

import { appRouter } from "./routers";

function contextFor(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

const owner = {
  id: 41,
  openId: "owner-41",
  email: "owner@example.com",
  name: "Owner",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const otherUser = { ...owner, id: 77, openId: "other-77", email: "other@example.com" };

describe("protected files router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageMocks.storagePut.mockResolvedValue({ key: "member-files/41/evidence_hash.png", url: "/manus-storage/member-files/41/evidence_hash.png" });
    dbMocks.createStoredFile.mockResolvedValue(9);
    storageMocks.storageGet.mockReturnValue({ key: "member-files/41/evidence_hash.png", url: "/manus-storage/member-files/41/evidence_hash.png" });
  });

  it("rejects unauthenticated archive access", async () => {
    const caller = appRouter.createCaller(contextFor(null));
    await expect(caller.files.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("stores upload metadata under the authenticated owner", async () => {
    const caller = appRouter.createCaller(contextFor(owner));
    const result = await caller.files.upload({ fileName: "Receipt.png", contentType: "image/png", contentBase64: "aGVsbG8=" });

    expect(storageMocks.storagePut).toHaveBeenCalledWith(expect.stringContaining("member-files/41/"), expect.any(Buffer), "image/png");
    expect(dbMocks.createStoredFile).toHaveBeenCalledWith(expect.objectContaining({ ownerId: 41, originalName: "receipt.png" }));
    expect(result.id).toBe(9);
  });

  it("resolves downloads through the owner-scoped database lookup", async () => {
    dbMocks.getStoredFileForUser.mockResolvedValue({ id: 9, ownerId: 41, storageKey: "member-files/41/evidence_hash.png" });
    const caller = appRouter.createCaller(contextFor(owner));

    await expect(caller.files.downloadUrl({ fileId: 9 })).resolves.toMatchObject({ url: expect.stringContaining("/manus-storage/") });
    expect(dbMocks.getStoredFileForUser).toHaveBeenCalledWith(9, 41);
  });

  it("denies a different authenticated user when owner-scoped metadata is absent", async () => {
    dbMocks.getStoredFileForUser.mockResolvedValue(undefined);
    const caller = appRouter.createCaller(contextFor(otherUser));

    await expect(caller.files.downloadUrl({ fileId: 9 })).rejects.toThrow("File not found");
    expect(dbMocks.getStoredFileForUser).toHaveBeenCalledWith(9, 77);
    expect(storageMocks.storageGet).not.toHaveBeenCalled();
  });

  it("requests archive rows only for the authenticated user", async () => {
    dbMocks.listStoredFilesForUser.mockResolvedValue([]);
    const caller = appRouter.createCaller(contextFor(otherUser));

    await expect(caller.files.list()).resolves.toEqual([]);
    expect(dbMocks.listStoredFilesForUser).toHaveBeenCalledWith(77);
  });
});
