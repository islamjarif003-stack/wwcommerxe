import { NextRequest } from "next/server";
import { ok, err, withAuth, AuthedRequest } from "@/lib/api";

const getHandler = async (_req: AuthedRequest) => ok([]);
const postHandler = async (req: AuthedRequest) => err("Not implemented", 501);

export const GET = withAuth(getHandler as any, "SUPERADMIN", "ADMIN");
export const POST = withAuth(postHandler as any, "SUPERADMIN", "ADMIN");
