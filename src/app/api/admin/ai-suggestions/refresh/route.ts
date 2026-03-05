// POST /api/admin/ai-suggestions/refresh — refresh product AI scores
import { ok, err, withAuth, AuthedRequest } from "@/lib/api";
import { refreshProductScores } from "@/lib/aiEngine";

const postHandler = async (req: AuthedRequest) => {
    try {
        const body = await req.json().catch(() => ({}));
        const limit = parseInt(body.limit || "500");
        const result = await refreshProductScores(Math.min(limit, 2000));
        return ok({
            message: `Refreshed scores for ${result.updated} products`,
            ...result,
        });
    } catch (e: any) {
        return err("Score refresh failed: " + e.message, 500);
    }
};

export const POST = withAuth(postHandler as any, "SUPERADMIN", "ADMIN");
