import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MultiSelectDropdown } from "@/components/MultiSelectDropdown";
import {
  useWorkspaceStore,
  BacklogItem,
  DiscoveryItem,
} from "@/lib/workspace-store";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PersonAvatar } from "@/components/PersonAvatar";
import { DIRECTORY } from "@/lib/workspace-store";
import {
  BarChart2,
  Search,
  Filter,
  ArrowRight,
  ArrowUp,
  Zap,
  Star,
  Coffee,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/impact-vs-effort")({
  component: ImpactVsEffort,
});

/*
Quadrants:
Top-Left (Low Effort, High Impact): Quick Wins
Top-Right (High Effort, High Impact): Major Projects
Bottom-Left (Low Effort, Low Impact): Fill-ins
Bottom-Right (High Effort, Low Impact): Time Sinks
*/

type QuadrantId = "quick-wins" | "major-projects" | "fill-ins" | "time-sinks";

const QUADRANTS = [
  {
    id: "quick-wins",
    label: "Quick Wins",
    desc: "High Impact, Low Effort",
    color:
      "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400",
    icon: Zap,
  },
  {
    id: "major-projects",
    label: "Major Projects",
    desc: "High Impact, High Effort",
    color: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400",
    icon: Star,
  },
  {
    id: "fill-ins",
    label: "Fill-ins",
    desc: "Low Impact, Low Effort",
    color: "bg-muted border-border text-muted-foreground",
    icon: Coffee,
  },
  {
    id: "time-sinks",
    label: "Time Sinks",
    desc: "Low Impact, High Effort",
    color: "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400",
    icon: AlertTriangle,
  },
];

function determineQuadrant(impact: number = 0, effort: number = 0): QuadrantId {
  const highImpact = impact >= 5;
  const highEffort = effort >= 5;
  if (highImpact && !highEffort) return "quick-wins";
  if (highImpact && highEffort) return "major-projects";
  if (!highImpact && !highEffort) return "fill-ins";
  return "time-sinks";
}

function getScoresForQuadrant(qid: QuadrantId): {
  impactScore: number;
  effortScore: number;
} {
  // Return default midpoint scores for drop into a quadrant
  if (qid === "quick-wins") return { impactScore: 8, effortScore: 2 };
  if (qid === "major-projects") return { impactScore: 8, effortScore: 8 };
  if (qid === "fill-ins") return { impactScore: 2, effortScore: 2 };
  return { impactScore: 2, effortScore: 8 }; // time-sinks
}

function calculatePriority(impact: number = 0, effort: number = 1): number {
  return parseFloat((impact / Math.max(1, effort)).toFixed(1));
}

function getPriorityLabel(score: number): string {
  if (score >= 4) return "Critical";
  if (score >= 2) return "High";
  if (score >= 0.8) return "Medium";
  return "Low";
}

function ImpactVsEffort() {
  const { store, updateDiscoveryItem, updateItem } = useWorkspaceStore();

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedItem, setDraggedItem] = useState<{
    id: string;
    isDiscovery: boolean;
  } | null>(null);

  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterOwner, setFilterOwner] = useState<string>("all");
  const [filterGoal, setFilterGoal] = useState<string>("all");

  // Unified items
  // We include Discovery Items only.
  const unifiedItems = useMemo(() => {
    let items: any[] = [];

    // Process Discovery Items
    store.discoveryItems.forEach((d) => {
      items.push({
        ...d,
        _isDiscovery: true,
        _displayType: "Discovery",
        _quadrant: determineQuadrant(d.impactScore, d.effortScore),
        _priorityScore: calculatePriority(d.impactScore, d.effortScore || 1),
      });
    });

    // Apply filters
    const queryLower = searchQuery.toLowerCase();
    items = items.filter((it) => {
      if (searchQuery && !it.title.toLowerCase().includes(queryLower))
        return false;
      if (filterStatus !== "all" && it.status !== filterStatus) return false;

      // Tag filter (ALL selected tags must be present)
      if (filterTags.length > 0) {
        if (!it.tags || !filterTags.every((t) => it.tags.includes(t)))
          return false;
      }

      if (filterPriority !== "all" && it.priority !== filterPriority)
        return false;
      if (filterOwner !== "all" && it.ownerId !== filterOwner) return false;
      if (
        filterGoal !== "all" &&
        (!it.goalIds || !it.goalIds.includes(filterGoal))
      )
        return false;

      return true;
    });

    return items;
  }, [
    store.discoveryItems,
    searchQuery,
    filterStatus,
    filterTags,
    filterPriority,
    filterOwner,
    filterGoal,
  ]);

  const handleDrop = (qid: QuadrantId) => {
    if (!draggedItem) return;
    const { impactScore, effortScore } = getScoresForQuadrant(qid);

    if (draggedItem.isDiscovery) {
      updateDiscoveryItem(draggedItem.id, { impactScore, effortScore });
    } else {
      // Update Workspace Item
      updateItem(draggedItem.id, { impactScore, effortScore } as any);
    }
    setDraggedItem(null);
  };

  return (
    <AppShell title="Impact vs Effort">
      <div className="flex-1 overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-muted/10 p-4 lg:p-8 flex flex-col">
        <div className="mx-auto max-w-7xl w-full h-full flex flex-col space-y-6 min-h-0">
          <div className="flex items-center justify-between shrink-0">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <BarChart2 className="h-6 w-6 text-primary" />
                Impact vs Effort Prioritization
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Drag initiatives into quadrants to automatically score impact,
                effort, and priority.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2 shadow-sm shrink-0">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search initiatives..."
                className="pl-8 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

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

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[140px] h-9">
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

            <Select value={filterOwner} onValueChange={setFilterOwner}>
              <SelectTrigger className="w-[140px] h-9">
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

            {store.strategicGoals && store.strategicGoals.length > 0 && (
              <Select value={filterGoal} onValueChange={setFilterGoal}>
                <SelectTrigger className="w-[150px] h-9">
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

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Idea">Idea</SelectItem>
                <SelectItem value="Research">Research</SelectItem>
                <SelectItem value="Validation">Validation</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Planned">Planned</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-h-[800px] lg:min-h-0 flex flex-col lg:flex-row mt-4 lg:mt-6">
            {/* Y-Axis Label (Desktop) */}
            <div className="hidden lg:flex flex-col justify-between items-center py-12 pr-6 border-r-2 border-border/50 text-muted-foreground text-sm font-bold tracking-widest shrink-0">
              <div className="flex flex-col items-center gap-3">
                <ArrowUp className="w-5 h-5 text-foreground/80" />
                <span className="[writing-mode:vertical-rl] -rotate-180 text-foreground/80">
                  HIGH IMPACT
                </span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <span className="[writing-mode:vertical-rl] -rotate-180 text-muted-foreground/50">
                  LOW IMPACT
                </span>
              </div>
            </div>

            {/* Matrix & X-Axis Container */}
            <div className="flex-1 flex flex-col min-h-0 lg:pl-6 pb-2">
              {/* Quadrants Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-4 lg:gap-6 flex-1 min-h-[600px] lg:min-h-0 h-full w-full">
                {QUADRANTS.map((q) => {
                  const itemsInQ = unifiedItems.filter(
                    (i) => i._quadrant === q.id,
                  );
                  const Icon = q.icon;

                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "p-5 rounded-2xl border-2 bg-card transition-colors flex flex-col h-full min-h-[350px] lg:min-h-[300px] overflow-hidden shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.03)]",
                        draggedItem
                          ? "border-primary/40 bg-primary/5 border-dashed"
                          : "border-border border-solid",
                      )}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDrop(q.id as QuadrantId);
                      }}
                    >
                      <div className="flex items-center justify-between mb-4 shrink-0 border-b pb-3">
                        <h3 className="font-bold flex items-center gap-2.5 text-base">
                          <div
                            className={cn(
                              "p-1.5 rounded-lg border shadow-sm",
                              q.color
                                .replace("border-", "border")
                                .split(" ")[0],
                              q.color.split(" ")[1],
                              q.color.split(" ")[2],
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-foreground">{q.label}</span>
                        </h3>
                        <span className="hidden sm:inline-flex text-[11px] uppercase tracking-wider text-muted-foreground font-semibold bg-muted/60 px-2.5 py-1 rounded-full">
                          {q.desc}
                        </span>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 p-1 min-h-0 pr-2">
                        {itemsInQ.map((item) => (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => {
                              setDraggedItem({
                                id: item.id,
                                isDiscovery: item._isDiscovery,
                              });
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragEnd={() => setDraggedItem(null)}
                            className="bg-background border shadow-sm rounded-xl p-3.5 cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-md transition-all group relative overflow-hidden"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-border/40 group-hover:bg-primary/40 transition-colors"></div>
                            <div className="flex items-start justify-between gap-3 mb-2 pl-2">
                              <div className="font-semibold text-sm leading-snug text-foreground group-hover:text-primary transition-colors">
                                {item.title}
                              </div>
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-2 py-0 uppercase shrink-0 h-5 font-semibold bg-primary/10 text-primary"
                              >
                                {item._displayType}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-3 pl-2">
                              {store.discoveryTags &&
                                (item.tags || []).map((tId: string) => {
                                  const t = store.discoveryTags.find(
                                    (x) => x.id === tId,
                                  );
                                  if (!t) return null;
                                  return (
                                    <Badge
                                      variant="outline"
                                      key={tId}
                                      className="text-[10px] py-0 font-medium px-2 h-5 leading-none text-muted-foreground bg-muted/30 border-muted-foreground/20"
                                    >
                                      {t.name}
                                    </Badge>
                                  );
                                })}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-border/60 pl-2">
                              <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                  <ArrowUp className="w-3.5 h-3.5 text-primary/70" />{" "}
                                  <span className="text-foreground/80">
                                    {item.impactScore}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                  <ArrowRight className="w-3.5 h-3.5 text-primary/70" />{" "}
                                  <span className="text-foreground/80">
                                    {item.effortScore}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5">
                                <Badge
                                  className={cn(
                                    "text-[10px] font-bold h-5 px-2 pb-0 shadow-none border-transparent",
                                    getPriorityLabel(item._priorityScore) ===
                                      "Critical"
                                      ? "bg-red-500 hover:bg-red-600 text-white"
                                      : getPriorityLabel(
                                            item._priorityScore,
                                          ) === "High"
                                        ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                                        : getPriorityLabel(
                                              item._priorityScore,
                                            ) === "Medium"
                                          ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
                                  )}
                                >
                                  {getPriorityLabel(item._priorityScore)} (
                                  {item._priorityScore})
                                </Badge>
                                {item.ownerId && (
                                  <PersonAvatar
                                    userId={item.ownerId}
                                    size="sm"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {itemsInQ.length === 0 && (
                          <div className="h-full min-h-[120px] flex items-center justify-center p-6 border-2 border-dashed border-border/50 rounded-xl bg-card/50">
                            <span className="text-muted-foreground/60 font-medium text-sm text-center">
                              Drag initiatives here
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Label (Desktop) */}
              <div className="hidden lg:flex items-center justify-between pt-8 mt-6 border-t-2 border-border/50 text-muted-foreground text-sm font-bold tracking-widest px-8">
                <div className="flex items-center gap-3 text-muted-foreground/50">
                  LOW EFFORT
                </div>
                <div className="flex items-center gap-3 text-foreground/80">
                  HIGH EFFORT <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
