"use client";

import { useState, useTransition } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { searchStudents } from "@/app/_actions/assessment-feedback";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type StudentOption = {
  id: string;
  email: string;
  name: string | null;
};

interface StudentPickerProps {
  value: StudentOption | null;
  onChange: (student: StudentOption | null) => void;
}

export function StudentPicker({ value, onChange }: StudentPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudentOption[]>([]);
  const [pending, startTransition] = useTransition();

  function runSearch(nextQuery: string) {
    setQuery(nextQuery);
    startTransition(async () => {
      const rows = await searchStudents(nextQuery);
      setResults(rows);
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          />
        }
      >
        {value
          ? `${value.name ? `${value.name} · ` : ""}${value.email}`
          : "Search student by email or name…"}
        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[var(--anchor-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type email or name…"
            value={query}
            onValueChange={runSearch}
          />
          <CommandList>
            <CommandEmpty>
              {pending
                ? "Searching…"
                : query.trim()
                  ? "No students found."
                  : "Start typing to search."}
            </CommandEmpty>
            <CommandGroup>
              {results.map((student) => (
                <CommandItem
                  key={student.id}
                  value={student.id}
                  onSelect={() => {
                    onChange(student);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.id === student.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">
                    {student.name ? `${student.name} · ` : ""}
                    {student.email}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
