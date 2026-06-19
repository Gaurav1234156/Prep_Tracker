"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, PencilIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateCompanyCtc } from "@/app/_actions/company";

export function CompanyCtcEditButton({
  companyId,
  companyName,
  currentCtc,
}: {
  companyId: string;
  companyName: string;
  currentCtc: number | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [ctcVal, setCtcVal] = useState(currentCtc !== null ? String(currentCtc) : "");
  const [pending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const val = ctcVal.trim() === "" ? null : Number(ctcVal);
        if (val !== null && (isNaN(val) || val < 0)) {
          toast.error("Please enter a valid positive number.");
          return;
        }
        await updateCompanyCtc(companyId, val);
        toast.success(`Updated CTC for ${companyName}.`);
        setOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Update failed.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Edit CTC for ${companyName}`}
            onClick={(e) => {
              // Prevent clicking the button from triggering the company card link navigation
              e.stopPropagation();
              e.preventDefault();
              setOpen(true);
            }}
            className="absolute right-12 top-3 z-10 h-8 w-8 rounded-md p-0 text-foreground-muted opacity-0 transition-opacity hover:bg-secondary hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
          />
        }
      >
        <PencilIcon className="size-4" />
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSave} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit CTC for {companyName}</DialogTitle>
            <DialogDescription>
              Specify the Cost to Company (CTC) in Lakhs Per Annum (LPA). Leave empty to remove it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="ctc-input" className="text-xs font-semibold text-foreground-muted">
              CTC (LPA)
            </label>
            <Input
              id="ctc-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 18.5"
              value={ctcVal}
              onChange={(e) => setCtcVal(e.target.value)}
              disabled={pending}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
