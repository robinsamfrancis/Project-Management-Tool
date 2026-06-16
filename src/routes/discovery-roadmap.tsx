import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MultiSelectDropdown } from "@/components/MultiSelectDropdown";
import {
  useWorkspaceStore,
  DiscoveryItem,
  StrategicGoal,
  DiscoveryStatus,
} from "@/lib/workspace-store";
import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  MapIcon,
  LayoutDashboard,
  LayoutList,
  Target,
  TrendingUp,
  CheckCircle,
  Lightbulb,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersonAvatar } from "@/components/PersonAvatar";
import { DIRECTORY } from "@/lib/workspace-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/discovery-roadmap")({
  component: DiscoveryRoadmap,
});

const DEFAULT_STATUSES: DiscoveryStatus[] = [
  "Idea",
  "Research",
  "Validation",
  "Approved",
  "Planned",
  "In Progress",
  "Delivered",
  "Rejected",
];

function DiscoveryRoadmap() {
  const {
    store,
    createDiscoveryItem,
    updateDiscoveryItem,
    deleteDiscoveryItem,
    createStrategicGoal,
    updateStrategicGoal,
    deleteStrategicGoal,
    createItem,
    createDiscoveryTag,
    updateDiscoveryTag,
    deleteDiscoveryTag,
  } = useWorkspaceStore();
  const [view, setView] = useState("list");

  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<DiscoveryItem>>({});

  // Filters
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterOwner, setFilterOwner] = useState<string>("all");
  const [filterGoal, setFilterGoal] = useState<string>("all");
  const [filterQuarter, setFilterQuarter] = useState<string>("all");

  const handleCreateNew = () => {
    setEditingItem({ status: "Idea" });
    setIsItemDialogOpen(true);
  };

  const listItems = store.discoveryItems;
  const goals = store.strategicGoals;

  const filteredListItems = useMemo(() => {
    return listItems.filter((i) => {
      // Tags (all selected)
      if (filterTags.length > 0) {
        if (!i.tags || !filterTags.every((t) => i.tags!.includes(t)))
          return false;
      }

      // Status
      if (filterStatus !== "all") {
        if (view !== "kanban" && i.status !== filterStatus) return false;
      }

      // Priority
      if (filterPriority !== "all" && i.priority !== filterPriority)
        return false;

      // Owner
      if (filterOwner !== "all" && i.ownerId !== filterOwner) return false;

      // Strategic Goal
      if (filterGoal !== "all") {
        if (!i.goalIds || !i.goalIds.includes(filterGoal)) return false;
      }

      // Quarter
      if (
        view === "timeline" &&
        filterQuarter !== "all" &&
        i.targetQuarter !== filterQuarter
      )
        return false;

      return true;
    });
  }, [
    listItems,
    view,
    filterTags,
    filterStatus,
    filterPriority,
    filterOwner,
    filterGoal,
    filterQuarter,
  ]);

  // KPIs
  const totalIdeas = listItems.length;
  const underResearch = listItems.filter((i) => i.status === "Research").length;
  const approved = listItems.filter((i) => i.status === "Approved").length;
  const delivered = listItems.filter((i) => i.status === "Delivered").length;
  const highImpact = listItems.filter((i) => (i.impactScore || 0) >= 8).length;

  const tagUsageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    listItems.forEach((i) => {
      if (i.tags) {
        i.tags.forEach((t) => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });
    return counts;
  }, [listItems]);

  return (
    <AppShell title="Discovery Roadmap">
      <div className="flex-1 overflow-y-auto bg-muted/20">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <MapIcon className="h-6 w-6 text-primary" />
                Discovery Roadmap
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Capture ideas, shape opportunities, and link to strategic goals
                before delivery.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsTagDialogOpen(true)}
                variant="outline"
                className="gap-2"
              >
                Tags
              </Button>
              <Button
                onClick={() => setIsGoalDialogOpen(true)}
                variant="outline"
                className="gap-2"
              >
                <Target className="h-4 w-4" /> Strategic Goals
              </Button>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" /> New Initiative
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Ideas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalIdeas}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Under Research
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{underResearch}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Delivered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{delivered}</div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" /> High Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {highImpact}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex bg-transparent h-auto p-0 border-none gap-2">
                <button
                  onClick={() => setView("list")}
                  className={
                    view === "list"
                      ? "bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors"
                      : "text-muted-foreground hover:text-foreground border border-transparent rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors"
                  }
                >
                  <LayoutList className="h-4 w-4" /> List
                </button>
                <button
                  onClick={() => setView("kanban")}
                  className={
                    view === "kanban"
                      ? "bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors"
                      : "text-muted-foreground hover:text-foreground border border-transparent rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors"
                  }
                >
                  <LayoutDashboard className="h-4 w-4" /> Kanban
                </button>
                <button
                  onClick={() => setView("timeline")}
                  className={
                    view === "timeline"
                      ? "bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors"
                      : "text-muted-foreground hover:text-foreground border border-transparent rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors"
                  }
                >
                  <MapIcon className="h-4 w-4" /> Timeline
                </button>
              </div>
            </div>

            {/* Global Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 bg-card p-2 rounded-lg border shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-2 mr-1">
                Filters:
              </span>

              {store.discoveryTags && store.discoveryTags.length > 0 && (
                <div className="w-[200px]">
                  <MultiSelectDropdown
                    options={store.discoveryTags.map((t) => ({
                      label: t.name,
                      value: t.id,
                    }))}
                    selected={filterTags}
                    onChange={setFilterTags}
                    placeholder="Tags"
                    className="h-auto min-h-[36px] py-2 px-3 text-sm"
                  />
                </div>
              )}

              {view !== "kanban" && (
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-8 w-[130px] text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {DEFAULT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              {(view === "list" || view === "timeline") && (
                <Select value={filterOwner} onValueChange={setFilterOwner}>
                  <SelectTrigger className="h-8 w-[130px] text-xs">
                    <SelectValue placeholder="Owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Owners</SelectItem>
                    {DIRECTORY.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {(view === "list" || view === "timeline") &&
                store.strategicGoals &&
                store.strategicGoals.length > 0 && (
                  <Select value={filterGoal} onValueChange={setFilterGoal}>
                    <SelectTrigger className="h-8 w-[150px] text-xs">
                      <SelectValue placeholder="Goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Goals</SelectItem>
                      {store.strategicGoals.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

              {view === "timeline" && (
                <Select value={filterQuarter} onValueChange={setFilterQuarter}>
                  <SelectTrigger className="h-8 w-[120px] text-xs">
                    <SelectValue placeholder="Quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quarters</SelectItem>
                    <SelectItem value="Q1 2026">Q1 2026</SelectItem>
                    <SelectItem value="Q2 2026">Q2 2026</SelectItem>
                    <SelectItem value="Q3 2026">Q3 2026</SelectItem>
                    <SelectItem value="Q4 2026">Q4 2026</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {(filterTags.length > 0 ||
                filterStatus !== "all" ||
                filterPriority !== "all" ||
                filterOwner !== "all" ||
                filterGoal !== "all" ||
                filterQuarter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground ml-auto"
                  onClick={() => {
                    setFilterTags([]);
                    setFilterStatus("all");
                    setFilterPriority("all");
                    setFilterOwner("all");
                    setFilterGoal("all");
                    setFilterQuarter("all");
                  }}
                >
                  Clear
                </Button>
              )}
            </div>

            {view === "list" && (
              <div className="space-y-4 m-0">
                <DiscoveryListView
                  items={filteredListItems}
                  goals={goals}
                  tags={store.discoveryTags}
                  onEdit={(i: any) => {
                    setEditingItem(i);
                    setIsItemDialogOpen(true);
                  }}
                />
              </div>
            )}
            {view === "kanban" && (
              <div className="m-0">
                <DiscoveryKanbanView
                  items={filteredListItems}
                  tags={store.discoveryTags}
                  updateDiscoveryItem={updateDiscoveryItem}
                  onEdit={(i: any) => {
                    setEditingItem(i);
                    setIsItemDialogOpen(true);
                  }}
                />
              </div>
            )}
            {view === "timeline" && (
              <div className="m-0">
                <DiscoveryTimelineView
                  items={filteredListItems}
                  tags={store.discoveryTags}
                  onEdit={(i: any) => {
                    setEditingItem(i);
                    setIsItemDialogOpen(true);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item Dialog */}
      <DiscoveryItemDialog
        open={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        item={editingItem}
        setItem={setEditingItem}
        goals={goals}
        onSave={() => {
          if (editingItem.id) {
            updateDiscoveryItem(editingItem.id, editingItem);
          } else {
            createDiscoveryItem(editingItem as any);
          }
          setIsItemDialogOpen(false);
        }}
        onConvert={(workspaceCode: string, type: string) => {
          // Create deliverable
          if (editingItem.id) {
            const created = createItem({
              type: type as any,
              workspaceCode,
              title: `[Discovery] ${editingItem.title}`,
              description:
                editingItem.description || editingItem.problemStatement,
              status: "Todo",
              priority: "medium",
              points: 0,
              reporterId: editingItem.ownerId || DIRECTORY[0].id,
              assigneeId: editingItem.ownerId || undefined,
              estimateHours: 0,
            });
            updateDiscoveryItem(editingItem.id, {
              linkedWorkspaceCode: workspaceCode,
              linkedItemId: created.id,
              updatedAt: new Date().toISOString(),
            });
            setIsItemDialogOpen(false);
          }
        }}
      />

      {/* Goals Dialog */}
      <StrategicGoalsDialog
        open={isGoalDialogOpen}
        onOpenChange={setIsGoalDialogOpen}
        goals={goals}
        createStrategicGoal={createStrategicGoal}
        updateStrategicGoal={updateStrategicGoal}
        deleteStrategicGoal={deleteStrategicGoal}
      />

      {/* Tags Dialog */}
      <DiscoveryTagsDialog
        open={isTagDialogOpen}
        onOpenChange={setIsTagDialogOpen}
        tags={store.discoveryTags}
        createDiscoveryTag={createDiscoveryTag}
        updateDiscoveryTag={updateDiscoveryTag}
        deleteDiscoveryTag={deleteDiscoveryTag}
        usageCounts={tagUsageCounts}
      />
    </AppShell>
  );
}

function DiscoveryListView({ items, goals, tags, onEdit }: any) {
  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-muted-foreground">
          <tr>
            <th className="font-medium text-left px-4 py-3">Initiative</th>
            <th className="font-medium text-left px-4 py-3 w-32">Status</th>
            <th className="font-medium text-left px-4 py-3 w-40">Owner</th>
            <th className="font-medium text-center px-4 py-3 w-20">Impact</th>
            <th className="font-medium text-center px-4 py-3 w-20">Effort</th>
            <th className="font-medium text-center px-4 py-3 w-24">Priority</th>
          </tr>
        </thead>
        <tbody className="divide-y relative">
          {items.map((item: any) => (
            <tr
              key={item.id}
              className="hover:bg-muted/20 cursor-pointer transition-colors"
              onClick={() => onEdit(item)}
            >
              <td className="px-4 py-3">
                <div className="font-medium">{item.title}</div>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {(item.goalIds || []).map((gId: string) => {
                    const g = goals.find((x: any) => x.id === gId);
                    if (!g) return null;
                    return (
                      <Badge
                        variant="secondary"
                        key={gId}
                        className="text-[9px] py-0 font-normal"
                      >
                        <Target className="w-3 h-3 mr-1 text-primary" />{" "}
                        {g.title}
                      </Badge>
                    );
                  })}
                  {(item.tags || []).map((tId: string) => {
                    const t = tags.find((x: any) => x.id === tId);
                    if (!t) return null;
                    return (
                      <Badge
                        variant="outline"
                        key={tId}
                        className="text-[9px] py-0 font-normal"
                      >
                        {t.name}
                      </Badge>
                    );
                  })}
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge variant="outline">{item.status}</Badge>
              </td>
              <td className="px-4 py-3">
                {item.ownerId ? (
                  <div className="flex items-center gap-2">
                    <PersonAvatar userId={item.ownerId} size="sm" />
                    <span className="truncate max-w-[100px]">
                      {DIRECTORY.find((d) => d.id === item.ownerId)?.name ||
                        "Unknown"}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <span className="font-mono text-xs">
                  {item.impactScore !== undefined ? item.impactScore : "-"}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="font-mono text-xs">
                  {item.effortScore !== undefined ? item.effortScore : "-"}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                {item.priority && (
                  <Badge
                    className={
                      item.priority === "Critical"
                        ? "bg-red-500 hover:bg-red-600 font-normal uppercase text-[9px]"
                        : item.priority === "High"
                          ? "bg-orange-500 hover:bg-orange-600 font-normal uppercase text-[9px]"
                          : "bg-muted text-muted-foreground font-normal uppercase text-[9px]"
                    }
                  >
                    {item.priority}
                  </Badge>
                )}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="text-center py-12 text-muted-foreground"
              >
                <Lightbulb className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p>No discovery items yet.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function DiscoveryKanbanView({
  items,
  tags,
  updateDiscoveryItem,
  onEdit,
}: any) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-4 px-4 scrollbar-hide min-h-[500px]">
      {DEFAULT_STATUSES.map((status) => {
        const columnItems = items.filter((i: any) => i.status === status);
        return (
          <div
            key={status}
            className="w-72 shrink-0 flex flex-col bg-muted/30 rounded-xl border"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedItem) {
                updateDiscoveryItem(draggedItem, { status });
                setDraggedItem(null);
              }
            }}
          >
            <div className="p-3 border-b flex items-center justify-between font-semibold">
              <span className="text-sm">{status}</span>
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {columnItems.length}
              </span>
            </div>
            <div className="p-2 flex-1 space-y-2 overflow-y-auto">
              {columnItems.map((item: any) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedItem(item.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => setDraggedItem(null)}
                  onClick={() => onEdit(item)}
                  className="bg-card border rounded-lg p-3 shadow-sm hover:shadow transition-shadow cursor-grab active:cursor-grabbing hover:border-primary/50"
                >
                  <div className="font-medium text-sm leading-tight mb-2">
                    {item.title}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {(item.tags || []).map((tId: string) => {
                      const t = tags.find((x: any) => x.id === tId);
                      if (!t) return null;
                      return (
                        <Badge
                          variant="outline"
                          key={tId}
                          className="text-[9px] py-0 font-normal px-1"
                        >
                          {t.name}
                        </Badge>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between mt-auto text-xs">
                    <div className="flex items-center gap-2">
                      {item.ownerId && (
                        <PersonAvatar userId={item.ownerId} size="sm" />
                      )}
                    </div>
                    {item.priority && (
                      <Badge
                        className={
                          item.priority === "Critical"
                            ? "bg-red-500 hover:bg-red-600 font-normal uppercase text-[9px] px-1 py-0 h-4"
                            : item.priority === "High"
                              ? "bg-orange-500 hover:bg-orange-600 font-normal uppercase text-[9px] px-1 py-0 h-4"
                              : "bg-muted text-muted-foreground font-normal uppercase text-[9px] px-1 py-0 h-4"
                        }
                      >
                        {item.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DiscoveryTimelineView({ items, tags, onEdit }: any) {
  const quarters = ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026"];

  return (
    <div className="bg-card rounded-xl border p-4 shadow-sm min-h-[400px]">
      <div className="grid grid-cols-4 gap-4 mb-4">
        {quarters.map((q) => (
          <div
            key={q}
            className="font-semibold text-sm border-b pb-2 text-center text-muted-foreground uppercase tracking-wider"
          >
            {q}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4 relative min-h-[300px]">
        {quarters.map((q, idx) => {
          const quarterItems = items.filter((i: any) => i.targetQuarter === q);
          return (
            <div
              key={idx}
              className="border-r border-dashed border-muted relative pr-4 last:border-0 last:pr-0"
            >
              <div className="space-y-3 pt-2">
                {quarterItems.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => onEdit(item)}
                    className="bg-primary/10 border border-primary/20 p-2.5 rounded-lg text-xs hover:bg-primary/15 transition-colors cursor-pointer flex flex-col gap-2"
                  >
                    <div className="font-medium text-primary leading-tight">
                      {item.title}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(item.tags || []).map((tId: string) => {
                        const t = tags.find((x: any) => x.id === tId);
                        if (!t) return null;
                        return (
                          <Badge
                            variant="outline"
                            key={tId}
                            className="text-[9px] py-0 font-normal px-1 bg-background"
                          >
                            {t.name}
                          </Badge>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <Badge
                        variant="outline"
                        className="text-[9px] bg-background font-normal"
                      >
                        {item.status}
                      </Badge>
                      {item.priority && (
                        <Badge
                          className={
                            item.priority === "Critical"
                              ? "bg-red-500 hover:bg-red-600 font-normal uppercase text-[8px] px-1 py-0 h-3.5"
                              : item.priority === "High"
                                ? "bg-orange-500 hover:bg-orange-600 font-normal uppercase text-[8px] px-1 py-0 h-3.5"
                                : "bg-muted text-muted-foreground font-normal uppercase text-[8px] px-1 py-0 h-3.5"
                          }
                        >
                          {item.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {quarterItems.length === 0 && (
                  <div className="text-center py-4 text-xs text-muted-foreground/50 italic">
                    No plans
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DiscoveryItemDialog({
  open,
  onOpenChange,
  item,
  setItem,
  onSave,
  onConvert,
  goals,
}: any) {
  const { store, createDiscoveryTag } = useWorkspaceStore();
  const [showConvert, setShowConvert] = useState(false);
  const [convWorkspace, setConvWorkspace] = useState("");
  const [convType, setConvType] = useState("epic");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item.id ? "Edit Initiative" : "New Discovery Initiative"}
          </DialogTitle>
        </DialogHeader>

        {item.linkedItemId && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 p-3 flex items-center justify-between rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              Converted to Delivery Workspace ({item.linkedWorkspaceCode})
            </div>
          </div>
        )}

        <div className="grid gap-5 py-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider">
              Title
            </label>
            <Input
              value={item.title || ""}
              onChange={(e) => setItem({ ...item, title: e.target.value })}
              placeholder="E.g. Customer Portal Redesign"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider">
                Status
              </label>
              <Select
                value={item.status}
                onValueChange={(v) => setItem({ ...item, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider">
                Priority
              </label>
              <Select
                value={item.priority || "none"}
                onValueChange={(v) =>
                  setItem({ ...item, priority: v === "none" ? undefined : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider">
                Owner
              </label>
              <Select
                value={item.ownerId || "unassigned"}
                onValueChange={(v) =>
                  setItem({
                    ...item,
                    ownerId: v === "unassigned" ? undefined : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned">
                    {item.ownerId ? (
                      <span className="flex items-center gap-2">
                        <PersonAvatar userId={item.ownerId} size="sm" />{" "}
                        {DIRECTORY.find((p) => p.id === item.ownerId)?.name}
                      </span>
                    ) : (
                      "Unassigned"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {DIRECTORY.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" /> Impact Score
              </label>
              <Input
                type="number"
                min="0"
                max="10"
                placeholder="1-10"
                value={item.impactScore || ""}
                onChange={(e) =>
                  setItem({
                    ...item,
                    impactScore: parseInt(e.target.value) || undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider">
                Effort Score
              </label>
              <Input
                type="number"
                min="0"
                max="10"
                placeholder="1-10"
                value={item.effortScore || ""}
                onChange={(e) =>
                  setItem({
                    ...item,
                    effortScore: parseInt(e.target.value) || undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider">
                Target Quarter
              </label>
              <Select
                value={item.targetQuarter || "none"}
                onValueChange={(v) =>
                  setItem({
                    ...item,
                    targetQuarter: v === "none" ? undefined : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sprint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="Q1 2026">Q1 2026</SelectItem>
                  <SelectItem value="Q2 2026">Q2 2026</SelectItem>
                  <SelectItem value="Q3 2026">Q3 2026</SelectItem>
                  <SelectItem value="Q4 2026">Q4 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider">
              Problem Statement
            </label>
            <Textarea
              className="h-20"
              value={item.problemStatement || ""}
              onChange={(e) =>
                setItem({ ...item, problemStatement: e.target.value })
              }
              placeholder="What user problem does this solve?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider">
              Business Value / Hypothesis
            </label>
            <Textarea
              className="h-20"
              value={item.businessValue || ""}
              onChange={(e) =>
                setItem({ ...item, businessValue: e.target.value })
              }
              placeholder="Why should we build this?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" /> Strategic Goals
            </label>
            <MultiSelectDropdown
              options={goals.map((g: any) => ({ label: g.title, value: g.id }))}
              selected={item.goalIds || []}
              onChange={(vals) => setItem({ ...item, goalIds: vals })}
              placeholder="Select strategic goals..."
              emptyText="No goals available."
            />
          </div>

          <div className="space-y-2 relative">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              Tags
            </label>
            <MultiSelectDropdown
              options={store.discoveryTags.map((t: any) => ({
                label: t.name,
                value: t.id,
              }))}
              selected={item.tags || []}
              onChange={(vals) => setItem({ ...item, tags: vals })}
              placeholder="Select or create tags..."
              emptyText="No tags found."
              creatable
              onCreate={(val) => {
                const existingSearch = store.discoveryTags.find(
                  (t: any) => t.name.toLowerCase() === val.toLowerCase(),
                );
                let addedId = "";
                if (existingSearch) {
                  addedId = existingSearch.id;
                } else {
                  const newTagGroup = createDiscoveryTag({
                    name: val,
                    color: "bg-blue-100 text-blue-800",
                  });
                  if (newTagGroup) {
                    addedId = newTagGroup.id;
                  } else {
                    setTimeout(() => {
                      const created = store.discoveryTags.find(
                        (t: any) => t.name.toLowerCase() === val.toLowerCase(),
                      );
                      if (created) {
                        setItem((prev: any) => ({
                          ...prev,
                          tags: [...(prev.tags || []), created.id],
                        }));
                      }
                    }, 100);
                  }
                }
                if (addedId) {
                  const ex = item.tags || [];
                  if (!ex.includes(addedId)) {
                    setItem({ ...item, tags: [...ex, addedId] });
                  }
                }
              }}
            />
          </div>
        </div>

        {showConvert ? (
          <div className="p-4 bg-muted/40 rounded-xl border space-y-4">
            <h4 className="font-semibold">Convert to Delivery Item</h4>
            <div className="grid grid-cols-2 gap-4">
              <Select value={convWorkspace} onValueChange={setConvWorkspace}>
                <SelectTrigger>
                  <SelectValue placeholder="Destination Workspace" />
                </SelectTrigger>
                <SelectContent>
                  {store.workspaces.map((w) => (
                    <SelectItem key={w.code} value={w.code}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={convType} onValueChange={setConvType}>
                <SelectTrigger>
                  <SelectValue placeholder="Item Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="epic">Epic</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConvert(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!convWorkspace}
                onClick={() => onConvert(convWorkspace, convType)}
              >
                Confirm Conversion
              </Button>
            </div>
          </div>
        ) : (
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <div>
              {item.id && !item.linkedItemId && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-primary/50 text-primary"
                  onClick={() => setShowConvert(true)}
                >
                  Convert to Delivery...
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={onSave}>Save Initiative</Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DiscoveryTagsDialog({
  open,
  onOpenChange,
  tags,
  createDiscoveryTag,
  updateDiscoveryTag,
  deleteDiscoveryTag,
  usageCounts,
}: any) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Discovery Tags</DialogTitle>
          <DialogDescription>
            Define organization tags to categorize initiatives.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex gap-2">
            <Input
              placeholder="E.g. Technical Debt"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  createDiscoveryTag({ name: name.trim() });
                  setName("");
                }
              }}
            />
            <Button
              onClick={() => {
                if (name.trim()) {
                  createDiscoveryTag({ name: name.trim() });
                  setName("");
                }
              }}
            >
              Add
            </Button>
          </div>

          <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto">
            {tags.map((t: any) => {
              const isEditing = editingId === t.id;
              const count = usageCounts[t.id] || 0;

              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm"
                >
                  {isEditing ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && editName.trim()) {
                            updateDiscoveryTag(t.id, { name: editName.trim() });
                            setEditingId(null);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (editName.trim()) {
                            updateDiscoveryTag(t.id, { name: editName.trim() });
                            setEditingId(null);
                          }
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="font-medium flex items-center gap-2">
                        {t.name}{" "}
                        <span className="text-xs text-muted-foreground ml-2">
                          {count} item{count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingId(t.id);
                            setEditName(t.name);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-edit-2"
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => {
                            if (count > 0) {
                              if (
                                confirm(
                                  `This tag is currently associated with ${count} initiatives. Removing it will remove the tag from all associated initiatives. Continue?`,
                                )
                              ) {
                                deleteDiscoveryTag(t.id);
                              }
                            } else {
                              deleteDiscoveryTag(t.id);
                            }
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-trash-2"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" x2="10" y1="11" y2="17" />
                            <line x1="14" x2="14" y1="11" y2="17" />
                          </svg>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            {tags.length === 0 && (
              <div className="text-center py-6 text-muted-foreground italic">
                No tags defined yet.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StrategicGoalsDialog({
  open,
  onOpenChange,
  goals,
  createStrategicGoal,
  deleteStrategicGoal,
}: any) {
  const [title, setTitle] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Strategic Goals</DialogTitle>
          <DialogDescription>
            Define organizational OKRs or strategic pillars to align discovery
            initiatives against.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex gap-2">
            <Input
              placeholder="E.g. Improve Customer Experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && title.trim()) {
                  createStrategicGoal({ title: title.trim() });
                  setTitle("");
                }
              }}
            />
            <Button
              onClick={() => {
                if (title.trim()) {
                  createStrategicGoal({ title: title.trim() });
                  setTitle("");
                }
              }}
            >
              Add
            </Button>
          </div>

          <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto">
            {goals.map((g: any) => (
              <div
                key={g.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm"
              >
                <div className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" /> {g.title}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => deleteStrategicGoal(g.id)}
                >
                  <Search className="hidden" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-trash-2"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                </Button>
              </div>
            ))}
            {goals.length === 0 && (
              <div className="text-center py-6 text-muted-foreground italic">
                No goals defined yet.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
