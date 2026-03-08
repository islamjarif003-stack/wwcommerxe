// ============================================================
// Moon IT Shop OS – JWT Auth Utilities
// ============================================================
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const requireEnv = (name: string): string => {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(
            `[Auth Config] Missing required environment variable: ${name}. ` +
            `Set it in your deployment environment (e.g. Vercel Project Settings → Environment Variables).`
        );
    }
    return value;
};

const JWT_SECRET = requireEnv("JWT_SECRET");
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET?.trim() || JWT_SECRET;

export interface TokenPayload {
    id: string;
    email: string;
    role: string;
}

export const generateTokens = (payload: TokenPayload) => {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
    return { token, refreshToken };
};

export const verifyToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
        return null;
    }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
        return null;
    }
};

export const hashPassword = async (password: string) => bcrypt.hash(password, 12);
export const comparePassword = async (plain: string, hashed: string) => bcrypt.compare(plain, hashed);

export const getTokenFromRequest = (req: Request): string | null => {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
    return null;
};
