import * as fs from "fs";

const file = "src/components/task-detail/TaskDetailDialog.tsx";
const code = fs.readFileSync(file, "utf8");

// We want to rewrite TaskBody and related components.

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
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur px-5 py-3 flex items-start gap-3 shrink-0">
        <span
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold shrink-0 mt-0.5",
            meta.bg,
            meta.color,
          )}
          title={meta.label}
        >
          {meta.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
            <span>{workspace?.name ?? item.workspaceCode}</span>
            <ChevronRight className="h-3 w-3" />
            <span>{meta.label}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{item.id}</span>
          </div>
          <InlineTitle
            value={item.title}
            onChange={(v) => updateItem(item.id, { title: v })}
            disabled={isProjectMember}
          />
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <Badge
              variant="secondary"
              className="bg-info/15 text-info border-0"
            >
              {item.status}
            </Badge>
            <Badge
              variant="outline"
              className={cn(PRIORITY_META[item.priority].color)}
            >
              {PRIORITY_META[item.priority].label} priority
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end max-w-sm">
          {nextStatus && !isProjectMember && (
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-primary text-primary-foreground"
              onClick={() => {
                const ok = updateItem(item.id, { status: nextStatus });
                if (ok) {
                  toast.success(\`Moved to \${nextStatus}\`);
                }
              }}
            >
              {nextStatus === "In Progress" ? (
                <Play className="h-3.5 w-3.5" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" />
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
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => {
                updateItem(item.id, { status: statuses[0] });
                toast.success("Reopened");
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reopen
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5"
            onClick={() => {
              navigator.clipboard?.writeText(\`\${item.id} · \${item.title}\`);
              toast.success("Link copied");
            }}
          >
            <Share2 className="h-3.5 w-3.5" /> Share Task
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5"
            onClick={() => {
              document.getElementById("file-upload-" + item.id)?.click();
            }}
          >
            <Paperclip className="h-3.5 w-3.5" /> Attach Document
          </Button>
          {onExpand && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-primary/20 hover:border-primary/50 text-foreground"
              onClick={onExpand}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Body - Single Scrolling Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-10">
        
        {/* Task Information Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-muted/20 p-5 rounded-xl border border-border">
          <Row label="Sprint Name">
            <Select
              value={item.sprintId ?? "__b"}
              disabled={isProjectMember}
              onValueChange={(v) =>
                updateItem(item.id, { sprintId: v === "__b" ? undefined : v })
              }
            >
              <SelectTrigger className="h-7 text-xs bg-background">
                <SelectValue />
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
          </Row>
          <Row label="Story Points">
            <Input
              type="number"
              min={0}
              disabled={isProjectMember}
              value={item.points}
              onChange={(e) =>
                updateItem(item.id, { points: Number(e.target.value) || 0 })
              }
              className="h-7 text-xs bg-background"
            />
          </Row>
          <Row label="Assignee">
            <PersonSelect
              value={item.assigneeId}
              onChange={(v) => updateItem(item.id, { assigneeId: v })}
              memberIds={memberIds}
              disabled={isProjectMember}
            />
          </Row>
          <Row label="Budget Hours">
            <Input
              type="number"
              min={0}
              disabled={isProjectMember}
              value={item.budgetHours ?? ""}
              onChange={(e) =>
                updateItem(item.id, {
                  budgetHours:
                    e.target.value === ""
                      ? undefined
                      : Number(e.target.value) || 0,
                })
              }
              className="h-7 text-xs bg-background"
              placeholder="—"
            />
          </Row>
          <Row label="Parent">
            <Select
              value={item.parentId ?? "__n"}
              disabled={isProjectMember}
              onValueChange={(v) =>
                updateItem(item.id, { parentId: v === "__n" ? undefined : v })
              }
            >
              <SelectTrigger className="h-7 text-xs bg-background">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__n">None</SelectItem>
                {parentCandidates.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
          <Row label="Start Date">
            <Input
              type="date"
              disabled={isProjectMember}
              value={item.startDate ?? ""}
              onChange={(e) =>
                updateItem(item.id, { startDate: e.target.value || undefined })
              }
              className="h-7 text-xs bg-background"
            />
          </Row>
          <Row label="End Date">
            <Input
              type="date"
              disabled={isProjectMember}
              value={item.dueDate ?? ""}
              onChange={(e) =>
                updateItem(item.id, { dueDate: e.target.value || undefined })
              }
              className="h-7 text-xs bg-background"
            />
          </Row>
          <Row label="Created Date">
            <div className="h-7 flex items-center text-xs px-2 text-foreground/80 font-medium bg-background border border-border rounded-md">
              {item.activity?.[0]?.at
                ? new Date(item.activity[0].at).toLocaleDateString()
                : "—"}
            </div>
          </Row>
          <Row label="Last Updated Date">
            <div className="h-7 flex items-center text-xs px-2 text-foreground/80 font-medium bg-background border border-border rounded-md">
              {item.activity?.[item.activity.length - 1]?.at
                ? new Date(
                    item.activity[item.activity.length - 1].at,
                  ).toLocaleDateString()
                : "—"}
            </div>
          </Row>
        </section>

        {/* Description Section */}
        <section>
          <DescriptionTab item={item} isProjectMember={isProjectMember} />
        </section>

        {/* Task Progress & Burndown */}
        <section>
          <TaskProgressSection item={item} />
        </section>

        {/* Subtasks Section */}
        <section>
          <SubtasksSection item={item} isProjectMember={isProjectMember} onOpenOther={onOpenOther} />
        </section>

        {/* Documents Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Documents</h2>
          <div className="rounded-xl border border-border bg-card p-4">
            <AttachmentsTab item={item} />
          </div>
        </section>

        {/* Lower Content Tabs */}
        <section>
          <nav className="flex items-center border-b border-border mb-6">
            {TABS.filter(t => ['activity', 'dependencies', 'time'].includes(t.id)).map((t) => {
              if (isProjectMember && t.id === "dependencies") return null;
              const Icon = t.icon;
              const active = tab === t.id || (!['activity', 'dependencies', 'time'].includes(tab) && t.id === 'activity');
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 h-12 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    active
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </nav>
          <div>
             {(tab === 'activity' || !['activity', 'dependencies', 'time'].includes(tab)) && <ActivityTab item={item} />}
             {tab === 'dependencies' && <DependenciesTab item={item} onOpenOther={onOpenOther} />}
             {tab === 'time' && <TimeTrackingTab item={item} />}
          </div>
        </section>

      </div>
    </div>
  );
}

function TaskProgressSection({ item }: { item: BacklogItem }) {
  const est = item.budgetHours ?? 0;
  const loggedHours = (item.worklogs ?? []).reduce((a, b) => a + b.hours, 0);
  const remaining = Math.max(0, est - loggedHours);
  const burnRate = est > 0 ? Math.round((loggedHours / est) * 100) : 0;

  const burndownData = useMemo(() => {
    if (!est) return [];
    let currentRemaining = est;
    const sortedLogs = [...(item.worklogs ?? [])].sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    const logsByDate: Record<string, number> = {};
    sortedLogs.forEach((w) => {
      logsByDate[w.date] = (logsByDate[w.date] || 0) + w.hours;
    });

    const dates = Object.keys(logsByDate);
    const data = [{ day: "Start", remaining: est, logged: 0 }];

    dates.forEach((date) => {
      const logged = logsByDate[date];
      currentRemaining = Math.max(0, currentRemaining - logged);
      data.push({
        day: new Date(date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        remaining: currentRemaining,
        logged: logged,
      });
    });

    return data;
  }, [item.worklogs, est]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Task Progress</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Budget Hours" value={est > 0 ? \`\${est}h\` : "—"} />
        <SummaryCard label="Logged Hours" value={\`\${loggedHours}h\`} />
        <SummaryCard label="Remaining Hours" value={<span className={est && remaining === 0 ? "text-success" : ""}>{est > 0 ? \`\${remaining}h\` : "—"}</span>} />
        <SummaryCard label="Burn Rate %" value={est > 0 ? \`\${burnRate}%\` : "—"} />
      </div>

      {est > 0 && burndownData.length > 1 && (
        <div className="rounded-xl border border-border bg-card p-5 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Task Burndown</h3>
          </div>
          <div className="h-64 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={burndownData}>
                <defs>
                  <linearGradient
                    id="colorRemaining"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  className="opacity-50"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  dx={-10}
                />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number, name: string) => [value + 'h', name === 'remaining' ? 'Remaining Hours' : 'Logged Hours']}
                />
                <Area
                  type="stepAfter"
                  dataKey="remaining"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRemaining)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function SubtasksSection({ item, isProjectMember, onOpenOther }: { item: BacklogItem; isProjectMember?: boolean; onOpenOther: (id: string) => void }) {
  const { store, createItem, updateItem, deleteItem } = useWorkspaceStore();
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [subDraftTitle, setSubDraftTitle] = useState("");
  const [subDraftAssigneeId, setSubDraftAssigneeId] = useState<
    string | undefined
  >(undefined);
  const [subDraftStatus, setSubDraftStatus] = useState("");
  const [subDraftPriority, setSubDraftPriority] = useState<Priority>("medium");
  const [subDraftDueDate, setSubDraftDueDate] = useState("");
  const [subDraftPoints, setSubDraftPoints] = useState<number>(1);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubTitle, setNewSubTitle] = useState("");
  const [newSubAssigneeId, setNewSubAssigneeId] = useState<string | undefined>(
    undefined,
  );
  const [newSubStatus, setNewSubStatus] = useState("");
  const [newSubPriority, setNewSubPriority] = useState<Priority>("medium");
  const [newSubDueDate, setNewSubDueDate] = useState("");
  const [newSubPoints, setNewSubPoints] = useState<number>(1);

  const workspace = store.workspaces.find((w) => w.code === item.workspaceCode);
  const statuses = workspace?.statuses ?? [
    "Todo",
    "In Progress",
    "In Review",
    "Completed",
  ];

  const subtasks = store.items.filter((i) => i.parentId === item.id);
  const subDone = subtasks.filter((s) => s.status === "Completed").length;

  const startEditing = (s: BacklogItem) => {
    if (isProjectMember) return;
    setEditingSubtaskId(s.id);
    setSubDraftTitle(s.title);
    setSubDraftAssigneeId(s.assigneeId);
    setSubDraftStatus(s.status);
    setSubDraftPriority(s.priority);
    setSubDraftDueDate(s.dueDate || "");
    setSubDraftPoints(s.points || 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
         <h2 className="text-lg font-semibold">Subtasks</h2>
         {subtasks.length > 0 && <span className="text-xs text-muted-foreground">({subDone}/{subtasks.length} Done)</span>}
      </div>
      {(subDone < subtasks.length && subtasks.length > 0) && (
         <p className="text-xs text-muted-foreground flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-warning"/> Parent task cannot be completed until all subtasks are completed.</p>
      )}
      
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex justify-end p-2 border-b border-border bg-muted/10">
          {!showAddForm && !isProjectMember && (
            <Button
              size="sm"
              className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1 flex items-center cursor-pointer"
              onClick={() => {
                setShowAddForm(true);
                setNewSubTitle("");
                setNewSubAssigneeId(undefined);
                setNewSubStatus(workspace?.statuses[0] || "Todo");
                setNewSubPriority("medium");
                setNewSubPoints(1);
                setNewSubDueDate("");
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Add Subtask
            </Button>
          )}
        </div>
        {/* Table Headers */}
        {subtasks.length > 0 && (
          <div className="hidden md:grid grid-cols-[80px_1fr_120px_110px_110px_90px_60px_70px] items-center px-4 py-2 border-b border-border bg-muted/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div>ID</div>
            <div>Title</div>
            <div>Assignee</div>
            <div>Status</div>
            <div>Priority</div>
            <div>Due Date</div>
            <div>Points</div>
            <div className="text-right">Actions</div>
          </div>
        )}

        {/* Empty State */}
        {subtasks.length === 0 && !showAddForm ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-3xl">📂</span>
            <p className="text-sm text-muted-foreground font-medium">
              No subtasks have been created.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* ADD SUBTASK FORM */}
            {showAddForm && (
              <div className="p-4 bg-muted/10 space-y-4 border-b border-border">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                  New Subtask Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Subtask Title *
                    </label>
                    <Input
                      value={newSubTitle}
                      onChange={(e) => setNewSubTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Assignee
                    </label>
                    <Select
                      value={newSubAssigneeId || "unassigned"}
                      onValueChange={(v) =>
                        setNewSubAssigneeId(v === "unassigned" ? undefined : v)
                      }
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {DIRECTORY.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            <div className="flex items-center gap-1.5">
                              <PersonAvatar userId={person.id} size="xs" />
                              <span>{person.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Status
                    </label>
                    <Select
                      value={newSubStatus}
                      onValueChange={(v) => setNewSubStatus(v)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((st) => (
                          <SelectItem key={st} value={st}>
                            {st}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Priority
                    </label>
                    <Select
                      value={newSubPriority}
                      onValueChange={(v) => setNewSubPriority(v as Priority)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_META).map(([p, m]) => (
                          <SelectItem key={p} value={p}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Story Points
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={newSubPoints}
                      onChange={(e) =>
                        setNewSubPoints(parseInt(e.target.value) || 0)
                      }
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Due Date
                    </label>
                    <Input
                      type="date"
                      value={newSubDueDate}
                      onChange={(e) => setNewSubDueDate(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs cursor-pointer"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                    onClick={() => {
                      if (!newSubTitle.trim()) {
                        toast.error("Subtask title is required");
                        return;
                      }
                      createItem({
                        workspaceCode: item.workspaceCode,
                        type: "task",
                        title: newSubTitle.trim(),
                        priority: newSubPriority,
                        points: newSubPoints,
                        parentId: item.id,
                        sprintId: item.sprintId,
                        status:
                          newSubStatus || (workspace?.statuses[0] ?? "Todo"),
                        assigneeId: newSubAssigneeId,
                        dueDate: newSubDueDate || undefined,
                      });
                      setNewSubTitle("");
                      setShowAddForm(false);
                      toast.success("Subtask added successfully");
                    }}
                  >
                    Save Subtask
                  </Button>
                </div>
              </div>
            )}

            {/* SUBTASK ROWS */}
            {subtasks.map((s) => {
              const isEditing = editingSubtaskId === s.id;
              const subAssignee = DIRECTORY.find((d) => d.id === s.assigneeId);
              return (
                <div key={s.id} className="p-3 md:p-0">
                  {isEditing ? (
                    <div className="p-4 bg-muted/20 border border-indigo-500/20 rounded-md space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <label className="text-[10px] uppercase font-semibold text-muted-foreground">
                            Title
                          </label>
                          <Input
                            value={subDraftTitle}
                            onChange={(e) => setSubDraftTitle(e.target.value)}
                            className="h-8 text-xs mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-muted-foreground">
                            Assignee
                          </label>
                          <Select
                            value={subDraftAssigneeId || "unassigned"}
                            onValueChange={(v) =>
                              setSubDraftAssigneeId(
                                v === "unassigned" ? undefined : v,
                              )
                            }
                          >
                            <SelectTrigger className="h-8 text-xs mt-1">
                              <SelectValue placeholder="Unassigned" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">
                                Unassigned
                              </SelectItem>
                              {DIRECTORY.map((person) => (
                                <SelectItem key={person.id} value={person.id}>
                                  <div className="flex items-center gap-1.5">
                                    <PersonAvatar
                                      userId={person.id}
                                      size="xs"
                                    />
                                    <span>{person.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-muted-foreground">
                            Status
                          </label>
                          <Select
                            value={subDraftStatus}
                            onValueChange={(v) => setSubDraftStatus(v)}
                          >
                            <SelectTrigger className="h-8 text-xs mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statuses.map((st) => (
                                <SelectItem key={st} value={st}>
                                  {st}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-muted-foreground">
                            Priority
                          </label>
                          <Select
                            value={subDraftPriority}
                            onValueChange={(v) =>
                              setSubDraftPriority(v as Priority)
                            }
                          >
                            <SelectTrigger className="h-8 text-xs mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PRIORITY_META).map(([p, m]) => (
                                <SelectItem key={p} value={p}>
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-muted-foreground">
                            Story Points
                          </label>
                          <Input
                            type="number"
                            min={0}
                            value={subDraftPoints}
                            onChange={(e) =>
                              setSubDraftPoints(parseInt(e.target.value) || 0)
                            }
                            className="h-8 text-xs mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-muted-foreground">
                            Due Date
                          </label>
                          <Input
                            type="date"
                            value={subDraftDueDate}
                            onChange={(e) => setSubDraftDueDate(e.target.value)}
                            className="h-8 text-xs mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs cursor-pointer"
                          onClick={() => setEditingSubtaskId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                          onClick={() => {
                            if (!subDraftTitle.trim()) {
                              toast.error("Subtask title is required");
                              return;
                            }
                            updateItem(s.id, {
                              title: subDraftTitle.trim(),
                              assigneeId: subDraftAssigneeId || undefined,
                              status: subDraftStatus,
                              priority: subDraftPriority,
                              dueDate: subDraftDueDate || undefined,
                              points: subDraftPoints,
                            });
                            setEditingSubtaskId(null);
                            toast.success("Subtask updated");
                          }}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="md:grid grid-cols-[80px_1fr_120px_110px_110px_90px_60px_70px] items-center md:px-4 py-2.5 hover:bg-muted/30 transition-all text-xs flex flex-col md:flex-row space-y-2 md:space-y-0 gap-2 md:gap-0">
                      {/* ID */}
                      <button
                        onClick={() => onOpenOther(s.id)}
                        className="font-mono text-[10px] text-primary text-left truncate font-bold w-full md:w-auto tracking-tight cursor-pointer hover:underline"
                      >
                        {s.id}
                      </button>

                      {/* Title */}
                      <button
                        onClick={() => onOpenOther(s.id)}
                        className="text-left font-medium truncate w-full md:w-auto md:pr-3 cursor-pointer hover:underline text-foreground"
                        title={s.title}
                      >
                        {s.title}
                      </button>

                      {/* Assignee Selection */}
                      <div className="w-full md:w-auto">
                        <Select
                          value={s.assigneeId || "unassigned"}
                          disabled={isProjectMember}
                          onValueChange={(val) => {
                            updateItem(s.id, {
                              assigneeId:
                                val === "unassigned" ? undefined : val,
                            });
                            toast.success("Assignee updated");
                          }}
                        >
                          <SelectTrigger className="h-7 text-[11px] max-w-[110px] border-none bg-transparent shadow-none hover:bg-muted/80 py-0 px-2 cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">
                              <span className="text-muted-foreground italic">
                                Unassigned
                              </span>
                            </SelectItem>
                            {DIRECTORY.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                <div className="flex items-center gap-1.5">
                                  <PersonAvatar userId={p.id} size="xs" />
                                  <span className="truncate">
                                    {p.name.split(" ")[0]}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Status Selection */}
                      <div className="w-full md:w-auto">
                        <Select
                          value={s.status}
                          disabled={isProjectMember}
                          onValueChange={(val) => {
                            updateItem(s.id, { status: val });
                            toast.success("Status updated");
                          }}
                        >
                          <SelectTrigger className="h-7 text-[11px] max-w-[100px] border border-border/60 bg-background/50 py-0 px-2 cursor-pointer shadow-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((st) => (
                              <SelectItem key={st} value={st}>
                                {st}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Priority Selection */}
                      <div className="w-full md:w-auto">
                        <Select
                          value={s.priority}
                          disabled={isProjectMember}
                          onValueChange={(val) => {
                            updateItem(s.id, { priority: val as Priority });
                            toast.success("Priority updated");
                          }}
                        >
                          <SelectTrigger className="h-7 text-[11px] max-w-[100px] border-none bg-transparent shadow-none hover:bg-muted/80 py-0 px-2 cursor-pointer">
                            <span
                              className={cn(
                                "text-[11px] font-semibold",
                                PRIORITY_META[s.priority].color,
                              )}
                            >
                              {PRIORITY_META[s.priority].label}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PRIORITY_META).map(([p, m]) => (
                              <SelectItem key={p} value={p}>
                                <span
                                  className={cn(
                                    "text-xs font-semibold",
                                    m.color,
                                  )}
                                >
                                  {m.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Due Date Display */}
                      <div className="w-full md:w-auto">
                        {s.dueDate ? (
                          <DueDateBadge
                            dueDate={s.dueDate}
                            isCompleted={s.status === "Completed"}
                            className="h-6"
                          />
                        ) : (
                          <span className="text-muted-foreground/50 text-[11px]">
                            —
                          </span>
                        )}
                      </div>

                      {/* Story Points */}
                      <div className="w-full md:w-auto font-mono text-xs pl-1">
                        {s.points} pts
                      </div>

                      {/* Actions (Edit / Delete) */}
                      {!isProjectMember && (
                        <div className="flex items-center justify-end gap-1 w-full md:w-auto text-right pr-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => startEditing(s)}
                            title="Edit subtask"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this subtask?",
                                )
                              ) {
                                deleteItem(s.id);
                                toast.success("Subtask deleted");
                              }
                            }}
                            title="Delete subtask"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Ensure DescriptionTab accepts isProjectMember
// In the original file it's: function DescriptionTab({ item }: { item: BacklogItem })
`;

let newCode = code.replace(
  /function TaskBody\([\s\S]*?\/\* ---------- DESCRIPTION ---------- \*\//,
  newTaskBody + "\n\n/* ---------- DESCRIPTION ---------- */",
);

newCode = newCode.replace(
  /function DescriptionTab\(\{(.*?)\}\: \{(.*?)\}\) \{/,
  "function DescriptionTab({ item, isProjectMember }: { item: BacklogItem; isProjectMember?: boolean; }) {",
);

fs.writeFileSync(file, newCode);
console.log("Done");
