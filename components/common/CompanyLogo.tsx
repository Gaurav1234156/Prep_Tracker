"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg";

const SIZE_MAP: Record<Size, { px: number; cls: string; text: string }> = {
  xs: { px: 20, cls: "h-5 w-5", text: "text-[10px]" },
  sm: { px: 32, cls: "h-8 w-8", text: "text-sm" },
  md: { px: 56, cls: "h-14 w-14", text: "text-lg" },
  lg: { px: 80, cls: "h-20 w-20", text: "text-2xl" },
};

const LOGO_DEV_TOKEN = "pk_X-1ZO13GSgeOoUrIuJ6GMQ"; // public demo token

function inferDomain(name: string, website?: string | null): string | null {
  if (website) {
    try {
      return new URL(website).hostname.replace(/^www\./, "");
    } catch {
      // fall through to slug heuristic
    }
  }
  const slug = name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\b(inc|llc|ltd|technologies|labs|software)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
  if (slug.length < 2) return null;
  return `${slug}.com`;
}

type Props = {
  name: string;
  website?: string | null;
  logoUrl?: string | null;
  size?: Size;
  className?: string;
  /** Render-on-dark-bg variant — initial fallback uses translucent white instead of brand-subtle. */
  onDark?: boolean;
};

export function CompanyLogo({
  name,
  website,
  logoUrl,
  size = "md",
  className,
  onDark = false,
}: Props) {
  const [errored, setErrored] = useState(false);
  const domain = inferDomain(name, website);
  const dim = SIZE_MAP[size];
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const src =
    logoUrl && !errored
      ? logoUrl
      : domain && !errored
        ? `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=${dim.px * 2}&format=png`
        : null;

  if (!src) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg font-semibold",
          dim.cls,
          dim.text,
          onDark
            ? "bg-white/10 text-white"
            : "bg-brand-subtle text-brand",
          className,
        )}
        aria-label={`${name} logo`}
      >
        {initial}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg",
        onDark ? "bg-white/10" : "bg-background-elevated border border-border",
        dim.cls,
        className,
      )}
    >
      <Image
        src={src}
        alt={`${name} logo`}
        width={dim.px}
        height={dim.px}
        className="h-full w-full object-contain"
        sizes={`${dim.px}px`}
        onError={() => setErrored(true)}
        unoptimized
      />
    </div>
  );
}
