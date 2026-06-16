import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  Clock,
  Briefcase,
  AlertOctagon,
  Activity,
  Layers,
  Zap,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  Calendar,
  Filter,
  Users,
  Target,
  FileText,
  Search,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  DIRECTORY,
  type Workspace,
  type BacklogItem,
  type Sprint,
} from "@/lib/workspace-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#4F46E5",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

export function PMDashboard({
  workspaces,
  store,
}: {
  workspaces: Workspace[];
  store: { items: BacklogItem[]; sprints: Sprint[] };
}) {
  const navigate = useNavigate();
  const { myUserId } = useCurrentUser();
  const currentUser = DIRECTORY.find((d) => d.id === myUserId);
  const userName = currentUser?.name.split(" ")[0] || "Robin";

  const hour = new Date().getHours();
  let greeting = "Good Morning";
  if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
  else if (hour >= 17) greeting = "Good Evening";

  const [filterWorkspace, setFilterWorkspace] = useState<string>("all");
  const [filterTime, setFilterTime] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredWorkspaces = useMemo(() => {
    let res = workspaces as Workspace[];
    if (filterWorkspace !== "all") {
      res = res.filter((w) => w.code === filterWorkspace);
    }
    // Simplistic filter application
    return res;
  }, [workspaces, filterWorkspace]);

  const ownedItems = useMemo(() => {
    return (store.items as BacklogItem[]).filter((i) =>
      filteredWorkspaces.some((w) => w.code === i.workspaceCode),
    );
  }, [store.items, filteredWorkspaces]);

  const activeSprints = store.sprints.filter(
    (s: Sprint) =>
      s.state === "active" &&
      filteredWorkspaces.some((w) => w.code === s.workspaceCode),
  );
  const completedSprints = store.sprints
    .filter(
      (s: Sprint) =>
        s.state === "completed" &&
        filteredWorkspaces.some((w) => w.code === s.workspaceCode),
    )
    .sort(
      (a: Sprint, b: Sprint) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

  // Project Completion %
  const projectItems = ownedItems.filter(
    (i) =>
      (i.type.toLowerCase() === "task" || i.type.toLowerCase() === "feature") &&
      !i.parentId,
  );
  const doneProjectItems = projectItems.filter((i) => i.status === "Completed");
  const completionPct =
    projectItems.length > 0
      ? Math.round((doneProjectItems.length / projectItems.length) * 100)
      : 0;

  // Velocity
  const sprintVelocities = completedSprints.map((s: Sprint) => {
    const sprintItems = ownedItems.filter(
      (i) => i.sprintId === s.id && i.status === "Completed",
    );
    return sprintItems.reduce((acc, i) => acc + (i.points || 0), 0);
  });
  const avgVelocity =
    sprintVelocities.length > 0
      ? Math.round(
          sprintVelocities.reduce((a, b) => a + b, 0) / sprintVelocities.length,
        )
      : 0;
  let velocityTrend = 0;
  if (sprintVelocities.length > 1) {
    const last = sprintVelocities[sprintVelocities.length - 1];
    const prev = sprintVelocities[sprintVelocities.length - 2];
    if (prev > 0) velocityTrend = Math.round(((last - prev) / prev) * 100);
    else if (last > 0) velocityTrend = 100;
  }

  // Risks & Dependencies
  const dependenciesRisks = ownedItems.flatMap((i) => i.dependencyRisks || []);
  const openRisks = dependenciesRisks.filter(
    (dr) =>
      dr.type === "Risk" &&
      (dr.status === "Open" || dr.status === "In Progress"),
  );
  const openDependencies = dependenciesRisks.filter(
    (dr) =>
      dr.type === "Dependency" &&
      (dr.status === "Open" || dr.status === "In Progress"),
  );

  // Overdue Tasks
  const today = new Date().toISOString().split("T")[0];
  const overdueTasks = ownedItems.filter(
    (i) => i.dueDate && i.dueDate < today && i.status !== "Completed",
  );

  // Team Utilization (Mock logic simply to show standard view based on items assigned)
  const totalAssignedItems = ownedItems.filter(
    (i) => i.assigneeId && i.status !== "Completed",
  );
  const uniqueAssignees = Array.from(
    new Set(totalAssignedItems.map((i) => i.assigneeId)),
  );
  const utilizationPct =
    uniqueAssignees.length > 0
      ? Math.min(Math.max(10 + uniqueAssignees.length * 15, 60), 95)
      : 0;
  const overUtilizedPct = 5;
  const underUtilizedPct = 100 - utilizationPct - overUtilizedPct;

  const myActions: {
    id: string;
    type: string;
    title: string;
    subtitle: string;
    severity: "info" | "warning" | "critical";
    link: string;
  }[] = [];

  if (myUserId) {
    // 1. Tasks Assigned to Manager
    const myTasks = ownedItems.filter(
      (i) => i.assigneeId === myUserId && i.status !== "Completed",
    );
    myTasks.forEach((t) => {
      myActions.push({
        id: `task-${t.id}`,
        type: "Task",
        title: t.title,
        subtitle: `Assigned to you in ${filteredWorkspaces.find((w) => w.code === t.workspaceCode)?.name}`,
        severity: "info",
        link: `/workspaces/${t.workspaceCode}/backlog`,
      });
    });

    // 2 & 3. Risks & Dependencies Assigned to Manager
    const drs = ownedItems.flatMap((i) =>
      (i.dependencyRisks || []).map((dr) => ({ dr, item: i })),
    );
    drs
      .filter((d) => d.dr.ownerIds.includes(myUserId) && d.dr.status === "Open")
      .forEach((d) => {
        myActions.push({
          id: `dr-${d.dr.id}`,
          type: d.dr.type,
          title: d.dr.description || `${d.dr.type} assigned to you`,
          subtitle: `Open in ${filteredWorkspaces.find((w) => w.code === d.item.workspaceCode)?.name}`,
          severity:
            d.dr.impactLevel === "Blocker" || d.dr.impactLevel === "Critical"
              ? "critical"
              : "warning",
          link: `/workspaces/${d.item.workspaceCode}/board`,
        });
      });

    // 4. Sprint Nearing Closure
    const now = new Date();
    activeSprints.forEach((s) => {
      if (s.endDate) {
        const end = new Date(s.endDate);
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const sprintItems = ownedItems.filter((i) => i.sprintId === s.id);
        const pctComplete = sprintItems.length
          ? Math.round(
              (sprintItems.filter((i) => i.status === "Completed").length /
                sprintItems.length) *
                100,
            )
          : 0;
        const pendingPoints = sprintItems
          .filter((i) => i.status !== "Completed")
          .reduce((a, b) => a + (b.points || 0), 0);

        if (diffDays >= 0 && diffDays <= 2) {
          myActions.push({
            id: `sprint-${s.id}`,
            type: "Sprint",
            title: `Sprint "${s.name}" closes in ${diffDays} days`,
            subtitle: `${pendingPoints} story points pending`,
            severity: "critical",
            link: `/workspaces/${s.workspaceCode}/board`,
          });
        } else if (diffDays > 2 && diffDays <= 5) {
          myActions.push({
            id: `sprint-${s.id}`,
            type: "Sprint",
            title: `Sprint "${s.name}" closes in ${diffDays} days`,
            subtitle: `${100 - pctComplete}% work remaining`,
            severity: "warning",
            link: `/workspaces/${s.workspaceCode}/board`,
          });
        }
      }
    });

    // 5 & 6. Project At Risk / Off Track
    filteredWorkspaces.forEach((w: Workspace) => {
      if (w.startDate && w.endDate) {
        const start = new Date(w.startDate).getTime();
        const end = new Date(w.endDate).getTime();
        const curr = now.getTime();
        if (curr > start && end > start) {
          const timePct = Math.min(((curr - start) / (end - start)) * 100, 100);

          const wsItems = ownedItems.filter((i) => i.workspaceCode === w.code);
          const pItems = wsItems.filter(
            (i) =>
              (i.type.toLowerCase() === "task" ||
                i.type.toLowerCase() === "feature") &&
              !i.parentId,
          );
          const completedCount = pItems.filter(
            (i) => i.status === "Completed",
          ).length;
          const cPct =
            pItems.length > 0
              ? Math.round((completedCount / pItems.length) * 100)
              : 0;

          if (timePct - cPct > 25) {
            myActions.push({
              id: `ws-offtrack-${w.code}`,
              type: "Project",
              title: `${w.name} is Off Track`,
              subtitle: `Project is Off Track and requires intervention.`,
              severity: "critical",
              link: `/workspaces/${w.code}/dashboard`,
            });
          } else if (timePct - cPct > 15) {
            myActions.push({
              id: `ws-atrisk-${w.code}`,
              type: "Project",
              title: `${w.name} is At Risk`,
              subtitle: `Project has moved to At Risk status.`,
              severity: "warning",
              link: `/workspaces/${w.code}/dashboard`,
            });
          }
        }
      }
    });
  }

  // Render KPIs
  const KPI = ({
    title,
    value,
    comp,
    icon: Icon,
    colorClass,
    highlight,
  }: {
    title: string;
    value: string | number;
    comp?: React.ReactNode;
    icon: React.ElementType;
    colorClass: string;
    highlight?: boolean;
  }) => (
    <Card className="shadow-sm">
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between mb-2">
          <p className="text-[13px] font-medium text-muted-foreground">
            {title}
          </p>
          <div className={cn("p-1.5 rounded-lg", colorClass)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-foreground tracking-tight">
            {value}
          </h3>
          {comp && <div className="mt-1">{comp}</div>}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppShell title="PM Dashboard">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8 space-y-8 pb-32">
        {/* Welcome Banner */}
        <div className="bg-card border border-border/40 rounded-2xl py-6 px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {greeting}, {userName} <span className="text-xl">👋</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-[14.5px]">
              {overdueTasks.length > 0 && (
                <span className="text-destructive font-medium">
                  {overdueTasks.length} overdue tasks
                </span>
              )}
              {overdueTasks.length > 0
                ? " require your attention today. "
                : "Everything is looking good. "}
              Sprint velocity has{" "}
              {velocityTrend >= 0 ? "improved" : "decreased"} by{" "}
              {Math.abs(velocityTrend)}% this{" "}
              {filterTime === "all" ? "cycle" : "month"}.
            </p>
          </div>
          <div className="flex gap-2.5">
            <Button asChild variant="outline" size="sm" className="h-9">
              <Link to="/workspaces/new">
                <Plus className="w-4 h-4 mr-1.5" /> Workspace
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-9">
              <Link to="/timelog">
                <Clock className="w-4 h-4 mr-1.5" /> Log Time
              </Link>
            </Button>
            <Button size="sm" className="h-9 bg-[#4F46E5] hover:bg-[#4338CA]">
              Action Center
            </Button>
          </div>
        </div>

        {/* Global Filters */}
        <div className="bg-card/40 border border-border/40 rounded-xl px-6 py-3 flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterWorkspace} onValueChange={setFilterWorkspace}>
            <SelectTrigger className="w-[180px] h-8 text-[13px] bg-card">
              <SelectValue placeholder="Workspace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workspaces</SelectItem>
              {workspaces.map((w: Workspace) => (
                <SelectItem key={w.code} value={w.code}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterTime} onValueChange={setFilterTime}>
            <SelectTrigger className="w-[140px] h-8 text-[13px] bg-card">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="q1">Q1</SelectItem>
              <SelectItem value="q2">Q2</SelectItem>
              <SelectItem value="q3">Q3</SelectItem>
              <SelectItem value="q4">Q4</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-8 text-[13px] bg-card">
              <SelectValue placeholder="Project Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="on_track">On Track</SelectItem>
              <SelectItem value="at_risk">At Risk</SelectItem>
              <SelectItem value="off_track">Off Track</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <KPI
            title="My Projects"
            value={filteredWorkspaces.length}
            icon={Briefcase}
            colorClass="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <KPI
            title="Sprint Velocity"
            value={avgVelocity}
            icon={TrendingUp}
            colorClass="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
            comp={
              <div
                className={`text-[11px] font-medium ${velocityTrend >= 0 ? "text-emerald-600" : "text-destructive"}`}
              >
                {velocityTrend >= 0 ? "↑" : "↓"} {Math.abs(velocityTrend)}% vs
                last
              </div>
            }
          />
          <KPI
            title="Open Risks"
            value={openRisks.length}
            icon={AlertTriangle}
            colorClass="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          />
          <KPI
            title="Dependencies"
            value={openDependencies.length}
            icon={Layers}
            colorClass="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
          />
          <KPI
            title="Overdue Tasks"
            value={overdueTasks.length}
            icon={AlertOctagon}
            colorClass="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            comp={
              overdueTasks.length > 0 ? (
                <div className="text-[11px] text-destructive font-medium animate-pulse">
                  Needs attention
                </div>
              ) : null
            }
          />
          <KPI
            title="Utilization"
            value={`${utilizationPct}%`}
            icon={Users}
            colorClass="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
            comp={
              <div className="text-[11px] text-muted-foreground flex gap-2">
                <span className="text-red-500">{overUtilizedPct}% Over</span>
              </div>
            }
          />
        </div>

        {/* Workspace Health Table */}
        <Card className="shadow-sm border-border/40 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/40 py-4 px-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Project Portfolio Health
              </CardTitle>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              View Full Portfolio
            </Button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/20 border-b border-border/60">
                <tr className="text-muted-foreground text-[12px] uppercase tracking-wider font-semibold">
                  <th className="px-5 py-3.5">Workspace</th>
                  <th className="px-5 py-3.5 w-24">Completion</th>
                  <th className="px-5 py-3.5 w-32">Health Status</th>
                  <th className="px-5 py-3.5 w-32">Active Sprint</th>
                  <th className="px-5 py-3.5 w-24 text-right">Velocity</th>
                  <th className="px-5 py-3.5 w-24 text-right">Risks</th>
                  <th className="px-5 py-3.5 w-24 text-right">Dependencies</th>
                  <th className="px-5 py-3.5 w-24 text-right">Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredWorkspaces.map((w: Workspace) => {
                  const wsItems = ownedItems.filter(
                    (i) => i.workspaceCode === w.code,
                  );
                  const pItems = wsItems.filter(
                    (i) =>
                      (i.type.toLowerCase() === "task" ||
                        i.type.toLowerCase() === "feature") &&
                      !i.parentId,
                  );
                  const cPct =
                    pItems.length > 0
                      ? Math.round(
                          (pItems.filter((i) => i.status === "Completed")
                            .length /
                            pItems.length) *
                            100,
                        )
                      : 0;

                  let expProg = 0;
                  if (w.startDate && w.endDate) {
                    const sDate = new Date(w.startDate).getTime();
                    const eDate = new Date(w.endDate).getTime();
                    const nDate = new Date().getTime();
                    if (nDate >= eDate) expProg = 100;
                    else if (nDate <= sDate) expProg = 0;
                    else
                      expProg = Math.round(
                        ((nDate - sDate) / (eDate - sDate)) * 100,
                      );
                  }

                  let health = {
                    label: "On Track",
                    icon: "🟢",
                    cls: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30",
                  };
                  if (cPct < expProg - 10)
                    health = {
                      label: "Off Track",
                      icon: "🔴",
                      cls: "text-destructive bg-destructive/10",
                    };
                  else if (cPct < expProg)
                    health = {
                      label: "At Risk",
                      icon: "🟠",
                      cls: "text-amber-700 bg-amber-50 dark:bg-amber-950/30",
                    };

                  const aSprint = store.sprints.find(
                    (s: Sprint) =>
                      s.state === "active" && s.workspaceCode === w.code,
                  );
                  const wRisks = wsItems
                    .flatMap((i) => i.dependencyRisks || [])
                    .filter(
                      (dr) => dr.type === "Risk" && dr.status !== "Closed",
                    ).length;
                  const wDeps = wsItems
                    .flatMap((i) => i.dependencyRisks || [])
                    .filter(
                      (dr) =>
                        dr.type === "Dependency" && dr.status !== "Closed",
                    ).length;
                  const wOverdue = wsItems.filter(
                    (i) =>
                      i.dueDate &&
                      i.dueDate < today &&
                      i.status !== "Completed",
                  ).length;

                  const prevSprints = store.sprints.filter(
                    (s: Sprint) =>
                      s.state === "completed" && s.workspaceCode === w.code,
                  );
                  const avgV = prevSprints.length
                    ? Math.round(
                        prevSprints.reduce((acc: number, s: Sprint) => {
                          return (
                            acc +
                            wsItems
                              .filter(
                                (i) =>
                                  i.sprintId === s.id &&
                                  i.status === "Completed",
                              )
                              .reduce(
                                (sum, item) => sum + (item.points || 0),
                                0,
                              )
                          );
                        }, 0) / prevSprints.length,
                      )
                    : 0;

                  return (
                    <tr
                      key={w.code}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() =>
                        navigate({
                          to: "/workspaces/$code/dashboard",
                          params: { code: w.code },
                        })
                      }
                    >
                      <td className="px-5 py-4 font-medium text-foreground flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary/10 flex flex-col items-center justify-center text-[10px] font-bold text-primary">
                          {w.code}
                        </div>
                        <div>
                          <div className="group-hover:underline">{w.name}</div>
                          <div className="text-[11px] text-muted-foreground font-normal">
                            Owner:{" "}
                            {DIRECTORY.find(
                              (d) => d.id === w.ownerIds[0],
                            )?.name.split(" ")[0] || "Unknown"}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{cPct}%</span>
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${cPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          className={cn(
                            "px-2 py-0.5 rounded flex items-center gap-1.5 shadow-none hover:bg-transparent font-semibold border-none whitespace-nowrap w-fit",
                            health.cls,
                          )}
                        >
                          {health.icon} {health.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={
                            aSprint
                              ? "text-foreground font-medium"
                              : "text-muted-foreground text-xs"
                          }
                        >
                          {aSprint ? aSprint.name : "No active sprint"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-medium">
                        {avgV > 0 ? avgV : "-"}
                      </td>
                      <td className="px-5 py-4 text-right font-medium">
                        {wRisks > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded">
                            {wRisks}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right font-medium">
                        {wDeps > 0 ? (
                          <span className="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded">
                            {wDeps}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right font-medium">
                        {wOverdue > 0 ? (
                          <span className="text-destructive bg-destructive/10 px-2 py-0.5 rounded font-bold">
                            {wOverdue}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Delivery Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sprint Velocity Trend */}
          <Card className="shadow-sm border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Sprint Velocity Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={completedSprints.slice(-6).map((s: Sprint) => {
                      const v = ownedItems
                        .filter(
                          (i) =>
                            i.sprintId === s.id && i.status === "Completed",
                        )
                        .reduce((a, b) => a + (b.points || 0), 0);
                      return { name: s.name, SP: v };
                    })}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#888"
                      opacity={0.2}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{
                        stroke: "#888",
                        strokeWidth: 1,
                        strokeDasharray: "4 4",
                      }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="SP"
                      stroke="#4F46E5"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sprint Burndown Performance */}
          <Card className="shadow-sm border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Sprint Burndown Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={completedSprints.slice(-6).map((s: Sprint) => {
                      const sprintItems = ownedItems.filter(
                        (i) => i.sprintId === s.id,
                      );
                      const planned = sprintItems.reduce(
                        (a, b) => a + (b.points || 0),
                        0,
                      );
                      const delivered = sprintItems
                        .filter((i) => i.status === "Completed")
                        .reduce((a, b) => a + (b.points || 0), 0);
                      return {
                        name: s.name,
                        Planned: planned,
                        Delivered: delivered,
                      };
                    })}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#888"
                      opacity={0.2}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: "#888", opacity: 0.1 }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                    <Bar
                      dataKey="Planned"
                      fill="#CBD5E1"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Delivered"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border-border/40">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">
                Project Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredWorkspaces
                  .map((w: Workspace) => {
                    const wsItems = ownedItems.filter(
                      (i) => i.workspaceCode === w.code,
                    );
                    const pItems = wsItems.filter(
                      (i) =>
                        (i.type.toLowerCase() === "task" ||
                          i.type.toLowerCase() === "feature") &&
                        !i.parentId,
                    );
                    const completedCount = pItems.filter(
                      (i) => i.status === "Completed",
                    ).length;
                    const cPct =
                      pItems.length > 0
                        ? Math.round((completedCount / pItems.length) * 100)
                        : 0;

                    const totalLoggedHours = wsItems.reduce(
                      (acc, currentItem) => {
                        return (
                          acc +
                          (currentItem.worklogs || []).reduce(
                            (sum, wl) => sum + wl.hours,
                            0,
                          )
                        );
                      },
                      0,
                    );

                    return { w, cPct, totalLoggedHours };
                  })
                  .sort((a, b) => b.cPct - a.cPct) // Sort by descending completion
                  .map(({ w, cPct, totalLoggedHours }) => (
                    <div key={w.code} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="font-semibold text-foreground text-sm">
                            {w.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                            <span>
                              <span className="text-foreground font-medium">
                                {cPct}%
                              </span>{" "}
                              Complete
                            </span>
                            <span>
                              <span className="text-foreground font-medium">
                                {100 - cPct}%
                              </span>{" "}
                              Remaining
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                          <span className="text-foreground font-medium text-sm">
                            {totalLoggedHours.toLocaleString()}
                          </span>{" "}
                          Hours Logged
                        </div>
                      </div>
                      <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden w-full mt-2">
                        <div
                          className="h-full bg-indigo-600 transition-all"
                          style={{ width: `${cPct}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/40 flex flex-col h-full min-h-[400px]">
            <CardHeader className="border-b border-border/40 py-4 bg-muted/20">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> My Actions
                {myActions.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-auto text-xs px-2 py-0.5"
                  >
                    {myActions.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              <div className="divide-y divide-border/40 p-4 space-y-4">
                {myActions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm flex-col items-center justify-center flex h-full">
                    <CheckCircle2 className="w-8 h-8 opacity-20 mb-2" />
                    No actions required at this time.
                  </div>
                ) : (
                  myActions.map((action, idx) => (
                    <div
                      key={`${action.id}-${idx}`}
                      className={`p-4 rounded-xl border bg-muted/10 shadow-sm flex flex-col gap-3 transition-colors ${
                        action.severity === "critical"
                          ? "border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10"
                          : action.severity === "warning"
                            ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10"
                            : "border-border/60"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <div className="font-semibold text-sm">
                            {action.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {action.subtitle}
                          </div>
                        </div>
                        {action.severity === "critical" ? (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none shadow-none shrink-0">
                            Critical
                          </Badge>
                        ) : action.severity === "warning" ? (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none shadow-none shrink-0">
                            Warning
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-none shrink-0">
                            Info
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-end mt-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 text-xs"
                          asChild
                        >
                          <Link to={action.link}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Capacity & Utilization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border-border/40">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">
                Team Occupancy Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-muted/20 border-b border-border/60">
                    <tr className="text-muted-foreground text-[12px] uppercase font-semibold tracking-wider">
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2 text-right">Allocated Hrs</th>
                      <th className="px-4 py-2 text-right">Capacity (Week)</th>
                      <th className="px-4 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {uniqueAssignees
                      .map((uid) => {
                        const user = DIRECTORY.find((d) => d.id === uid);
                        if (!user) return null;
                        const assignedPoints = totalAssignedItems
                          .filter((i) => i.assigneeId === uid)
                          .reduce((a, b) => a + (b.points || 0), 0);
                        const allocatedHours = assignedPoints * 4; // Mock conversion
                        const capacity = 40;
                        const pct = Math.round(
                          (allocatedHours / capacity) * 100,
                        );
                        let statCls = "bg-emerald-100 text-emerald-700";
                        let statLbl = "Optimal";
                        if (pct > 95) {
                          statCls = "bg-red-100 text-red-700";
                          statLbl = "Overallocated";
                        } else if (pct < 50) {
                          statCls = "bg-amber-100 text-amber-700";
                          statLbl = "Underutilized";
                        }

                        return (
                          <tr key={uid} className="hover:bg-muted/30">
                            <td className="px-4 py-2 font-medium flex items-center gap-2">
                              <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="w-6 h-6 rounded-full"
                              />
                              {user.name}
                            </td>
                            <td className="px-4 py-2 text-right font-mono">
                              {allocatedHours}h
                            </td>
                            <td className="px-4 py-2 text-right text-muted-foreground">
                              {capacity}h
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Badge
                                className={`${statCls} border-none shadow-none`}
                              >
                                {statLbl}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                      .slice(0, 5)}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Resource Workload Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={uniqueAssignees
                      .map((uid) => {
                        const user = DIRECTORY.find((d) => d.id === uid);
                        const assignedPoints = totalAssignedItems
                          .filter((i) => i.assigneeId === uid)
                          .reduce((a, b) => a + (b.points || 0), 0);
                        return {
                          name: user?.name.split(" ")[0] || "Unknown",
                          Hours: assignedPoints * 4,
                        };
                      })
                      .slice(0, 6)}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke="#888"
                      opacity={0.2}
                    />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      width={70}
                    />
                    <Tooltip
                      cursor={{ fill: "#888", opacity: 0.1 }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                      }}
                    />
                    <Bar dataKey="Hours" fill="#EC4899" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk & Dependency Command Center */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-sm border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Risk Impact Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        [
                          {
                            name: "Blocker",
                            value: openRisks.filter(
                              (r) => r.impactLevel === "Blocker",
                            ).length,
                          },
                          {
                            name: "Critical",
                            value: openRisks.filter(
                              (r) => r.impactLevel === "Critical",
                            ).length,
                          },
                          {
                            name: "High",
                            value: openRisks.filter(
                              (r) => r.impactLevel === "High",
                            ).length,
                          },
                          {
                            name: "Medium",
                            value: openRisks.filter(
                              (r) => r.impactLevel === "Medium",
                            ).length,
                          },
                          {
                            name: "Low",
                            value: openRisks.filter(
                              (r) => r.impactLevel === "Low",
                            ).length,
                          },
                        ].filter((d) => d.value > 0).length > 0
                          ? [
                              {
                                name: "Blocker",
                                value: openRisks.filter(
                                  (r) => r.impactLevel === "Blocker",
                                ).length,
                              },
                              {
                                name: "Critical",
                                value: openRisks.filter(
                                  (r) => r.impactLevel === "Critical",
                                ).length,
                              },
                              {
                                name: "High",
                                value: openRisks.filter(
                                  (r) => r.impactLevel === "High",
                                ).length,
                              },
                              {
                                name: "Medium",
                                value: openRisks.filter(
                                  (r) => r.impactLevel === "Medium",
                                ).length,
                              },
                              {
                                name: "Low",
                                value: openRisks.filter(
                                  (r) => r.impactLevel === "Low",
                                ).length,
                              },
                            ].filter((d) => d.value > 0)
                          : [{ name: "No Risks", value: 1 }]
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell key="cell-0" fill="#EF4444" />
                      <Cell key="cell-1" fill="#F97316" />
                      <Cell key="cell-2" fill="#F59E0B" />
                      <Cell key="cell-3" fill="#3B82F6" />
                      <Cell key="cell-4" fill="#10B981" />
                      {openRisks.length === 0 && (
                        <Cell key="empty" fill="#E5E7EB" />
                      )}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Risks by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        [
                          {
                            name: "Open",
                            value: dependenciesRisks.filter(
                              (r) => r.type === "Risk" && r.status === "Open",
                            ).length,
                          },
                          {
                            name: "In Progress",
                            value: dependenciesRisks.filter(
                              (r) =>
                                r.type === "Risk" && r.status === "In Progress",
                            ).length,
                          },
                          {
                            name: "Closed",
                            value: dependenciesRisks.filter(
                              (r) => r.type === "Risk" && r.status === "Closed",
                            ).length,
                          },
                        ].filter((d) => d.value > 0).length > 0
                          ? [
                              {
                                name: "Open",
                                value: dependenciesRisks.filter(
                                  (r) =>
                                    r.type === "Risk" && r.status === "Open",
                                ).length,
                              },
                              {
                                name: "In Progress",
                                value: dependenciesRisks.filter(
                                  (r) =>
                                    r.type === "Risk" &&
                                    r.status === "In Progress",
                                ).length,
                              },
                              {
                                name: "Closed",
                                value: dependenciesRisks.filter(
                                  (r) =>
                                    r.type === "Risk" && r.status === "Closed",
                                ).length,
                              },
                            ].filter((d) => d.value > 0)
                          : [{ name: "No Risks", value: 1 }]
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell key="cell-0" fill="#EF4444" />
                      <Cell key="cell-1" fill="#F59E0B" />
                      <Cell key="cell-2" fill="#10B981" />
                      {dependenciesRisks.filter((r) => r.type === "Risk")
                        .length === 0 && <Cell key="empty" fill="#E5E7EB" />}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Dependencies by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        [
                          {
                            name: "Open",
                            value: dependenciesRisks.filter(
                              (r) =>
                                r.type === "Dependency" && r.status === "Open",
                            ).length,
                          },
                          {
                            name: "In Progress",
                            value: dependenciesRisks.filter(
                              (r) =>
                                r.type === "Dependency" &&
                                r.status === "In Progress",
                            ).length,
                          },
                          {
                            name: "Closed",
                            value: dependenciesRisks.filter(
                              (r) =>
                                r.type === "Dependency" &&
                                r.status === "Closed",
                            ).length,
                          },
                        ].filter((d) => d.value > 0).length > 0
                          ? [
                              {
                                name: "Open",
                                value: dependenciesRisks.filter(
                                  (r) =>
                                    r.type === "Dependency" &&
                                    r.status === "Open",
                                ).length,
                              },
                              {
                                name: "In Progress",
                                value: dependenciesRisks.filter(
                                  (r) =>
                                    r.type === "Dependency" &&
                                    r.status === "In Progress",
                                ).length,
                              },
                              {
                                name: "Closed",
                                value: dependenciesRisks.filter(
                                  (r) =>
                                    r.type === "Dependency" &&
                                    r.status === "Closed",
                                ).length,
                              },
                            ].filter((d) => d.value > 0)
                          : [{ name: "No Dependencies", value: 1 }]
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell key="cell-0" fill="#EF4444" />
                      <Cell key="cell-1" fill="#F59E0B" />
                      <Cell key="cell-2" fill="#10B981" />
                      {dependenciesRisks.filter((r) => r.type === "Dependency")
                        .length === 0 && <Cell key="empty" fill="#E5E7EB" />}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Distribution & Capacity Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Task Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "To Do",
                          value: ownedItems.filter((i) => i.status === "To Do")
                            .length,
                        },
                        {
                          name: "In Progress",
                          value: ownedItems.filter(
                            (i) => i.status === "In Progress",
                          ).length,
                        },
                        {
                          name: "In Review",
                          value: ownedItems.filter(
                            (i) => i.status === "In Review",
                          ).length,
                        },
                        {
                          name: "Completed",
                          value: ownedItems.filter(
                            (i) => i.status === "Completed",
                          ).length,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell fill="#CBD5E1" />
                      <Cell fill="#3B82F6" />
                      <Cell fill="#F59E0B" />
                      <Cell fill="#10B981" />
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Priority Breakdown (Pending)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Critical",
                        value: ownedItems.filter(
                          (i) =>
                            i.priority === "Critical" &&
                            i.status !== "Completed",
                        ).length,
                      },
                      {
                        name: "High",
                        value: ownedItems.filter(
                          (i) =>
                            i.priority === "High" && i.status !== "Completed",
                        ).length,
                      },
                      {
                        name: "Medium",
                        value: ownedItems.filter(
                          (i) =>
                            i.priority === "Medium" && i.status !== "Completed",
                        ).length,
                      },
                      {
                        name: "Low",
                        value: ownedItems.filter(
                          (i) =>
                            i.priority === "Low" && i.status !== "Completed",
                        ).length,
                      },
                    ]}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#888"
                      opacity={0.2}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: "#888", opacity: 0.1 }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                      }}
                    />
                    <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Center & Deliverables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border-border/40 flex flex-col h-[400px]">
            <CardHeader className="border-b border-border/40 py-4 bg-muted/20">
              <CardTitle className="text-base font-semibold text-destructive flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" /> Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              <div className="divide-y divide-border/40">
                {overdueTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="p-4 hover:bg-muted/30 transition-colors flex justify-between items-start"
                  >
                    <div>
                      <div className="font-semibold text-sm">{task.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Overdue in{" "}
                        {
                          filteredWorkspaces.find(
                            (w) => w.code === task.workspaceCode,
                          )?.name
                        }
                      </div>
                    </div>
                    <Badge
                      variant="destructive"
                      className="shadow-none rounded"
                    >
                      Overdue
                    </Badge>
                  </div>
                ))}
                {openRisks.slice(0, 3).map((risk) => (
                  <div
                    key={risk.id}
                    className="p-4 hover:bg-muted/30 transition-colors flex justify-between items-start"
                  >
                    <div>
                      <div className="font-semibold text-sm">{risk.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Open ({risk.impactLevel} Impact Risk)
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none rounded shadow-none">
                      Review
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/40 flex flex-col h-[400px]">
            <CardHeader className="border-b border-border/40 py-4 bg-muted/20 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Upcoming Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-muted/10 sticky top-0 backdrop-blur z-10">
                  <tr className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                    <th className="px-4 py-3">Task</th>
                    <th className="px-4 py-3">Due</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {ownedItems
                    .filter((i) => i.dueDate && i.status !== "Completed")
                    .sort(
                      (a, b) =>
                        new Date(a.dueDate!).getTime() -
                        new Date(b.dueDate!).getTime(),
                    )
                    .slice(0, 8)
                    .map((i) => (
                      <tr key={i.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div
                            className="font-medium text-foreground truncate max-w-[200px]"
                            title={i.title}
                          >
                            {i.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {
                              filteredWorkspaces.find(
                                (w) => w.code === i.workspaceCode,
                              )?.name
                            }
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {new Date(i.dueDate!).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-bold py-0.5"
                          >
                            {i.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="shadow-sm border-border/40 flex flex-col h-[400px]">
            <CardHeader className="border-b border-border/40 py-4 bg-muted/20">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4" /> Recent Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              <div className="divide-y divide-border/40">
                {/* Mock Activity Data */}
                {[
                  {
                    action: "completed task",
                    target: "Setup Repository",
                    user: "Alex Chen",
                    time: "10m ago",
                  },
                  {
                    action: "created risk",
                    target: "API Rate Limits",
                    user: "Sam Smith",
                    time: "1h ago",
                  },
                  {
                    action: "moved",
                    target: "Database Schema",
                    user: "Jordan Lee",
                    time: "2h ago",
                    to: "In Review",
                  },
                  {
                    action: "commented on",
                    target: "Auth Flow",
                    user: "Robin PM",
                    time: "3h ago",
                  },
                  {
                    action: "completed sprint",
                    target: "Sprint 2 (Beta)",
                    user: "System",
                    time: "1d ago",
                  },
                ].map((act, i) => (
                  <div
                    key={i}
                    className="p-4 hover:bg-muted/30 transition-colors flex gap-3 items-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {act.user.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm">
                        <span className="font-semibold">{act.user}</span>{" "}
                        {act.action}{" "}
                        <span className="font-medium text-foreground">
                          {act.target}
                        </span>{" "}
                        {act.to && (
                          <>
                            to{" "}
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase"
                            >
                              {act.to}
                            </Badge>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {act.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
