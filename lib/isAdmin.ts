import { currentUser } from "@clerk/nextjs/server";

export interface AdminAuthResult {
  authorized: boolean;
  reason?: "unauthenticated" | "forbidden";
  user: any | null;
  email?: string;
}

/**
 * Server-side helper to check if the current Clerk user is authorized as an admin.
 * Matches against ADMIN_EMAILS environment variable (comma-separated).
 */
export async function checkIsAdmin(): Promise<AdminAuthResult> {
  try {
    const user = await currentUser();
    if (!user) {
      return { authorized: false, reason: "unauthenticated", user: null };
    }

    const adminEmailsRaw = process.env.ADMIN_EMAILS || "";
    const adminEmails = adminEmailsRaw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    // Get all user email addresses (primary, secondary, google oauth)
    const userEmails = (user.emailAddresses || []).map((e) =>
      e.emailAddress.toLowerCase().trim()
    );

    const matchingEmail = userEmails.find((email) => adminEmails.includes(email));

    if (!matchingEmail) {
      return {
        authorized: false,
        reason: "forbidden",
        user,
        email: userEmails[0],
      };
    }

    return {
      authorized: true,
      user,
      email: matchingEmail,
    };
  } catch (error) {
    console.error("Admin authorization check error:", error);
    return { authorized: false, reason: "unauthenticated", user: null };
  }
}
