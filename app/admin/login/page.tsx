import { redirect } from "next/navigation";

import { getCurrentDbUser } from "@/lib/auth/guards";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { AdminLoginForm } from "./login-form";

export const metadata = {
  title: "Staff login | Interview Experience Platform",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  const user = await getCurrentDbUser();
  if (user) {
    if (!user.onboardedAt) redirect("/onboarding");
    redirect(safeNextPath(params.next, "/admin"));
  }

  return (
    <AdminLoginForm
      next={params.next ?? null}
      authError={params.error ?? null}
    />
  );
}
