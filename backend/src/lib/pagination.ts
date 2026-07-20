import { z } from 'zod';

export const UuidSchema = z.string().uuid();
export const EmailSchema = z.string().email().max(320);
export const NonEmptyString = z.string().trim().min(1).max(500);

export const CursorPaginationQuery = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  siteId: z.string().uuid().optional(),
});

export type CursorPagination = z.infer<typeof CursorPaginationQuery>;

export const PaginatedMeta = z.object({
  nextCursor: z.string().uuid().nullable(),
  limit: z.number().int(),
});

export function encodeCursor(id: string): string {
  return id;
}

export function decodeCursor(cursor?: string): string | undefined {
  return cursor;
}

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    correlationId: z.string().optional(),
    details: z.unknown().optional(),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
