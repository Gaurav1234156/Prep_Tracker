"use client";

import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SSO_LOGIN_URL = process.env.NEXT_PUBLIC_SSO_LOGIN_URL;

type Props = {
  authError: string | null;
};

export function LoginForm({ authError }: Props) {
  useEffect(() => {
    if (authError) {
      toast.error(authError);
    }
  }, [authError]);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>
            Sign in with your CCBP account to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SSO_LOGIN_URL ? (
            <Button className="w-full" render={<a href={SSO_LOGIN_URL} />}>
              Login with CCBP account
            </Button>
          ) : (
            <p className="text-sm text-destructive">
              CCBP login is not configured. Please contact support.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-sm">
            Staff member?{" "}
            <Link href="/admin/login" className="text-foreground underline">
              Admin login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
