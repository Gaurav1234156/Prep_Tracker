import { redirect } from "next/navigation";

// Student self-signup is retired: students authenticate via CCBP SSO on
// /login, and staff accounts are created at /admin/signup.
export default function SignupPage() {
  redirect("/login");
}
