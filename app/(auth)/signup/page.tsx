import { redirect } from "next/navigation";

import { getCurrentDbUser } from "@/lib/auth/guards";
import { SignupForm } from "./signup-form";

export const metadata = {
  title: "Sign up | Interview Experience Platform",
};

export default async function SignupPage() {
  const user = await getCurrentDbUser();
  if (user) {
    if (!user.onboardedAt) redirect("/onboarding");
    redirect("/dashboard");
  }

  return <SignupForm />;
}
