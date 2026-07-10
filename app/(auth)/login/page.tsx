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

  return (
    <LoginForm next={params.next ?? null} authError={params.error ?? null} />
  );
}
