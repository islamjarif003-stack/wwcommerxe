import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { generateChatResponse } from "@/lib/gemini";

// Gets or creates a chat session for the current user/guest
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;
    let name = "Guest";
    let email = "";

    if (authHeader?.startsWith("Bearer ")) {
        const payload = verifyToken(authHeader.slice(7));
        if (payload) {
            userId = payload.id;
            name = (payload as any).name || "Customer";
            email = (payload as any).email || "";
        }
    }

    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get("guestId"); // Passed from client if not logged in

    try {
        let session;

        // Try to find an existing OPEN or WAITING session
        if (userId) {
            session = await (prisma as any).chatSession.findFirst({
                where: { userId, status: { not: "CLOSED" } },
                include: { messages: { orderBy: { createdAt: "asc" } } },
            });
        } else if (guestId) {
            session = await (prisma as any).chatSession.findFirst({
                where: { guestId, status: { not: "CLOSED" } },
                include: { messages: { orderBy: { createdAt: "asc" } } },
            });
        }

        // If no active session, create one
        if (!session) {
            if (!userId && !guestId) {
                return NextResponse.json({ success: false, error: "Missing guest ID format" }, { status: 400 });
            }
            session = await (prisma as any).chatSession.create({
                data: {
                    userId,
                    guestId: userId ? null : guestId,
                    name,
                    email,
                    status: "OPEN",
                },
                include: { messages: true }
            });
        }

        return NextResponse.json({ success: true, data: session });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, error: "Failed to load chat" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sessionId, message, sender } = body;

        if (!sessionId || !message) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        let finalSender = sender || "CUSTOMER";
        if (finalSender === "ADMIN") {
            const authHeader = req.headers.get("authorization");
            const payload = authHeader?.startsWith("Bearer ") ? verifyToken(authHeader.slice(7)) : null;
            if (!payload || (payload as any).role !== "ADMIN") {
                return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
            }
        }

        // Create the message
        const chatMsg = await (prisma as any).chatMessage.create({
            data: {
                sessionId,
                message,
                sender: finalSender,
            },
        });

        // Handle customer reply and integrate AI Support
        if (finalSender === "CUSTOMER") {
            let handledByAi = false;

            // Fetch history for AI
            const session = await (prisma as any).chatSession.findUnique({
                where: { id: sessionId },
                include: { messages: { orderBy: { createdAt: "asc" } } }
            });

            if (session) {
                const history = session.messages
                    .filter((m: any) => m.id !== chatMsg.id)
                    .map((m: any) => ({
                        role: m.sender === "CUSTOMER" ? "user" : "model",
                        parts: [{ text: String(m.message) }]
                    }));

                const aiResponse = await generateChatResponse(history, message);

                if (aiResponse !== null) {
                    const text = String(aiResponse).trim();
                    const isTransfer = text.includes("[TRANSFER_TO_HUMAN]");
                    const cleanText = text.replace("[TRANSFER_TO_HUMAN]", "").trim() || "I'm connecting you to a human agent who can assist you further.";

                    // Save AI Response
                    await (prisma as any).chatMessage.create({
                        data: {
                            sessionId,
                            message: cleanText,
                            sender: "ADMIN",
                        }
                    });

                    if (!isTransfer) {
                        handledByAi = true;
                        // Keep session OPEN since human doesn't need to step in
                        await (prisma as any).chatSession.update({
                            where: { id: sessionId },
                            data: { status: "OPEN", updatedAt: new Date() },
                        });
                    }
                }
            }

            // If AI transferring to human or AI disabled/failed
            if (!handledByAi) {
                await (prisma as any).chatSession.update({
                    where: { id: sessionId },
                    data: { status: "WAITING", updatedAt: new Date() },
                });
            }
        } else {
            // Admin replied
            await (prisma as any).chatSession.update({
                where: { id: sessionId },
                data: { status: "OPEN", updatedAt: new Date() },
            });
        }

        return NextResponse.json({ success: true, data: chatMsg });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
    }
}
