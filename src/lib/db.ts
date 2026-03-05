/**
 * ⚠️  DEPRECATED — JSON database adapter
 * This file is kept only to prevent import errors during migration.
 * ALL data is now stored in PostgreSQL via Prisma.
 * Use `import { prisma } from "@/lib/prisma"` instead.
 */

// Re-export prisma as a convenience so old `db` imports don't hard-crash
export { prisma as db } from "@/lib/prisma";

// No type exports needed — use Prisma-generated types from @prisma/client
