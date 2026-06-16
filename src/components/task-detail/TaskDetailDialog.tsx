import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIcon,
  AlertTriangle,
  ArrowRight,
  AlertCircle,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  GitBranch,
  GitPullRequest,
  ListTree,
  Maximize2,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Share2,
  Smile,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  X,
  Orbit,
  User as UserIcon,
  Trash,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MultiSelectPeople } from "@/components/MultiSelectPeople";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useWorkspaceStore,
  DIRECTORY,
  ISSUE_TYPE_META,
  PRIORITY_META,
  type BacklogItem,
  type Priority,
  type Attachment,
  type DependencyRisk,
} from "@/lib/workspace-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { PersonAvatar } from "../PersonAvatar";
import { getDueDateStatus } from "@/lib/due-date-utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

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
    <h2
      className={cn(
        "text-2xl font-bold tracking-tight mt-1 hover:bg-muted/40 rounded-lg px-2 -mx-2 transition-colors",
        !disabled && "cursor-text",
      )}
      onClick={() => {
        if (!disabled) setEditing(true);
      }}
    >
      {value}
    </h2>
  );
}

type TabId = "activity" | "comments" | "time";

export function TaskDetailDrawer({
  itemId,
  workspaceCode,
  open,
  onOpenChange,
  mode = "dialog",
  onOpenOther,
  initialTab,
}: {
  itemId: string | null;
  workspaceCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "dialog" | "sheet";
  onOpenOther?: (id: string, initialTab?: string) => void;
  initialTab?: string;
}) {
  const [tab, setTab] = useState<TabId>((initialTab as TabId) || "activity");
  const { store } = useWorkspaceStore();
  const item = store.items.find((i) => i.id === itemId);

  // Reset tab when item changes
  useEffect(() => {
    setTab((initialTab as TabId) || "activity");
  }, [itemId, initialTab]);

  if (!item) return null;

  const handleOpenOther = (id: string, initialTab?: string) => {
    if (onOpenOther) {
      onOpenOther(id, initialTab);
    }
  };

  const bodyProps = {
    item,
    tab,
    setTab,
    onOpenOther: handleOpenOther,
    onClose: () => onOpenChange(false),
  };

  if (mode === "dialog") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[90vw] w-[1000px] h-[90vh] p-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur shadow-2xl border-border/60 rounded-2xl sm:rounded-2xl gap-0">
          <DialogTitle className="sr-only">
            Task Details: {item.title}
          </DialogTitle>
          <TaskBody {...bodyProps} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[1000px] max-w-[90vw] sm:max-w-[90vw] p-0 flex flex-col border-l border-border/60 shadow-xl gap-0">
        <SheetTitle className="sr-only">Task Details: {item.title}</SheetTitle>
        <TaskBody {...bodyProps} />
      </SheetContent>
    </Sheet>
  );
}

function QuietField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5 truncate">
        {label}
      </span>
      <div className="flex items-center text-sm font-medium text-foreground min-w-0">
        {children}
      </div>
    </div>
  );
}

function TaskBody({
  item,
  tab,
  setTab,
  onOpenOther,
  onClose,
}: {
  item: BacklogItem;
  tab: TabId;
  setTab: (t: TabId) => void;
  onOpenOther: (id: string, initialTab?: string) => void;
  onClose: () => void;
}) {
  const { store, updateItem } = useWorkspaceStore();
  const workspace = store.workspaces.find((w) => w.code === item.workspaceCode);
  const meta = ISSUE_TYPE_META[item.type];
  const sprints = store.sprints.filter(
    (s) => s.workspaceCode === item.workspaceCode,
  );
  const parentCandidates = store.items.filter(
    (i) => i.workspaceCode === item.workspaceCode && i.id !== item.id,
  );

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
  const subtasks = store.items.filter((i) => i.parentId === item.id);
  const parent = store.items.find((i) => i.id === item.parentId);

  const memberIds = Array.from(
    new Set([...(workspace?.ownerIds ?? []), ...(workspace?.memberIds ?? [])]),
  );

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden bg-background">
      {/* Header Section (Sticky) */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur px-6 py-4 flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>{workspace?.name ?? item.workspaceCode}</span>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <span>{meta.label}</span>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <span className="text-foreground tracking-tight font-semibold">
              {item.id}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `${item.id} · ${item.title}`,
                    );
                    toast.success("Link copied");
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
                  Share Task
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    document
                      .getElementById("header-file-upload-" + item.id)
                      ?.click()
                  }
                >
                  <Paperclip className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
                  Attach Document
                </DropdownMenuItem>
                <input
                  id={"header-file-upload-" + item.id}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    Array.from(e.target.files).forEach((f) => {
                      const url = URL.createObjectURL(f);
                      store.addAttachment?.(item.id, {
                        name: f.name,
                        mime: f.type || "application/octet-stream",
                        size: f.size,
                        url,
                        uploadedBy: myUserId,
                      });
                    });
                    toast.success(`${e.target.files.length} file(s) attached`);
                  }}
                />
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <span
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg text-[15px] font-bold shrink-0 mt-0.5",
              meta.bg,
              meta.color,
            )}
            title={meta.label}
          >
            {meta.icon}
          </span>
          <div className="flex-1 min-w-0">
            <InlineTitle
              value={item.title}
              onChange={(v) => updateItem(item.id, { title: v })}
              disabled={isProjectMember}
            />
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Select
                value={item.status}
                disabled={isProjectMember}
                onValueChange={(v) => {
                  if (
                    v === "Completed" &&
                    item.type !== "feature" &&
                    subtasks.some((s) => s.status !== "Completed")
                  ) {
                    toast.error(
                      "Parent task cannot be completed until all subtasks are completed.",
                    );
                    return;
                  }
                  updateItem(item.id, { status: v });
                }}
              >
                <SelectTrigger className="h-7 text-xs bg-muted/50 hover:bg-muted text-foreground border-transparent px-3 rounded-md transition-colors w-auto gap-2 shadow-none font-medium">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
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
                    "h-7 text-xs bg-muted/50 hover:bg-muted text-foreground border-transparent px-3 rounded-md transition-colors w-auto gap-2 shadow-none font-medium",
                    PRIORITY_META[item.priority].color,
                  )}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      {PRIORITY_META[p as Priority].label} priority
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={item.assigneeId ?? "__n"}
                disabled={isProjectMember}
                onValueChange={(v) =>
                  updateItem(item.id, {
                    assigneeId: v === "__n" ? undefined : v,
                  })
                }
              >
                <SelectTrigger className="h-7 text-xs bg-muted/50 hover:bg-muted text-foreground border-transparent px-3 rounded-md transition-colors w-auto gap-2 shadow-none font-medium">
                  {item.assigneeId ? (
                    <div className="flex items-center gap-1.5 -ml-1">
                      <PersonAvatar userId={item.assigneeId} size="sm" />
                      <span className="truncate">
                        {
                          DIRECTORY.find(
                            (d) => d.id === item.assigneeId,
                          )?.name.split(" ")[0]
                        }
                      </span>
                    </div>
                  ) : (
                    <>
                      <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Assignee</span>
                    </>
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__n">Unassigned</SelectItem>
                  {(memberIds.length
                    ? memberIds
                    : DIRECTORY.map((d) => d.id)
                  ).map((id) => {
                    const p = DIRECTORY.find((d) => d.id === id);
                    return (
                      <SelectItem key={id} value={id} className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <PersonAvatar userId={id} size="sm" />
                          {p?.name ?? id}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {item.type !== "feature" && (
                <Select
                  value={item.sprintId ?? "__b"}
                  disabled={isProjectMember}
                  onValueChange={(v) =>
                    updateItem(item.id, {
                      sprintId: v === "__b" ? undefined : v,
                    })
                  }
                >
                  <SelectTrigger className="h-7 text-xs bg-muted/50 hover:bg-muted text-foreground border-transparent px-3 rounded-md transition-colors w-auto gap-2 shadow-none font-medium">
                    <Orbit className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>
                      {item.sprintId
                        ? sprints.find((s) => s.id === item.sprintId)?.name
                        : "Sprint"}
                    </span>
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
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Body - Single Column Continuous Flow */}
      <div className="flex-1 overflow-y-auto w-full relative">
        <div className="max-w-[800px] mx-auto w-full px-5 py-4 pb-16 space-y-4">
          {/* Metadata Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-start pb-4 border-b border-border/60">
            <QuietField label="Start">
              <Input
                type="date"
                disabled={isProjectMember}
                value={item.startDate ?? ""}
                onChange={(e) =>
                  updateItem(item.id, {
                    startDate: e.target.value || undefined,
                  })
                }
                className="h-7 w-full p-0 border-0 bg-transparent shadow-none hover:bg-muted/40 cursor-pointer focus-visible:ring-0 font-medium text-[13px] text-foreground -ml-1 pl-1"
              />
            </QuietField>
            <QuietField label="Due">
              <Input
                type="date"
                disabled={isProjectMember}
                value={item.dueDate ?? ""}
                onChange={(e) =>
                  updateItem(item.id, { dueDate: e.target.value || undefined })
                }
                className="h-7 w-full p-0 border-0 bg-transparent shadow-none hover:bg-muted/40 cursor-pointer focus-visible:ring-0 font-medium text-[13px] text-foreground -ml-1 pl-1"
              />
            </QuietField>
            <QuietField label="Story Pts">
              {item.type === "feature" ? (
                <span className="text-[13px] font-medium text-foreground leading-7 block h-7 truncate pl-1">
                  {subtasks.reduce((sum, st) => sum + (st.points || 0), 0)}
                </span>
              ) : (
                <Input
                  type="number"
                  min={0}
                  disabled={isProjectMember}
                  value={item.points}
                  onChange={(e) =>
                    updateItem(item.id, { points: Number(e.target.value) || 0 })
                  }
                  className="h-7 w-[60px] p-0 border-0 bg-transparent shadow-none hover:bg-muted/40 cursor-pointer focus-visible:ring-0 font-medium text-[13px] text-foreground -ml-1 pl-1"
                />
              )}
            </QuietField>
            <QuietField label="Budget (hrs)">
              {item.type === "feature" ? (
                <span className="text-[13px] font-medium text-foreground leading-7 block h-7 truncate pl-1">
                  {subtasks.reduce((sum, st) => sum + (st.budgetHours || 0), 0)}
                </span>
              ) : (
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
                  className="h-7 w-[60px] p-0 border-0 bg-transparent shadow-none hover:bg-muted/40 cursor-pointer focus-visible:ring-0 font-medium text-[13px] text-foreground -ml-1 pl-1"
                />
              )}
            </QuietField>
            <QuietField label="Parent">
              <Select
                value={item.parentId ?? "__n"}
                disabled={isProjectMember}
                onValueChange={(v) =>
                  updateItem(item.id, { parentId: v === "__n" ? undefined : v })
                }
              >
                <SelectTrigger className="h-7 p-0 border-0 shadow-none bg-transparent hover:bg-muted/40 font-medium text-[13px] focus-visible:ring-0 -ml-1 pl-1 justify-start w-full">
                  <span className="truncate">{parent ? parent.id : "—"}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__n">None</SelectItem>
                  {parentCandidates.map((c) => (
                    <SelectItem
                      key={c.id}
                      value={c.id}
                      className="text-xs truncate max-w-[200px]"
                    >
                      {c.id} · {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </QuietField>
            <QuietField label="Created">
              <span className="text-[13px] font-medium text-foreground/80 leading-7 block h-7 truncate">
                {item.activity?.[0]?.at
                  ? new Date(item.activity[0].at).toLocaleDateString()
                  : "—"}
              </span>
            </QuietField>
            <QuietField label="Updated">
              <span className="text-[13px] font-medium text-foreground/80 leading-7 block h-7 truncate">
                {item.activity?.[item.activity.length - 1]?.at
                  ? new Date(
                      item.activity[item.activity.length - 1].at,
                    ).toLocaleDateString()
                  : "—"}
              </span>
            </QuietField>
          </div>

          {/* Effort & Progress */}
          <div>
            <TaskProgressSection item={item} />
          </div>

          {/* Description */}
          <div>
            <DescriptionSection
              item={item}
              isProjectMember={isProjectMember}
              updateItem={updateItem}
            />
          </div>

          {/* Subtasks */}
          <div>
            <SubtasksSection
              item={item}
              isProjectMember={isProjectMember}
              onOpenOther={onOpenOther}
            />
          </div>

          {/* Dependencies & Risks */}
          {!isProjectMember && (
            <div>
              <DependenciesTab item={item} />
            </div>
          )}

          {/* Documents */}
          <div className="space-y-3">
            <h3 className="text-[15px] font-semibold text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
              <Paperclip className="h-4 w-4 text-muted-foreground" /> Documents
            </h3>
            <AttachmentsTab item={item} />
          </div>

          {/* Bottom Collaboration Tabs */}
          <div className="pt-2 mb-4">
            <nav className="flex items-center gap-6 border-b border-border/60 mb-4 sticky top-[73px] bg-background/90 backdrop-blur z-10 pt-2 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
              {[
                { id: "activity", label: "Activity", icon: ActivityIcon },
                { id: "comments", label: "Comments", icon: MessageSquare },
                { id: "time", label: "Time Tracking", icon: Clock },
              ].map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id as TabId)}
                    className={cn(
                      "pb-3 text-[13px] font-semibold transition-all relative whitespace-nowrap cursor-pointer flex items-center gap-2 select-none",
                      active
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <t.icon className="h-3.5 w-3.5" />
                    {t.label}
                    {active && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="min-h-[300px]">
              {tab === "activity" && <ActivityTab item={item} />}
              {tab === "comments" && <CommentsTab item={item} />}
              {tab === "time" && <TimeTrackingTab item={item} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SECTIONS & TABS
// ----------------------------------------------------------------------

function TaskProgressSection({ item }: { item: BacklogItem }) {
  const { store } = useWorkspaceStore();
  const isFeature = item.type === "feature";
  const subtasks = isFeature
    ? store.items.filter((i) => i.parentId === item.id)
    : [];

  let loggedHrs = (item.worklogs ?? []).reduce((sum, w) => sum + w.hours, 0);
  let budgetHrs = item.budgetHours ?? 0;
  let originalEst = item.estimateHours ?? budgetHrs;

  if (isFeature) {
    budgetHrs = subtasks.reduce((sum, st) => sum + (st.budgetHours ?? 0), 0);
    loggedHrs = subtasks.reduce(
      (sum, st) => sum + (st.worklogs ?? []).reduce((s, w) => s + w.hours, 0),
      0,
    );
    originalEst = subtasks.reduce(
      (sum, st) => sum + (st.estimateHours ?? st.budgetHours ?? 0),
      0,
    );
  }

  const remainingHrs = Math.max(0, originalEst - loggedHrs);
  const burnRate = budgetHrs > 0 ? (loggedHrs / budgetHrs) * 100 : 0;

  const data = [
    { name: "Budget", hours: budgetHrs, fill: "var(--color-budget)" },
    { name: "Logged", hours: loggedHrs, fill: "var(--color-logged)" },
    { name: "Remaining", hours: remainingHrs, fill: "var(--color-remaining)" },
  ];

  return (
    <div className="bg-muted/10 rounded-xl border border-border/40 p-4 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Budget Hours
          </p>
          <p className="text-xl font-semibold">{budgetHrs.toFixed(1)}h</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Logged Hours
          </p>
          <p className="text-xl font-semibold">{loggedHrs.toFixed(1)}h</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Remaining Hours
          </p>
          <p className="text-xl font-semibold">{remainingHrs.toFixed(1)}h</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Burn Rate
          </p>
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "text-xl font-semibold",
                burnRate > 100
                  ? "text-destructive"
                  : "text-green-600 dark:text-green-400",
              )}
            >
              {burnRate.toFixed(1)}%
            </p>
            {burnRate > 100 && (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
          </div>
        </div>
      </div>

      {budgetHrs > 0 && (
        <div
          className="h-[120px] w-full mt-4 [&_.recharts-bar-rectangle]:stroke-transparent"
          style={
            {
              "--color-budget": "hsl(var(--muted-foreground))",
              "--color-logged": "hsl(var(--primary))",
              "--color-remaining": "hsl(var(--orange-500))",
            } as React.CSSProperties
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                width={80}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <RechartsTooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar dataKey="hours" radius={[0, 4, 4, 0]} barSize={20}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function DescriptionSection({
  item,
  isProjectMember,
  updateItem,
}: {
  item: BacklogItem;
  isProjectMember: boolean;
  updateItem: (id: string, updates: Partial<BacklogItem>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.description ?? "");
  useEffect(() => setDraft(item.description ?? ""), [item.description]);

  return (
    <div className="space-y-2 relative group mt-2">
      <div className="absolute -top-8 right-0 z-10 hidden group-hover:block transition-opacity opacity-0 group-hover:opacity-100">
        {!editing && !isProjectMember && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-3 shadow-sm bg-background"
            onClick={() => setEditing(true)}
          >
            Edit details
          </Button>
        )}
      </div>
      {editing ? (
        <div className="space-y-2 relative z-20 border border-indigo-500/40 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 bg-background shadow-sm">
          <div className="flex gap-1 p-2 bg-muted/30 border-b border-border/40">
            {["B", "I", "•", "—", "🔗"].map((t) => (
              <button
                key={t}
                className="px-2.5 h-7 text-xs font-medium rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                type="button"
              >
                {t}
              </button>
            ))}
            <div className="flex-1" />
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs bg-background"
              onClick={() => {
                setEditing(false);
                setDraft(item.description ?? "");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={() => {
                setEditing(false);
                updateItem(item.id, { description: draft });
              }}
            >
              Save
            </Button>
          </div>
          <Textarea
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            placeholder="Add description, links, design references…"
            className="font-mono text-sm min-h-[120px] w-full resize-none p-4 border-0 focus-visible:ring-0 leading-relaxed bg-transparent"
          />
        </div>
      ) : (
        <div
          className={cn(
            "rounded-xl p-3 min-h-[80px] text-[14px] leading-relaxed whitespace-pre-wrap text-foreground/90 transition-colors",
            !isProjectMember && "hover:bg-muted/30 cursor-text",
            !item.description?.trim() && "text-muted-foreground",
          )}
          onClick={() => {
            if (!isProjectMember) setEditing(true);
          }}
        >
          {item.description?.trim() || "Click to add a description..."}
        </div>
      )}
    </div>
  );
}

function SubtaskCreateForm({
  item,
  onCancel,
  onSave,
}: {
  item: BacklogItem;
  onCancel: () => void;
  onSave: (subtask: Partial<BacklogItem>) => void;
}) {
  const { store } = useWorkspaceStore();
  const workspace = store.workspaces.find((w) => w.code === item.workspaceCode);
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [status, setStatus] = useState("Todo");
  const [priority, setPriority] = useState<Priority>("medium");
  const [points, setPoints] = useState(1);
  const [dueDate, setDueDate] = useState("");

  return (
    <div className="space-y-4">
      <h4 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        New Subtask Details
      </h4>
      <div className="space-y-4">
        <div>
          <label className="text-[13px] font-medium text-foreground mb-1.5 flex items-center">
            Subtask Title <span className="text-destructive ml-1">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="rounded-[10px] bg-background border-border/80 text-[13px] py-5 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[13px] font-medium text-foreground block mb-1.5">
              Assignee
            </label>
            <Select
              value={assigneeId ?? "__unassigned__"}
              onValueChange={(v) =>
                setAssigneeId(v === "__unassigned__" ? null : v)
              }
            >
              <SelectTrigger className="rounded-[10px] bg-background border-border/80 text-[13px] h-10 shadow-sm">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__unassigned__">Unassigned</SelectItem>
                {workspace?.memberIds
                  .concat(workspace.ownerIds)
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .map((id) => (
                    <SelectItem key={id} value={id}>
                      {DIRECTORY.find((p) => p.id === id)?.name || id}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[13px] font-medium text-foreground block mb-1.5">
              Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="rounded-[10px] bg-background border-border/80 text-[13px] h-10 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {workspace?.statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[13px] font-medium text-foreground block mb-1.5">
              Priority
            </label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as Priority)}
            >
              <SelectTrigger className="rounded-[10px] bg-background border-border/80 text-[13px] h-10 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[13px] font-medium text-foreground block mb-1.5">
              Story Points
            </label>
            <Input
              type="number"
              min={0}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="rounded-[10px] bg-background border-border/80 text-[13px] h-10 shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-[13px] font-medium text-foreground block mb-1.5">
            Due Date
          </label>
          <div className="relative max-w-sm">
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-[10px] bg-background border-border/80 text-[13px] h-10 shadow-sm pr-10"
            />
            <CalendarIcon className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button
          onClick={onCancel}
          variant="outline"
          className="border-border/60 shadow-sm text-foreground bg-background hover:bg-muted font-medium text-[13px]"
        >
          Cancel
        </Button>
        <Button
          disabled={!title.trim()}
          onClick={() => {
            onSave({
              title,
              assigneeId: assigneeId ?? undefined,
              status,
              priority,
              points,
              dueDate: dueDate || undefined,
            });
          }}
          className="bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm font-medium text-[13px]"
        >
          Save Subtask
        </Button>
      </div>
    </div>
  );
}

function SubtaskListView({
  item,
  subtasks,
  isProjectMember,
  onAdd,
  onOpenOther,
}: {
  item: BacklogItem;
  subtasks: BacklogItem[];
  isProjectMember: boolean;
  onAdd: () => void;
  onOpenOther: (id: string) => void;
}) {
  const { store, updateItem, deleteItem } = useWorkspaceStore();
  const workspace = store.workspaces.find((w) => w.code === item.workspaceCode);
  const doneCount = subtasks.filter((s) => s.status === "Completed").length;

  return (
    <div className="bg-card border border-border/60 shadow-sm rounded-[16px] overflow-hidden flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-border/40 gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-foreground">Subtasks</h3>
          <span className="bg-muted text-muted-foreground text-[12px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
            {doneCount}/{subtasks.length} Done
          </span>
        </div>
        {!isProjectMember && (
          <Button
            onClick={onAdd}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[8px] flex items-center gap-1 h-9 px-4 text-[13px] font-medium shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> Add Subtask
          </Button>
        )}
      </div>

      <div className="overflow-x-auto min-h-[100px] w-full">
        {subtasks.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-[14px]">
            No subtasks found.
          </div>
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead className="bg-muted/30">
              <tr className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">TITLE</th>
                <th className="px-5 py-3 font-medium">ASSIGNEE</th>
                <th className="px-5 py-3 font-medium">STATUS</th>
                <th className="px-5 py-3 font-medium">PRIORITY</th>
                <th className="px-5 py-3 font-medium">DUE DATE</th>
                <th className="px-5 py-3 font-medium">POINTS</th>
                <th className="px-5 py-3 font-medium pr-5 text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {subtasks.map((st) => {
                const isCompleted = st.status === "Completed";
                const pMeta = PRIORITY_META[st.priority];
                const dueDateStatus = st.dueDate
                  ? getDueDateStatus(st.dueDate, isCompleted)
                  : "none";

                return (
                  <tr
                    key={st.id}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    <td
                      className="px-5 py-4 text-blue-600 cursor-pointer hover:underline min-w-[100px]"
                      onClick={() => onOpenOther(st.id)}
                    >
                      {st.id}
                    </td>
                    <td className="px-5 py-4 min-w-[160px] max-w-[200px]">
                      <div
                        className="truncate text-foreground"
                        title={st.title}
                      >
                        {st.title}
                      </div>
                    </td>
                    <td className="px-5 py-4 min-w-[160px]">
                      <Select
                        disabled={isProjectMember}
                        value={st.assigneeId ?? "__unassigned__"}
                        onValueChange={(v) =>
                          updateItem(st.id, {
                            assigneeId: v === "__unassigned__" ? undefined : v,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 border-0 bg-transparent shadow-none hover:bg-muted/40 w-[140px] px-2 text-muted-foreground italic focus:ring-0">
                          {st.assigneeId ? (
                            <div className="flex items-center gap-2 not-italic text-foreground">
                              <PersonAvatar
                                userId={st.assigneeId}
                                size="xs"
                                className="border-0 shadow-sm"
                              />
                              <span className="truncate">
                                {DIRECTORY.find((p) => p.id === st.assigneeId)
                                  ?.name || st.assigneeId}
                              </span>
                            </div>
                          ) : (
                            <span>Unassigned</span>
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="__unassigned__"
                            className="italic text-muted-foreground"
                          >
                            Unassigned
                          </SelectItem>
                          {workspace?.memberIds
                            .concat(workspace.ownerIds)
                            .filter((v, i, a) => a.indexOf(v) === i)
                            .map((id) => (
                              <SelectItem key={id} value={id}>
                                {DIRECTORY.find((p) => p.id === id)?.name || id}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-5 py-4 min-w-[140px]">
                      <Select
                        disabled={isProjectMember}
                        value={st.status}
                        onValueChange={(v) => updateItem(st.id, { status: v })}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-8 shadow-sm text-[12px] bg-background w-[110px] px-3 rounded-full border-border/80 focus:ring-0 hover:bg-muted/20",
                            isCompleted && "opacity-60",
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {workspace?.statuses.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-5 py-4 min-w-[120px]">
                      <Select
                        disabled={isProjectMember}
                        value={st.priority}
                        onValueChange={(v) =>
                          updateItem(st.id, { priority: v as Priority })
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            "h-8 border-0 bg-transparent shadow-none hover:bg-muted/40 w-[100px] px-2 focus:ring-0 font-medium",
                            pMeta.color,
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap min-w-[130px]">
                      {st.dueDate ? (
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium",
                            dueDateStatus === "overdue"
                              ? "border-red-200 bg-red-50 text-red-700"
                              : dueDateStatus === "due-today"
                                ? "border-orange-200 bg-orange-50 text-orange-700"
                                : "border-border/60 bg-muted/20 text-muted-foreground",
                          )}
                        >
                          {dueDateStatus === "due-today" && (
                            <CalendarIcon className="w-3.5 h-3.5" />
                          )}
                          {dueDateStatus === "due-today"
                            ? "Due Today"
                            : new Date(st.dueDate).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground pl-3">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 min-w-[80px]">
                      <span className="text-foreground">
                        {st.points || 0} pts
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right pr-5">
                      <div className="flex items-center justify-end gap-1 text-muted-foreground">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-foreground"
                          onClick={() => onOpenOther(st.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {!isProjectMember && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-destructive"
                            onClick={() => deleteItem(st.id)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function SubtasksSection({
  item,
  isProjectMember,
  onOpenOther,
}: {
  item: BacklogItem;
  isProjectMember: boolean;
  onOpenOther: (id: string) => void;
}) {
  const { store, createItem } = useWorkspaceStore();
  const subtasks = store.items.filter((i) => i.parentId === item.id);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="space-y-4">
      {subtasks.some((s) => s.status !== "Completed") &&
        item.status === "Completed" &&
        item.type !== "feature" && (
          <div className="bg-destructive/10 text-destructive text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Parent task cannot be completed until all subtasks are completed.
          </div>
        )}
      {isCreating ? (
        <div className="bg-card border border-border/60 shadow-sm rounded-[16px] overflow-hidden p-5 animate-in fade-in zoom-in-95 duration-200">
          <SubtaskCreateForm
            item={item}
            onCancel={() => setIsCreating(false)}
            onSave={(payload) => {
              createItem({
                workspaceCode: item.workspaceCode,
                title: payload.title!,
                type: "task",
                status: payload.status!,
                priority: payload.priority!,
                assigneeId: payload.assigneeId,
                dueDate: payload.dueDate,
                points: payload.points || 0,
                parentId: item.id,
                sprintId: item.type === "feature" ? undefined : item.sprintId,
              });
              setIsCreating(false);
            }}
          />
        </div>
      ) : (
        <SubtaskListView
          item={item}
          subtasks={subtasks}
          isProjectMember={isProjectMember}
          onAdd={() => setIsCreating(true)}
          onOpenOther={onOpenOther}
        />
      )}
    </div>
  );
}

function DependenciesTab({ item }: { item: BacklogItem }) {
  const { addDependencyRisk, updateDependencyRisk, removeDependencyRisk } =
    useWorkspaceStore();
  const [filterType, setFilterType] = useState<string>("all");
  const [filterImpact, setFilterImpact] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [isCreating, setIsCreating] = useState(false);
  const [desc, setDesc] = useState("");
  const [mitigationNote, setMitigationNote] = useState("");
  const [type, setType] = useState<"Dependency" | "Risk">("Dependency");
  const [impact, setImpact] = useState<DependencyRisk["impactLevel"]>("Medium");
  const [status, setStatus] = useState<DependencyRisk["status"]>("Open");
  const [owners, setOwners] = useState<string[]>([]);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  const list = item.dependencyRisks ?? [];
  const filteredList = list.filter((rec) => {
    if (filterType !== "all" && rec.type !== filterType) return false;
    if (filterImpact !== "all" && rec.impactLevel !== filterImpact)
      return false;
    if (filterStatus !== "all" && rec.status !== filterStatus) return false;
    return true;
  });

  const handleEdit = (rec: DependencyRisk) => {
    setIsCreating(true);
    setEditingRecordId(rec.id);
    setType(rec.type);
    setDesc(rec.description);
    setMitigationNote(rec.mitigationNote ?? "");
    setImpact(rec.impactLevel);
    setStatus(rec.status);
    setOwners(rec.ownerIds || []);
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingRecordId(null);
    setDesc("");
    setMitigationNote("");
    setType("Dependency");
    setImpact("Medium");
    setStatus("Open");
    setOwners([]);
  };

  const handleSave = () => {
    if (!desc.trim()) return;
    if (editingRecordId) {
      updateDependencyRisk?.(item.id, editingRecordId, {
        type,
        description: desc.trim(),
        mitigationNote: mitigationNote.trim(),
        ownerIds: owners,
        impactLevel: impact,
        status,
      });
    } else {
      addDependencyRisk?.(item.id, {
        type,
        description: desc.trim(),
        mitigationNote: mitigationNote.trim(),
        ownerIds: owners,
        impactLevel: impact,
        status,
      });
    }
    handleCancelEdit();
  };

  const IMPACT_COLORS = {
    Blocker: "bg-red-500",
    Critical: "bg-orange-500",
    High: "bg-amber-500",
    Medium: "bg-blue-500",
    Low: "bg-slate-400",
  };

  const STATUS_COLORS = {
    Open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "In Progress":
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    Closed:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  };

  if (isCreating) {
    return (
      <div className="bg-card border border-border/60 shadow-sm rounded-[16px] overflow-hidden p-5 animate-in fade-in zoom-in-95 duration-200">
        <h4 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-4">
          {editingRecordId ? "Edit Record" : "Add Dependency or Risk"}
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[13px] font-medium text-foreground block mb-1.5">
                Record Type
              </label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as "Dependency" | "Risk")}
              >
                <SelectTrigger className="rounded-[10px] bg-background border-border/80 text-[13px] h-10 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dependency">Dependency</SelectItem>
                  <SelectItem value="Risk">Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[13px] font-medium text-foreground block mb-1.5">
                Status
              </label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as DependencyRisk["status"])}
              >
                <SelectTrigger className="rounded-[10px] bg-background border-border/80 text-[13px] h-10 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[13px] font-medium text-foreground block mb-1.5">
                Impact Level
              </label>
              <Select
                value={impact}
                onValueChange={(v) =>
                  setImpact(v as DependencyRisk["impactLevel"])
                }
              >
                <SelectTrigger className="rounded-[10px] bg-background border-border/80 text-[13px] h-10 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Blocker", "Critical", "High", "Medium", "Low"].map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[13px] font-medium text-foreground block mb-1.5">
                Owners
              </label>
              <MultiSelectPeople
                selectedIds={owners}
                onChange={setOwners}
                onAdd={(id) => setOwners([...owners, id])}
                onRemove={(id) => setOwners(owners.filter((o) => o !== id))}
                placeholder="Select owners..."
                buttonClassName="h-10 text-[13px] rounded-[10px] bg-background border-border/80 shadow-sm w-full font-normal"
              />
            </div>
          </div>
          <div>
            <label className="text-[13px] font-medium text-foreground block mb-1.5">
              Description <span className="text-destructive ml-1">*</span>
            </label>
            <Input
              placeholder="What is the dependency or risk?"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="rounded-[10px] bg-background border-border/80 text-[13px] py-5 shadow-sm"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-foreground block mb-1.5">
              Mitigation Note
            </label>
            <Input
              placeholder="How will this be mitigated or resolved?"
              value={mitigationNote}
              onChange={(e) => setMitigationNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="rounded-[10px] bg-background border-border/80 text-[13px] h-10 shadow-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              onClick={handleCancelEdit}
              variant="outline"
              className="border-border/60 shadow-sm text-foreground bg-background hover:bg-muted font-medium text-[13px]"
            >
              Cancel
            </Button>
            <Button
              disabled={!desc.trim()}
              onClick={handleSave}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm font-medium text-[13px]"
            >
              {editingRecordId ? "Save Change" : "Save Record"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 shadow-sm rounded-[16px] overflow-hidden flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-border/40 gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-foreground">
            Dependencies & Risks
          </h3>
          <span className="bg-muted text-muted-foreground text-[12px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
            {list.length} Records
          </span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {list.length > 0 && (
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[100px] h-9 text-[12px] rounded-lg">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Dependency">Dependency</SelectItem>
                  <SelectItem value="Risk">Risk</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[105px] h-9 text-[12px] rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[8px] flex items-center gap-1 h-9 px-4 text-[13px] font-medium shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[100px] w-full">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-[14px]">
            {list.length === 0
              ? "No dependencies or risks added yet."
              : "No dependencies or risks match your filters."}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/30">
              <tr className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-5 py-3 font-medium min-w-[150px]">
                  Type & Desc
                </th>
                <th className="px-5 py-3 font-medium min-w-[150px]">
                  Mitigation Note
                </th>
                <th className="px-5 py-3 font-medium w-24">Impact</th>
                <th className="px-5 py-3 font-medium w-28 text-center">
                  Status
                </th>
                <th className="px-5 py-3 font-medium w-32">Owner(s)</th>
                <th className="px-5 py-3 font-medium w-20 text-center pr-5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {filteredList.map((dr) => (
                <tr
                  key={dr.id}
                  className="hover:bg-muted/20 text-[13px] transition-colors group"
                >
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-col gap-1.5">
                      {dr.type === "Dependency" ? (
                        <Badge className="bg-blue-100/50 hover:bg-blue-100/50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 font-medium text-[10px] uppercase tracking-wider w-fit px-1.5 py-0 shadow-none">
                          Dependency
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100/50 hover:bg-amber-100/50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-medium text-[10px] uppercase tracking-wider w-fit px-1.5 py-0 shadow-none">
                          Risk
                        </Badge>
                      )}
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {dr.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    {dr.mitigationNote ? (
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {dr.mitigationNote}
                      </p>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-center gap-2 mt-0.5">
                      <div
                        className={`h-2 w-2 rounded-full ${IMPACT_COLORS[dr.impactLevel]}`}
                      />
                      <span className="font-medium text-foreground">
                        {dr.impactLevel}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top text-center">
                    <Badge
                      className={`${STATUS_COLORS[dr.status]} text-[10.5px] uppercase tracking-wider font-bold border-none mt-0 w-full justify-center shadow-none px-2`}
                    >
                      {dr.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {dr.ownerIds && dr.ownerIds.length > 0 ? (
                        <>
                          {(() => {
                            const firstOwner = DIRECTORY.find(
                              (d) => d.id === dr.ownerIds![0],
                            );
                            if (!firstOwner) return null;
                            return (
                              <div className="inline-flex items-center gap-1.5 bg-muted px-2 py-0.5 rounded-full text-[12px] font-medium text-foreground border border-border/30">
                                <PersonAvatar
                                  userId={dr.ownerIds![0]}
                                  size="sm"
                                />
                                <span className="truncate max-w-[60px]">
                                  {firstOwner.name.split(" ")[0]}
                                </span>
                              </div>
                            );
                          })()}
                          {dr.ownerIds.length > 1 && (
                            <TooltipProvider>
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                  <div className="inline-flex items-center justify-center bg-muted/60 hover:bg-muted px-2 py-0.5 rounded-full text-[12px] font-medium text-muted-foreground border border-border/40 cursor-pointer transition-colors">
                                    <Plus className="h-3 w-3 mr-0.5" />
                                    {dr.ownerIds.length - 1}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1 block">
                                      All Owners
                                    </span>
                                    {dr.ownerIds.map((id) => {
                                      const owner = DIRECTORY.find(
                                        (d) => d.id === id,
                                      );
                                      if (!owner) return null;
                                      return (
                                        <div
                                          key={id}
                                          className="flex items-center gap-2"
                                        >
                                          <PersonAvatar userId={id} size="sm" />
                                          <span className="text-xs">
                                            {owner.name}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground/50 mt-0.5 block">
                          —
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top text-right pr-5">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-foreground"
                        onClick={() => handleEdit(dr)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive"
                        onClick={() => removeDependencyRisk?.(item.id, dr.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function AttachmentsTab({ item }: { item: BacklogItem }) {
  const { myUserId } = useCurrentUser();
  const { store } = useWorkspaceStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const atts = item.attachments ?? [];

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const url = URL.createObjectURL(f);
      store.addAttachment?.(item.id, {
        name: f.name,
        mime: f.type || "application/octet-stream",
        size: f.size,
        url,
        uploadedBy: myUserId,
      });
    });
    toast.success(`${files.length} file(s) attached`);
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        multiple
        hidden
        onChange={(e) => onFiles(e.target.files)}
      />
      <div
        className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-3 text-center cursor-pointer hover:bg-muted/30 transition-colors flex items-center justify-center gap-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFiles(e.dataTransfer.files);
        }}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-[12px] text-muted-foreground font-medium">
          Drag & drop files or click to upload
        </p>
      </div>

      {atts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-3">
          {atts.map((a) => {
            const uploader = DIRECTORY.find((d) => d.id === a.uploadedBy);
            const isImg = a.mime.startsWith("image/");
            return (
              <div
                key={a.id}
                className="rounded-xl border border-border/60 bg-card overflow-hidden group shadow-sm flex flex-col relative"
              >
                <div className="aspect-square bg-muted/20 flex items-center justify-center relative p-2">
                  {isImg ? (
                    <img
                      src={a.url}
                      alt={a.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <FileText className="h-8 w-8 text-muted-foreground/40" />
                  )}
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-6 w-6 absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      store.removeAttachment?.(item.id, a.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="p-2 border-t border-border/40 bg-muted/5">
                  <p className="text-[11px] font-medium truncate text-foreground/90">
                    {a.name}
                  </p>
                  <p className="text-[9px] text-muted-foreground/70 mt-0.5 uppercase tracking-wider">
                    {(a.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActivityTab({ item }: { item: BacklogItem }) {
  const activity = item.activity ?? [];
  const feed = [...activity].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  if (feed.length === 0)
    return (
      <p className="text-[13px] text-muted-foreground/70">No activity yet.</p>
    );

  return (
    <div className="space-y-4 pt-2">
      {feed.map((a) => {
        const actor = DIRECTORY.find((d) => d.id === a.actorId);
        return (
          <div key={a.id} className="flex items-center gap-3 text-[13px]">
            <div className="bg-muted/50 p-1.5 rounded-full shrink-0 border border-border/40">
              <ActivityIcon className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="flex-1 text-foreground/80 truncate">
              <span className="font-semibold text-foreground mr-1">
                {actor?.name ?? "System"}
              </span>
              {a.text}
            </div>
            <div className="text-[11px] text-muted-foreground shrink-0 font-medium">
              {new Date(a.at).toLocaleDateString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CommentsTab({ item }: { item: BacklogItem }) {
  const { myUserId } = useCurrentUser();
  const { store } = useWorkspaceStore();
  const [body, setBody] = useState("");

  const comments = item.comments ?? [];
  const feed = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <div className="relative border border-border/60 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 bg-card shadow-sm">
        <Textarea
          placeholder="Ask a question or post an update..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full min-h-[90px] bg-transparent resize-none outline-none text-[13px] placeholder:text-muted-foreground/60 p-4 border-0 focus-visible:ring-0 leading-relaxed"
        />
        <div className="p-2 border-t border-border/40 bg-muted/10 flex justify-end">
          <Button
            size="sm"
            className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium px-4"
            disabled={!body.trim()}
            onClick={() => {
              store.addComment?.(item.id, {
                authorId: myUserId,
                body: body.trim(),
                internal: false,
                attachments: [],
              });
              setBody("");
            }}
          >
            Comment
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {feed.map((c) => {
          const author = DIRECTORY.find((d) => d.id === c.authorId);
          return (
            <div key={c.id} className="flex gap-4">
              <PersonAvatar userId={c.authorId} size="md" />
              <div className="flex-1 min-w-0 pb-4 border-b border-border/40 last:border-0 last:pb-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-[13px] text-foreground">
                    {author?.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground/70">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
                  {c.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeTrackingTab({ item }: { item: BacklogItem }) {
  const { myUserId } = useCurrentUser();
  const { store } = useWorkspaceStore();

  const isFeature = item.type === "feature";
  const subtasks = isFeature
    ? store.items.filter((i) => i.parentId === item.id)
    : [];

  let wlogs = item.worklogs ?? [];
  let originalEst = item.estimateHours ?? item.budgetHours ?? 0;

  if (isFeature) {
    wlogs = subtasks.flatMap((st) =>
      (st.worklogs ?? []).map((w) => ({ ...w, taskTitle: st.title })),
    );
    originalEst = subtasks.reduce(
      (sum, st) => sum + (st.estimateHours ?? st.budgetHours ?? 0),
      0,
    );
  }

  const [hours, setHours] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [comment, setComment] = useState("");

  const logged = wlogs.reduce((sum, w) => sum + w.hours, 0);
  const remaining = Math.max(0, originalEst - logged);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4 p-4 border border-border/60 bg-muted/10 rounded-xl">
        <div className="text-center">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Original Estimate
          </p>
          <p className="text-xl font-semibold">{originalEst}h</p>
        </div>
        <div className="text-center border-l border-r border-border/60">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Time Logged
          </p>
          <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
            {logged}h
          </p>
        </div>
        <div className="text-center">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Remaining
          </p>
          <p className="text-xl font-semibold">{remaining}h</p>
        </div>
      </div>

      {!isFeature && (
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.25"
            placeholder="Hours"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-[100px] h-9 text-[13px]"
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-[150px] h-9 text-[13px]"
          />
          <Input
            placeholder="What did you work on?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 h-9 text-[13px]"
          />
          <Button
            disabled={!hours}
            onClick={() => {
              const h = Number(hours);
              if (!h) return;
              store.addWorklog?.(item.id, {
                userId: myUserId,
                hours: h,
                date,
                comment,
              });
              setHours("");
              setComment("");
              toast.success("Time logged");
            }}
            className="h-9 px-4 text-xs font-semibold"
          >
            Add Log
          </Button>
        </div>
      )}

      <div className="border border-border/60 rounded-xl overflow-hidden bg-card">
        <div className="grid grid-cols-[100px_160px_80px_1fr] p-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border/60">
          <div>Date</div>
          <div>User</div>
          <div>Hours</div>
          <div>Description</div>
        </div>
        {wlogs.length === 0 ? (
          <div className="p-4 text-center text-[13px] text-muted-foreground">
            No work logged yet.
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {/* Sort logs by date descending */}
            {[...wlogs]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((w, idx) => (
                <div
                  key={w.id || idx}
                  className="grid grid-cols-[100px_160px_80px_1fr] p-3 text-[13px] items-center gap-2"
                >
                  <div className="text-muted-foreground">{w.date}</div>
                  <div className="flex items-center gap-2">
                    <PersonAvatar userId={w.userId} size="sm" />
                    <span className="truncate">
                      {DIRECTORY.find((d) => d.id === w.userId)?.name}
                    </span>
                  </div>
                  <div className="font-semibold">{w.hours}h</div>
                  <div className="text-muted-foreground truncate flex flex-col justify-center">
                    <span>{w.comment ?? "—"}</span>
                    {isFeature && (
                      <span className="text-[10px] text-indigo-500/70 truncate uppercase tracking-wider">
                        {w.taskTitle}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
