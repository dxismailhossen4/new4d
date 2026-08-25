import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createStoredFile, getStoredFileForUser, listStoredFilesForUser } from "./db";
import { decodeAndValidateUpload, sanitizeFileName } from "./fileUploadValidation";
import { storageGet, storagePut } from "./storage";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  files: router({
    list: protectedProcedure.query(({ ctx }) => listStoredFilesForUser(ctx.user.id)),
    upload: protectedProcedure
      .input(
        z.object({
          fileName: z.string().min(1).max(255),
          contentType: z.string().min(1).max(128),
          contentBase64: z.string().min(4).max(7_000_000),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const bytes = decodeAndValidateUpload(input);
        const originalName = sanitizeFileName(input.fileName);
        const stored = await storagePut(
          `member-files/${ctx.user.id}/${Date.now()}-${originalName}`,
          bytes,
          input.contentType
        );
        const fileId = await createStoredFile({
          ownerId: ctx.user.id,
          storageKey: stored.key,
          originalName,
          contentType: input.contentType,
          byteSize: bytes.length,
        });

        return { id: fileId, ...stored, originalName, contentType: input.contentType, byteSize: bytes.length };
      }),
    downloadUrl: protectedProcedure
      .input(z.object({ fileId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const file = await getStoredFileForUser(input.fileId, ctx.user.id);
        if (!file) {
          throw new Error("File not found or you do not have access to it.");
        }
        return storageGet(file.storageKey);
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
