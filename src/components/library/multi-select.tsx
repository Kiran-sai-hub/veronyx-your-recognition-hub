import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type OptionGroup = { label: string; options: { value: string; label: string }[] };

/**
 * Searchable select with groups; single or multi (checklist §7.1 Select: single, multi,
 * searchable, grouped). Keyboard: type to filter, arrows to move, Enter to pick.
 */
export function SearchableSelect({
  id,
  groups,
  value,
  onChange,
  multiple = false,
  placeholder = "Choose…",
  className,
  "aria-label": ariaLabel,
}: {
  id?: string | undefined;
  groups: OptionGroup[];
  value: string[];
  onChange: (value: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  className?: string | undefined;
  "aria-label"?: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const all = groups.flatMap((g) => g.options);
  const labelFor = (v: string) => all.find((o) => o.value === v)?.label ?? v;
  const toggle = (v: string) => {
    if (!multiple) {
      onChange([v]);
      setOpen(false);
      return;
    }
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          className={cn("h-auto min-h-9 w-full justify-between font-normal", className)}
        >
          <span className="flex flex-wrap gap-1 text-left">
            {value.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {!multiple && value[0] && labelFor(value[0])}
            {multiple &&
              value.map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs"
                >
                  {labelFor(v)}
                  <X
                    className="size-3"
                    aria-label={`Remove ${labelFor(v)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(v);
                    }}
                  />
                </span>
              ))}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>Nothing matches.</CommandEmpty>
            {groups.map((g) => (
              <CommandGroup key={g.label} heading={g.label}>
                {g.options.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={`${o.label} ${o.value}`}
                    onSelect={() => toggle(o.value)}
                  >
                    <Check
                      className={cn(
                        "size-4",
                        value.includes(o.value) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {o.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
