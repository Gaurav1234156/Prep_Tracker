import { redirect } from "next/navigation";

import { getCurrentDbUser } from "@/lib/auth/guards";
import { AdminSignupForm } from "./signup-form";

export const metadata = {
  title: "Staff sign up | Interview Experience Platform",
};

export default async function AdminSignupPage() {
  const user = await getCurrentDbUser();
  if (user) {
    if (!user.onboardedAt) redirect("/onboarding");
    redirect("/admin");
  }

  return <AdminSignupForm />;
}
