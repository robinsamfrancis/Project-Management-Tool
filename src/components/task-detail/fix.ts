import * as fs from "fs";

const file = "src/components/task-detail/TaskDetailDialog.tsx";
let code = fs.readFileSync(file, "utf8");

const componentsToInject = `
function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 w-full flex-1">
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="w-full flex-1">{children}</div>
    </div>
  );
}

function PersonSelect({
  value,
  onChange,
  memberIds,
  disabled,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
  memberIds: string[];
  disabled?: boolean;
}) {
  return (
    <Select
      value={value ?? "__n"}
      disabled={disabled}
      onValueChange={(v) => onChange(v === "__n" ? undefined : v)}
    >
      <SelectTrigger className="h-7 text-xs bg-background">
        <SelectValue placeholder="Unassigned" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__n">Unassigned</SelectItem>
        {(memberIds.length ? memberIds : DIRECTORY.map((d) => d.id)).map(
          (id) => {
            const p = DIRECTORY.find((d) => d.id === id);
            return (
              <SelectItem key={id} value={id}>
                <div className="flex items-center gap-1.5">
                    <PersonAvatar userId={id} size="xs" />
                    {p?.name ?? id}
                </div>
              </SelectItem>
            );
          },
        )}
      </SelectContent>
    </Select>
  );
}

function InlineTitle({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft !== value) onChange(draft.trim());
  };
  if (editing && !disabled) {
    return (
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className="text-xl font-semibold h-9 mt-1"
      />
    );
  }
  return (
    <h1
      className={cn(
        "text-xl font-semibold tracking-tight text-foreground mt-1 rounded px-1 -mx-1 inline-block",
        !disabled ? "cursor-text hover:bg-muted/40" : "",
      )}
      onClick={() => {
        if (!disabled) setEditing(true);
      }}
    >
      {value}
    </h1>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground truncate h-6">
        {icon}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className="text-sm font-semibold mt-0.5">{value}</div>
    </div>
  );
}
`;

code = code.replace(
  "/* ---------- DESCRIPTION ---------- */",
  componentsToInject + "\n\n/* ---------- DESCRIPTION ---------- */",
);

// Also, the tsc output shows some errors in WorkspaceStore or other missing types.
// "DependencyRisk" we can ignore if not in this file, wait, there are errors in task-detail:
//  src/components/task-detail/TaskDetailDialog.tsx(2115,5): error TS2304: Cannot find name 'Attachment'.
// Wait, Attachment might be from workspace-store.
code = code.replace(
  /import \{(.*?)\} from "@\/lib\/workspace-store";/,
  'import { $1, DependencyRisk, Attachment } from "@/lib/workspace-store";',
);
code = code.replace("Attachment,", "");
code = code.replace("DependencyRisk,", "");

fs.writeFileSync(file, code);
console.log("Restored helper functions");
