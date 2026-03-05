// Type augmentation for Prisma models that may not be in the generated client
// due to stale generation (dev server locking the DLL).
// Run `npx prisma generate` after stopping the dev server to fix permanently.

import type { Prisma } from "@prisma/client";

declare global {
    namespace PrismaAuditLog {
        interface CreateInput {
            action: string;
            entity: string;
            entityId?: string | null;
            userId: string;
            userEmail: string;
            userRole: string;
            details?: Prisma.JsonValue | null;
        }
    }
}

export { };
