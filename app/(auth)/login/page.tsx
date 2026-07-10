import { redirect } from "next/navigation";

import { getCurrentDbUser } from "@/lib/auth/guards";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Login | Interview Experience Platform",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  const user = await getCurrentDbUser();
  if (user) {
    if (!user.onboardedAt) redirect("/onboarding");
    redirect(safeNextPath(params.next));
  }

  return (
    <LoginForm next={params.next ?? null} authError={params.error ?? null} />
  );
}
