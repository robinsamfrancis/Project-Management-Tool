import * as fs from "fs";

const file = "src/components/task-detail/TaskDetailDialog.tsx";
let code = fs.readFileSync(file, "utf8");

const newTaskBody = `
function TaskBody({
  item,
  tab,
  setTab,
  onOpenOther,
  onClose,
  onExpand,
}: {
  item: BacklogItem;
  tab: TabId;
  setTab: (t: TabId) => void;
  onOpenOther: (id: string, initialTab?: string) => void;
  onClose: () => void;
  onExpand?: () => void;
}) {
  const { store, updateItem } = useWorkspaceStore();
  const workspace = store.workspaces.find((w) => w.code === item.workspaceCode);
  const meta = ISSUE_TYPE_META[item.type];
  const sprint = store.sprints.find((s) => s.id === item.sprintId);

  const { role: userRole, myUserId, isPortfolioManager } = useCurrentUser();
  const isProjectMember =
    !isPortfolioManager &&
    userRole !== "Admin User" &&
    !workspace?.ownerIds.includes(myUserId);

  const statuses = workspace?.statuses ?? [
    "Todo",
    "In Progress",
    "In Review",
    "Completed",
  ];
  const idx = statuses.indexOf(item.status);
  const nextStatus =
    idx >= 0 && idx < statuses.length - 1 ? statuses[idx + 1] : null;

  const parentCandidates = store.items.filter(
    (i) => i.workspaceCode === item.workspaceCode && i.id !== item.id,
  );
  const memberIds = Array.from(
    new Set([...(workspace?.ownerIds ?? []), ...(workspace?.memberIds ?? [])]),
  );
  const sprints = store.sprints.filter(
    (s) => s.workspaceCode === item.workspaceCode,
  );

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden bg-background">
      {/* Prominent Action-Oriented Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur px-6 py-5 flex items-start gap-4 shrink-0">
        <span
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold shrink-0 mt-1",
            meta.bg,
            meta.color,
          )}
          title={meta.label}
        >
          {meta.icon}
        </span>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>{workspace?.name ?? item.workspaceCode}</span>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <span>{meta.label}</span>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <span className="text-foreground tracking-tight font-semibold">{item.id}</span>
          </div>
          <div className="flex items-center w-full">
            <InlineTitle
              value={item.title}
              onChange={(v) => updateItem(item.id, { title: v })}
              disabled={isProjectMember}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Select
              value={item.status}
              disabled={isProjectMember}
              onValueChange={(v) => updateItem(item.id, { status: v })}
            >
              <SelectTrigger className="h-7 text-xs bg-muted/60 hover:bg-muted text-foreground border-transparent px-3 py-0 inline-flex w-auto shadow-none rounded-full transition-colors gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(workspace?.statuses ?? []).map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={item.priority}
              disabled={isProjectMember}
              onValueChange={(v) =>
                updateItem(item.id, { priority: v as Priority })
              }
            >
              <SelectTrigger
                className={cn(
                  "h-7 text-xs border-transparent px-3 py-0 inline-flex w-auto shadow-none rounded-full transition-colors gap-2 hover:opacity-80 flex-row",
                  PRIORITY_META[item.priority].bg,
                  PRIORITY_META[item.priority].color
                )}
              >
                <AlertTriangle className={cn("w-3.5 h-3.5", PRIORITY_META[item.priority].color)} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
                  <SelectItem key={p} value={p} className="text-xs">
                    {PRIORITY_META[p].label} priority
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end pt-1">
          {nextStatus && !isProjectMember && (
            <Button
              size="default"
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium px-5 shadow-sm"
              onClick={() => {
                const ok = updateItem(item.id, { status: nextStatus });
                if (ok) {
                  toast.success(\`Moved to \${nextStatus}\`);
                }
              }}
            >
              {nextStatus === "In Progress" ? (
                <Play className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {nextStatus === "In Progress"
                ? "Start progress"
                : nextStatus === "In Review"
                  ? "Move to review"
                  : nextStatus === "Completed"
                    ? "Complete task"
                    : \`Move to \${nextStatus}\`}
            </Button>
          )}
          {item.status === "Completed" && !isProjectMember && (
            <Button
              size="default"
              variant="outline"
              className="gap-2 rounded-full"
              onClick={() => {
                updateItem(item.id, { status: statuses[0] });
                toast.success("Reopened");
              }}
            >
              <RotateCcw className="h-4 w-4" /> Reopen
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard?.writeText(\`\${item.id} · \${item.title}\`);
                  toast.success("Link copied");
                }}
              >
                <Share2 className="mr-2 h-4 w-4 text-muted-foreground" /> Share Task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  document.getElementById("file-upload-" + item.id)?.click();
                }}
              >
                <Paperclip className="mr-2 h-4 w-4 text-muted-foreground" /> Attach Document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {onExpand && (
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full h-10 w-10"
              onClick={onExpand}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Body - Two Column Grid */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-[1280px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] items-start">
          
          {/* Left Column (Main Task Details & Subtasks) */}
          <div className="p-6 lg:border-r border-border/60 min-h-full space-y-10">
            {/* Minimal Grid Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 gap-y-6">
              <QuietField label="Sprint">
                <Select
                  value={item.sprintId ?? "__b"}
                  disabled={isProjectMember}
                  onValueChange={(v) =>
                    updateItem(item.id, { sprintId: v === "__b" ? undefined : v })
                  }
                >
                  <SelectTrigger className="h-auto p-0 border-0 bg-transparent shadow-none hover:bg-muted/40 cursor-pointer w-auto pl-1 -ml-1 inline-flex focus:ring-0">
                    <span className="truncate max-w-[120px] font-medium text-sm">{item.sprintId ? sprints.find((s) => s.id === item.sprintId)?.name : "Backlog"}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__b">Backlog</SelectItem>
                    {sprints.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </QuietField>

              <QuietField label="Assignee">
                <Select
                  value={item.assigneeId ?? "__n"}
                  disabled={isProjectMember}
                  onValueChange={(v) => updateItem(item.id, { assigneeId: v === "__n" ? undefined : v })}
                >
                  <SelectTrigger className="h-auto p-0 border-0 bg-transparent shadow-none hover:bg-muted/40 cursor-pointer w-auto pl-1 -ml-1 inline-flex focus:ring-0">
                    <span className="truncate max-w-[120px] font-medium text-sm flex items-center gap-1.5">
                      {item.assigneeId ? (
                        <>
                          <PersonAvatar userId={item.assigneeId} size="xs" />
                          <span className="truncate">{DIRECTORY.find(d => d.id === item.assigneeId)?.name.split(" ")[0]}</span>
                        </>
                      ) : "Unassigned"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__n">Unassigned</SelectItem>
                    {(memberIds.length ? memberIds : DIRECTORY.map((d) => d.id)).map((id) => {
                      const p = DIRECTORY.find((d) => d.id === id);
                      return (
                        <SelectItem key={id} value={id}>
                          <div className="flex items-center gap-1.5">
                              <PersonAvatar userId={id} size="xs" />
                              {p?.name ?? id}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </QuietField>

              <QuietField label="Start Date">
                <Input
                  type="date"
                  disabled={isProjectMember}
                  value={item.startDate ?? ""}
                  onChange={(e) =>
                    updateItem(item.id, { startDate: e.target.value || undefined })
                  }
                  className="h-auto p-0 border-0 bg-transparent shadow-none hover:bg-muted/40 cursor-pointer w-auto pl-1 -ml-1 inline-flex focus-visible:ring-0 font-medium text-sm"
                />
              </QuietField>

              <QuietField label="Due Date">
                <Input
                  type="date"
                  disabled={isProjectMember}
                  value={item.dueDate ?? ""}
                  onChange={(e) =>
                    updateItem(item.id, { dueDate: e.target.value || undefined })
                  }
                  className="h-auto p-0 border-0 bg-transparent shadow-none hover:bg-muted/40 cursor-pointer w-auto pl-1 -ml-1 inline-flex focus-visible:ring-0 font-medium text-sm"
                />
              </QuietField>

              <QuietField label="Story Points">
                <Input
                  type="number"
                  min={0}
                  disabled={isProjectMember}
                  value={item.points}
                  onChange={(e) =>
                    updateItem(item.id, { points: Number(e.target.value) || 0 })
                  }
                  className="h-auto p-0 border-0 bg-transparent shadow-none hover:bg-muted/40 cursor-pointer w-[60px] pl-1 -ml-1 inline-flex focus-visible:ring-0 font-medium text-sm"
                />
              </QuietField>

              <QuietField label="Budget Hours">
                <Input
                  type="number"
                  min={0}
                  disabled={isProjectMember}
                  value={item.budgetHours ?? ""}
                  placeholder="—"
                  onChange={(e) =>
                    updateItem(item.id, {
                      budgetHours:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value) || 0,
                    })
                  }
                  className="h-auto p-0 border-0 bg-transparent shadow-none hover:bg-muted/40 cursor-pointer w-[60px] pl-1 -ml-1 inline-flex focus-visible:ring-0 font-medium text-sm"
                />
              </QuietField>
              
              <QuietField label="Created">
                <span className="text-sm font-medium pl-1 text-foreground/80">
                  {item.activity?.[0]?.at ? new Date(item.activity[0].at).toLocaleDateString() : "—"}
                </span>
              </QuietField>
              
              <QuietField label="Updated">
                <span className="text-sm font-medium pl-1 text-foreground/80">
                  {item.activity?.[item.activity.length - 1]?.at ? new Date(item.activity[item.activity.length - 1].at).toLocaleDateString() : "—"}
                </span>
              </QuietField>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" /> Description
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90">
                <DescriptionTab item={item} isProjectMember={isProjectMember} />
              </div>
            </div>

            {/* Task Progress Ring view */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" /> Effort & Progress
              </h3>
              <TaskProgressSection item={item} />
            </div>

            {/* Subtasks */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
                <ListTree className="h-4 w-4 text-muted-foreground" /> Subtasks
              </h3>
              <SubtasksSection item={item} isProjectMember={isProjectMember} onOpenOther={onOpenOther} />
            </div>

          </div>

          {/* Right Column (Secondary Info & Activity) */}
          <div className="flex flex-col min-h-full">
            {/* Documents Section (Clean) */}
            <div className="p-6 border-b border-border/60">
              <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2 mb-4">
                <Paperclip className="h-4 w-4 text-muted-foreground" /> Documents
              </h3>
              <AttachmentsTab item={item} />
            </div>

            {/* Tabs for rich interactive content */}
            <div className="p-6 flex-1 flex flex-col">
              <nav className="flex items-center gap-6 border-b border-border mb-6">
                {TABS.filter(t => ['activity', 'dependencies', 'time'].includes(t.id)).map((t) => {
                  if (isProjectMember && t.id === "dependencies") return null;
                  const active = tab === t.id || (!['activity', 'dependencies', 'time'].includes(tab) && t.id === 'activity');
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={cn(
                        "pb-3 text-sm font-medium transition-all relative whitespace-nowrap hidden md:block cursor-pointer",
                        active
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t.label}
                      {active && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full shadow-[0_-2px_8px_rgba(79,70,229,0.5)]" />
                      )}
                    </button>
                  );
                })}
              </nav>
              <div className="flex-1">
                {(tab === 'activity' || !['activity', 'dependencies', 'time'].includes(tab)) && <ActivityTab item={item} />}
                {tab === 'dependencies' && <div className="-mx-6 -my-2"><DependenciesTab item={item} onOpenOther={onOpenOther} /></div>}
                {tab === 'time' && <TimeTrackingTab item={item} />}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function QuietField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="group relative flex flex-col gap-1.5 w-full">
      <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">{label}</span>
      <div className="w-full flex items-center group-hover:bg-muted/30 rounded -ml-1 transition-colors min-h-[28px]">
        {children}
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0 pointer-events-none" />
      </div>
    </div>
  );
}

function TaskProgressSection({ item }: { item: BacklogItem }) {
  const est = item.budgetHours ?? 0;
  const loggedHours = (item.worklogs ?? []).reduce((a, b) => a + b.hours, 0);
  const remaining = Math.max(0, est - loggedHours);
  const burnRate = est > 0 ? Math.round((loggedHours / est) * 100) : 0;
  const isOver = loggedHours > est && est > 0;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  // If burnRate > 100, we cap the primary circle at 100 and maybe show red
  const primaryStrokeDashoffset = circumference - (Math.min(100, burnRate) / 100) * circumference;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 rounded-2xl border border-border/60 bg-muted/10 p-6 shadow-sm">
      {/* Circular Progress Ring */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg className="w-28 h-28 transform -rotate-90">
          {/* Background Ring */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted/50"
          />
          {/* Progress Ring */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={primaryStrokeDashoffset}
            strokeLinecap="round"
            className={cn(
              "transition-all duration-1000 ease-out",
              isOver ? "text-destructive" : (burnRate > 0 ? "text-indigo-600" : "text-transparent")
            )}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={cn("text-2xl font-bold tracking-tighter leading-none", isOver && "text-destructive")}>
            {burnRate}%
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mt-1">Logged</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex-1 grid grid-cols-3 gap-6 w-full">
        <div className="flex flex-col gap-1 w-full text-center sm:text-left">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex justify-center sm:justify-start items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Budget</span>
          <span className="text-xl font-semibold tracking-tight">{est > 0 ? \`\${est}h\` : "—"}</span>
        </div>
        <div className="flex flex-col gap-1 w-full text-center sm:text-left border-l border-border/40 pl-6">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex justify-center sm:justify-start items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Logged</span>
          <span className="text-xl font-semibold tracking-tight">{loggedHours}h</span>
        </div>
        <div className="flex flex-col gap-1 w-full text-center sm:text-left border-l border-border/40 pl-6">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex justify-center sm:justify-start items-center gap-1.5">Remaining</span>
          <span className={cn("text-xl font-semibold tracking-tight", est && remaining === 0 ? "text-success" : "")}>
            {est > 0 ? \`\${remaining}h\` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
`;

code = code.replace(
  /function TaskBody\([\s\S]*?\/\* ---------- DESCRIPTION ---------- \*\//,
  newTaskBody + "\n\n/* ---------- DESCRIPTION ---------- */",
);

// We need to style the "AttachmentsTab" so it looks clean without heavy borders
// Let's modify AttachmentsTab to be cleaner
code = code.replace(
  /className="max-h-\[300px\] overflow-y-auto pr-2 space-y-2"/,
  'className="space-y-3"',
);
code = code.replace(
  /<div\n(\s+)className="group flex flex-col p-3 rounded-lg border border-border bg-muted\/30"/g,
  '<div\n$1className="group flex flex-col p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-colors shadow-sm"',
);

// Modify Activity Tab styling
code = code.replace(
  /<div className="flex items-start gap-4 mb-8">/g,
  '<div className="flex items-start gap-3 mb-8">',
);
code = code.replace(
  /<div className="flex items-start gap-4 relative group">/g,
  '<div className="flex items-start gap-3 relative group">',
);

fs.writeFileSync(file, code);

console.log("Done");
