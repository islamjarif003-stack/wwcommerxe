import nodemailer from "nodemailer";

const getTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER || "your-email@gmail.com",
            pass: process.env.EMAIL_PASS || "your-app-password"
        }
    });
};

export const sendVerificationEmail = async (to: string, token: string) => {
    try {
        // Only run if email env vars are provided
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log(`[Email System] EMAIL_USER or EMAIL_PASS not configured. Skipping verification email for: ${to}`);
            return;
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const verifyLink = `${baseUrl}/auth/verify-email?token=${token}`;

        const transporter = getTransporter();
        await transporter.sendMail({
            from: `"Moon IT Shop" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Verify Your Email - Moon IT Shop",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #FAF6F0; color: #172B26;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="color: #1F403A; font-size: 24px; margin: 0;">Welcome to Moon IT Shop!</h2>
                    </div>
                    <p style="font-size: 16px; line-height: 1.5;">Hello,</p>
                    <p style="font-size: 16px; line-height: 1.5;">Thank you for registering. Please confirm your email address to verify your account and get full access.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verifyLink}" style="display: inline-block; padding: 14px 28px; background-color: #1F403A; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Verify Email</a>
                    </div>
                    <p style="font-size: 14px; line-height: 1.5; margin-bottom: 0;">If you didn't create an account, you can safely ignore this email.</p>
                    <p style="font-size: 13px; color: #857D6F; margin-top: 30px; text-align: center; border-top: 1px solid rgba(185, 172, 155, 0.4); padding-top: 20px;">
                        This link will expire in 2 hours.
                        <br><br>
                        Moon IT Shop Support
                    </p>
                </div>
            `
        });
        console.log(`Verification email sent to: ${to}`);
    } catch (e) {
        console.error("Failed to send verify email:", e);
    }
};
