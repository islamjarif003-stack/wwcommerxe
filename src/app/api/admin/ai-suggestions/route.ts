// GET  /api/admin/ai-suggestions  — list generated suggestions
// POST /api/admin/ai-suggestions  — run AI analysis and generate suggestions
import { ok, withAuth, AuthedRequest } from "@/lib/api";
import {
    generateAISuggestions, analyzeInventory, analyzePricing, segmentCustomers
} from "@/lib/aiEngine";
import { generateAdminInsights } from "@/lib/gemini";

const getHandler = async (req: AuthedRequest) => {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // pricing | inventory | marketing | delivery | ui
    const mode = searchParams.get("mode"); // suggestions | inventory | pricing | customers

    // Return different analysis types based on mode
    if (mode === "inventory") {
        const alerts = await analyzeInventory();
        return ok({ items: alerts, total: alerts.length, mode: "inventory" });
    }

    if (mode === "pricing") {
        const insights = await analyzePricing();
        return ok({ items: insights, total: insights.length, mode: "pricing" });
    }

    if (mode === "customers") {
        const segments = await segmentCustomers();
        // Group by segment type
        const grouped = segments.reduce((acc: Record<string, number>, s) => {
            acc[s.segment] = (acc[s.segment] || 0) + 1;
            return acc;
        }, {});
        return ok({
            items: segments.slice(0, 50),
            grouped,
            total: segments.length,
            mode: "customers",
        });
    }

    // Default: generate & return fresh AI suggestions
    const result = await generateAISuggestions();
    let suggestions = result.suggestions;

    // Add Gemini Master Insight 
    const aiReview = await generateAdminInsights(JSON.stringify(suggestions));
    if (aiReview) {
        (suggestions as any[]).unshift({
            type: "gemini",
            title: aiReview.title,
            description: aiReview.description,
            impact: "high",
            confidence: 99,
            data: {},
            status: "pending",
            createdAt: new Date(),
        });
    }

    if (type) suggestions = suggestions.filter(s => s.type === type);

    return ok({
        items: suggestions,
        total: suggestions.length,
        generated: result.generated,
        mode: "suggestions",
    });
};

const postHandler = async (_req: AuthedRequest) => {
    // Trigger full AI analysis run
    const result = await generateAISuggestions();
    let suggestions = result.suggestions;

    // Generate Max Level Admin Insight
    const aiReview = await generateAdminInsights(JSON.stringify(suggestions));
    if (aiReview) {
        (suggestions as any[]).unshift({
            type: "gemini",
            title: aiReview.title,
            description: aiReview.description,
            impact: "high",
            confidence: 99,
            data: {},
            status: "pending",
            createdAt: new Date(),
        });
    }

    return ok({
        message: `AI analysis complete. Generated ${suggestions.length} insights.`,
        generated: suggestions.length,
        suggestions: suggestions,
    });
};

export const GET = withAuth(getHandler as any, "SUPERADMIN", "ADMIN", "MANAGER");
export const POST = withAuth(postHandler as any, "SUPERADMIN", "ADMIN");
