import * as fs from "fs";

const file = "src/components/task-detail/TaskDetailDialog.tsx";
let code = fs.readFileSync(file, "utf8");

// Replace table wrapper and th
code = code.replace(
  /<div className="rounded-xl border border-border bg-card overflow-hidden">/,
  '<div className="overflow-hidden border border-border/50 rounded-2xl bg-card/50 shadow-sm">',
);

code = code.replace(
  /<tr className="bg-muted\/40 border-b border-border text-xs font-semibold text-muted-foreground select-none">/g,
  '<tr className="bg-muted/20 border-b border-border/50 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground select-none">',
);

code = code.replace(
  /<tbody className="divide-y divide-border">/,
  '<tbody className="divide-y divide-border/50">',
);

// We should replace that ugly filter section as well
const uglyFilters = `<div className="flex flex-wrap gap-3 items-end justify-between bg-muted/40 p-4 rounded-xl border border-border/60">`;
const modernFilters = `<div className="flex flex-wrap gap-3 items-end justify-between bg-card/50 p-4 rounded-2xl border border-border/50 shadow-sm">`;
code = code.replace(uglyFilters, modernFilters);

code = code.replace(
  /bg-card border border-border rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none/g,
  "bg-background border border-border/50 rounded-full px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none hover:bg-muted/50 transition-colors",
);

fs.writeFileSync(file, code);
