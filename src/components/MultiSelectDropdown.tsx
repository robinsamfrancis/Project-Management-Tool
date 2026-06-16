import * as React from "react";
import { Check, ChevronsUpDown, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type Option = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  onCreate?: (val: string) => void;
  creatable?: boolean;
  className?: string;
}

export function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  emptyText = "No items found.",
  onCreate,
  creatable = false,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const selectedLabels = selected.map(
    (val) => options.find((opt) => opt.value === val)?.label || val,
  );

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  const handleSelect = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((i) => i !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  const handleCreate = () => {
    if (onCreate && inputValue) {
      onCreate(inputValue);
      setInputValue("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto min-h-10 py-2 px-3",
            className,
          )}
        >
          <div className="flex flex-wrap gap-1.5 items-center flex-1 pr-2">
            {selected.length === 0 && (
              <span className="text-muted-foreground font-normal">
                {placeholder}
              </span>
            )}
            {selected.map((val) => {
              const label =
                options.find((opt) => opt.value === val)?.label || val;
              return (
                <Badge
                  key={val}
                  variant="secondary"
                  className="whitespace-nowrap flex items-center gap-1 font-medium bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnselect(val);
                  }}
                >
                  {label}
                  <X className="h-3 w-3 hover:text-destructive text-muted-foreground transition-colors cursor-pointer" />
                </Badge>
              );
            })}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0"
        align="start"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command
          filter={(val, search) => {
            if (search) {
              const lbl = options.find((o) => o.value === val)?.label || "";
              if (lbl.toLowerCase().includes(search.toLowerCase())) return 1;
              return 0;
            }
            return 1;
          }}
        >
          <CommandInput
            placeholder="Search..."
            autoFocus
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty className="py-2 text-center text-sm">
              {creatable && inputValue ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start px-4 font-normal text-primary"
                  onClick={handleCreate}
                >
                  <Plus className="mr-2 h-4 w-4" /> Create "{inputValue}"
                </Button>
              ) : (
                emptyText
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selected.includes(option.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible",
                    )}
                  >
                    <Check className={cn("h-4 w-4")} />
                  </div>
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {creatable &&
              inputValue &&
              !options.some(
                (o) => o.label.toLowerCase() === inputValue.toLowerCase(),
              ) && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={handleCreate}
                      className="text-primary"
                      value={`create-${inputValue}`}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create "{inputValue}"
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
