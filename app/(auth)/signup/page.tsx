import { redirect } from "next/navigation";

import { getCurrentDbUser } from "@/lib/auth/guards";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { SignupForm } from "./signup-form";

export const metadata = {
  title: "Sign up | Interview Experience Platform",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentDbUser();
  if (user) {
    if (!user.onboardedAt) redirect("/onboarding");
    redirect(safeNextPath(params.next));
  }

  return <SignupForm next={params.next ?? null} />;
}
