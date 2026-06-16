import * as fs from "fs";

const file = "src/components/task-detail/TaskDetailDialog.tsx";
let code = fs.readFileSync(file, "utf8");

const subtasksSection = `
function SubtasksSection({
  item,
  isProjectMember,
  onOpenOther,
}: {
  item: BacklogItem;
  isProjectMember: boolean;
  onOpenOther: (id: string, initialTab?: string) => void;
}) {
  const { store, createItem, updateItem } = useWorkspaceStore();
  const subtasks = store.items.filter((i) => i.parentId === item.id);

  const [isAdding, setIsAdding] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");

  const handleAdd = () => {
    if (!draftTitle.trim()) return;
    createItem({
      workspaceCode: item.workspaceCode,
      title: draftTitle.trim(),
      type: "Task",
      status: "Todo",
      priority: "Medium",
      parentId: item.id,
      sprintId: item.sprintId,
    });
    setDraftTitle("");
    setIsAdding(false);
  };

  if (subtasks.length === 0 && !isAdding) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/20 border border-dashed border-border/60 rounded-2xl">
        <ListTree className="w-10 h-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-foreground font-medium mb-1">No subtasks created</p>
        <p className="text-xs text-muted-foreground mb-4 text-center max-w-[250px]">
          Break this task down into smaller, actionable pieces.
        </p>
        {!isProjectMember && (
          <Button size="sm" onClick={() => setIsAdding(true)} className="rounded-full shadow-sm" variant="outline">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Subtask
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subtasks.length > 0 && (
        <div className="space-y-2">
          {subtasks.map((sub) => {
            const meta = ISSUE_TYPE_META[sub.type] || ISSUE_TYPE_META.Task;
            const isCompleted = sub.status === "Completed";
            return (
              <div
                key={sub.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-colors shadow-sm group cursor-pointer",
                  isCompleted && "opacity-70"
                )}
                onClick={() => onOpenOther(sub.id)}
              >
                <div
                  className="flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isProjectMember) {
                      updateItem(sub.id, {
                        status: isCompleted ? "Todo" : "Completed",
                      });
                    }
                  }}
                >
                  {isCompleted ? (
                    <div className="h-4 w-4 rounded-full bg-indigo-600 text-white flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors">
                      <Check className="h-3 w-3" />
                    </div>
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-muted-foreground/50 cursor-pointer hover:border-indigo-600 transition-colors" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium leading-none truncate", isCompleted && "line-through text-muted-foreground")}>
                    {sub.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary" className="text-[10px] h-5 hidden sm:flex bg-muted/60 text-muted-foreground font-semibold border-0">
                    {sub.status}
                  </Badge>
                  {sub.assigneeId && (
                    <PersonAvatar userId={sub.assigneeId} size="xs" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isAdding && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-indigo-600/30 bg-indigo-50/10 dark:bg-indigo-900/10">
          <Input
            autoFocus
            placeholder="What needs to be done?"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") setIsAdding(false);
            }}
            className="h-8 text-sm bg-transparent border-0 focus-visible:ring-0 shadow-none px-1"
          />
          <Button size="sm" onClick={handleAdd} disabled={!draftTitle.trim()} className="h-8 px-3 rounded-full">
            Save
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsAdding(false)}
            className="h-8 w-8 rounded-full text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!isAdding && !isProjectMember && subtasks.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-8 rounded-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add another subtask
        </Button>
      )}
    </div>
  );
}
`;

code = code.replace(
  /function QuietField/,
  subtasksSection + "\n\nfunction QuietField",
);

fs.writeFileSync(file, code);
