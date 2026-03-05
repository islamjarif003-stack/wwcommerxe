import { NextRequest } from "next/server";
import { ok, err, withAuth, AuthedRequest } from "@/lib/api";

const putHandler = async (req: AuthedRequest, { params }: { params: Promise<{ id: string }> }) => err("Not implemented", 501);
const deleteHandler = async (_req: AuthedRequest, { params }: { params: Promise<{ id: string }> }) => err("Not implemented", 501);

export const PUT = (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
    withAuth((r) => putHandler(r as AuthedRequest, ctx), "SUPERADMIN", "ADMIN")(req);
export const DELETE = (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
    withAuth((r) => deleteHandler(r as AuthedRequest, ctx), "SUPERADMIN")(req);
