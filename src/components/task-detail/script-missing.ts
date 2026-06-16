import * as fs from "fs";

const file = "src/components/task-detail/TaskDetailDialog.tsx";
let code = fs.readFileSync(file, "utf8");

const missingComponents = `
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
        className="text-2xl font-bold tracking-tight h-10 mt-1"
      />
    );
  }
  return (
    <h1
      className={cn(
        "text-2xl font-bold tracking-tight text-foreground mt-1 rounded px-1 -mx-1 inline-block",
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
`;

code = code.replace(
  /function QuietField/,
  missingComponents + "\n\nfunction QuietField",
);

// Fix PersonAvatar size
code = code.replace(/size="xs"/g, 'size="sm"');

fs.writeFileSync(file, code);
