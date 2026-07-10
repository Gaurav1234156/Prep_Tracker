"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  toggleFeatureFlag,
  updateFeatureFlagDescription,
} from "@/app/_actions/feature-flags";
import { isFlagWired } from "@/lib/feature-flags.constants";

type Flag = {
  key: string;
  enabled: boolean;
  description: string | null;
  updatedAt: string;
};

export function FeatureFlagsClient({ initialFlags }: { initialFlags: Flag[] }) {
  const [flags, setFlags] = useState<Flag[]>(initialFlags);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function setFlagLocal(key: string, patch: Partial<Flag>) {
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  }

  async function handleToggle(flag: Flag) {
    if (!isFlagWired(flag.key)) return;

    const nextValue = !flag.enabled;
    setFlagLocal(flag.key, { enabled: nextValue });
    setPendingKey(flag.key);
    startTransition(async () => {
      try {
        await toggleFeatureFlag({ key: flag.key, enabled: nextValue });
        toast.success(`${flag.key} → ${nextValue ? "ON" : "OFF"}`);
      } catch {
        setFlagLocal(flag.key, { enabled: flag.enabled });
        toast.error("Could not toggle flag.");
      } finally {
        setPendingKey(null);
      }
    });
  }

  async function handleSaveDescription(flag: Flag, value: string) {
    if ((flag.description ?? "") === value) return;
    setPendingKey(flag.key);
    startTransition(async () => {
      try {
        await updateFeatureFlagDescription({
          key: flag.key,
          description: value.trim() === "" ? null : value,
        });
        setFlagLocal(flag.key, { description: value.trim() === "" ? null : value });
        toast.success("Description saved.");
      } catch {
        toast.error("Could not save description.");
      } finally {
        setPendingKey(null);
      }
    });
  }

  if (flags.length === 0) {
    return (
      <Card className="py-12 text-center text-sm text-muted-foreground">
        No feature flags defined. Add some via Prisma seed or directly in the DB.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {flags.map((flag) => (
        <FlagRow
          key={flag.key}
          flag={flag}
          pending={pendingKey === flag.key}
          wired={isFlagWired(flag.key)}
          onToggle={() => handleToggle(flag)}
          onSaveDescription={(value) => handleSaveDescription(flag, value)}
        />
      ))}
    </div>
  );
}

function FlagRow({
  flag,
  pending,
  wired,
  onToggle,
  onSaveDescription,
}: {
  flag: Flag;
  pending: boolean;
  wired: boolean;
  onToggle: () => void;
  onSaveDescription: (value: string) => void;
}) {
  const [description, setDescription] = useState(flag.description ?? "");

  return (
    <Card className="gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <code className="text-sm font-mono font-medium text-foreground">
              {flag.key}
            </code>
            {!wired ? (
              <Badge variant="secondary" className="text-xs">
                Not wired
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            Last updated {new Date(flag.updatedAt).toLocaleString()}
          </p>
          {!wired ? (
            <p className="text-xs text-muted-foreground">
              Toggle is saved, but no feature reads this flag yet.
            </p>
          ) : null}
        </div>
        <ToggleSwitch
          checked={flag.enabled}
          disabled={pending || !wired}
          onChange={onToggle}
          label={`Toggle ${flag.key}`}
        />
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this flag controls…"
          className="flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSaveDescription(description)}
          disabled={pending || (flag.description ?? "") === description}
        >
          Save
        </Button>
      </div>
    </Card>
  );
}

function ToggleSwitch({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:opacity-50 ${
        checked ? "bg-primary" : "bg-input"
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        } mt-px`}
      />
    </button>
  );
}
