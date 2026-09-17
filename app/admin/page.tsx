import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { checkIsAdmin } from "@/lib/isAdmin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Portal — Elzinore",
};

export default async function AdminPage() {
  const adminCheck = await checkIsAdmin();

  // If user is not signed in, redirect to Clerk sign-in returning back to /admin
  if (adminCheck.reason === "unauthenticated") {
    const authObj = await Promise.resolve(auth());
    return authObj.redirectToSignIn({ returnBackUrl: "/admin" });
  }

  // If signed in but not an authorized admin, display clean Not Authorized state
  if (!adminCheck.authorized) {
    return (
      <main className="grid-paper flex min-h-[75vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg border-4 border-border bg-panel p-8 text-center shadow-brutal-md md:p-12">
          <p className="border-2 border-border bg-accent px-3 py-1 font-grotesk text-xs font-black uppercase text-black inline-block shadow-brutal">
            Access Restricted
          </p>
          <h1 className="hollow mt-4 font-grotesk text-4xl font-black uppercase md:text-5xl">
            Not Authorized
          </h1>
          <p className="mx-auto mt-4 max-w-sm font-bold text-foreground/80 text-sm md:text-base">
            Your account ({adminCheck.email || "signed in"}) does not have administrator privileges.
          </p>
          <p className="mt-2 text-xs font-bold text-foreground/60">
            If you are the store owner, add your email address to the <code className="bg-foreground/10 px-1 py-0.5">ADMIN_EMAILS</code> environment configuration.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center border-4 border-border bg-yellow px-6 font-grotesk text-sm font-black uppercase text-black shadow-brutal transition-all hover:bg-yellow/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <AdminDashboard adminEmail={adminCheck.email} />;
}
