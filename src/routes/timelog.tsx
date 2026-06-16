import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { DIRECTORY } from "@/lib/workspace-store";
import { useState, useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PersonAvatar } from "@/components/PersonAvatar";
import {
  Clock,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskDetail } from "@/components/task-detail/TaskDetailProvider";

export const Route = createFileRoute("/timelog")({
  component: TimeLogRoute,
});

function TimeLogRoute() {
  const { store } = useWorkspaceStore();
  const { openTask } = useTaskDetail();

  // Date State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("all");
  const [selectedSprint, setSelectedSprint] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedResource, setSelectedResource] = useState<string>("all");
  const [utilizationFilter, setUtilizationFilter] = useState<string>("all"); // all, under, full, over

  // Week Days based on selectedDate
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Data processing
  const rawWorklogs = useMemo(() => {
    const logs: Array<{
      id: string;
      userId: string;
      hours: number;
      date: string;
      comment?: string;
      taskId: string;
      taskName: string;
      workspaceCode: string;
      workspaceName: string;
      sprintId?: string;
    }> = [];

    store.items.forEach((task) => {
      const workspace = store.workspaces.find(
        (w) => w.code === task.workspaceCode,
      );
      if (task.worklogs) {
        task.worklogs.forEach((log) => {
          logs.push({
            ...log,
            taskId: task.id,
            taskName: task.title,
            workspaceCode: task.workspaceCode,
            workspaceName: workspace?.name || "Unknown",
            sprintId: task.sprintId,
          });
        });
      }
    });
    return logs;
  }, [store.items, store.workspaces]);

  // Aggregate user daily totals (for KPIs and Resource Summary)
  // For the selected Date ONLY or for the whole week? The KPIs say "for the selected day". Let's use `selectedDate`
  const dailyUserTotals = useMemo(() => {
    const totals: Record<string, number> = {}; // userId -> total hours on selectedDate
    DIRECTORY.forEach((p) => (totals[p.id] = 0));

    rawWorklogs.forEach((log) => {
      if (log.date && isSameDay(parseISO(log.date), selectedDate)) {
        if (totals[log.userId] !== undefined) {
          totals[log.userId] += log.hours;
        } else {
          totals[log.userId] = log.hours;
        }
      }
    });
    return totals;
  }, [rawWorklogs, selectedDate]);

  // Weekly User Totals
  const weeklyUserTotals = useMemo(() => {
    const totals: Record<string, Record<string, number>> = {}; // userId -> dateString -> hours

    DIRECTORY.forEach((p) => {
      totals[p.id] = {};
      weekDays.forEach((d) => {
        totals[p.id][format(d, "yyyy-MM-dd")] = 0;
      });
    });

    rawWorklogs.forEach((log) => {
      if (log.date) {
        const logDate = parseISO(log.date);
        if (isWithinInterval(logDate, { start: weekStart, end: weekEnd })) {
          const dateStr = format(logDate, "yyyy-MM-dd");
          if (totals[log.userId] && totals[log.userId][dateStr] !== undefined) {
            totals[log.userId][dateStr] += log.hours;
          }
        }
      }
    });
    return totals;
  }, [rawWorklogs, weekDays, weekStart, weekEnd]);

  const kpis = useMemo(() => {
    let under = 0;
    let over = 0;
    let full = 0;
    let totalLogsToday = 0;

    Object.values(dailyUserTotals).forEach((hours) => {
      if (hours < 8) under++;
      else if (hours === 8) full++;
      else over++;
      totalLogsToday += hours;
    });

    const activeResources = DIRECTORY.length;
    const avg =
      activeResources > 0 ? (totalLogsToday / activeResources).toFixed(1) : "0";

    return { under, full, over, avg, totalLogsToday };
  }, [dailyUserTotals]);

  // Handle KPI Clicks
  const handleKpiClick = (filter: string) => {
    setUtilizationFilter(utilizationFilter === filter ? "all" : filter);
  };

  // Build Table Data
  // We need rows by (Resource, Task).
  // First filter worklogs for the current week AND by the sidebar filters
  const tableRows = useMemo(() => {
    const rowsMap = new Map<string, any>(); // key: userId-taskId

    // Filter logic
    const queryLower = searchQuery.toLowerCase();

    // Group logs by user and task
    rawWorklogs.forEach((log) => {
      const user = DIRECTORY.find((p) => p.id === log.userId);
      if (!user) return; // Only show active resources

      // Apply Search Filter
      const searchMatch =
        user.name.toLowerCase().includes(queryLower) ||
        log.workspaceName.toLowerCase().includes(queryLower) ||
        log.taskId.toLowerCase().includes(queryLower) ||
        log.taskName.toLowerCase().includes(queryLower);

      if (searchQuery && !searchMatch) return;

      // Apply Workspace Filter
      if (
        selectedWorkspace !== "all" &&
        log.workspaceCode !== selectedWorkspace
      )
        return;

      // Apply Sprint Filter
      if (selectedSprint !== "all" && log.sprintId !== selectedSprint) return;

      // Apply Team Filter
      const task = store.items.find((i) => i.id === log.taskId);
      if (selectedTeam !== "all" && task?.team !== selectedTeam) return;

      // Apply Resource Filter
      if (selectedResource !== "all" && log.userId !== selectedResource) return;

      // Only consider logs in the current week for the week display, but we want cumulative hours too?
      // "Total Time Spent: Display cumulative hours logged against the task"
      // Wait, we should group ALL worklogs matching filters, or only those with entries in the current week?
      // Let's group all matching logs, and then display the week's portion in the Gantt.

      const key = `${log.userId}-${log.taskId}`;
      if (!rowsMap.has(key)) {
        rowsMap.set(key, {
          userId: log.userId,
          user,
          workspaceCode: log.workspaceCode,
          workspaceName: log.workspaceName,
          taskId: log.taskId,
          taskName: log.taskName,
          totalHours: 0,
          weekHours: {}, // dateStr -> hours
        });
      }

      const row = rowsMap.get(key);
      row.totalHours += log.hours;

      if (log.date) {
        const logDate = parseISO(log.date);
        if (isWithinInterval(logDate, { start: weekStart, end: weekEnd })) {
          const dateStr = format(logDate, "yyyy-MM-dd");
          row.weekHours[dateStr] = (row.weekHours[dateStr] || 0) + log.hours;
        }
      }
    });

    let results = Array.from(rowsMap.values());

    // Apply utilization filter based on selected date totals
    // (KPI filters by Selected Day utilization of the user)
    if (utilizationFilter !== "all") {
      results = results.filter((row) => {
        const dailyTotal = dailyUserTotals[row.userId] || 0;
        if (utilizationFilter === "under") return dailyTotal < 8;
        if (utilizationFilter === "full") return dailyTotal === 8;
        if (utilizationFilter === "over") return dailyTotal > 8;
        return true;
      });
    }

    // Sort by User Name Name, then workspace
    results.sort((a, b) => {
      const nameCompare = a.user.name.localeCompare(b.user.name);
      if (nameCompare !== 0) return nameCompare;
      return a.workspaceName.localeCompare(b.workspaceName);
    });

    return results;
  }, [
    rawWorklogs,
    searchQuery,
    selectedWorkspace,
    selectedSprint,
    selectedResource,
    utilizationFilter,
    weekStart,
    weekEnd,
    dailyUserTotals,
  ]);

  const moveDate = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  const setToday = () => {
    setSelectedDate(new Date());
  };

  const handleExport = () => {
    // Generate CSV
    const headers = [
      "Resource",
      "Workspace",
      "Task ID",
      "Task Name",
      "Total Hours",
      ...weekDays.map((d) => format(d, "EEE MM/dd")),
    ];
    const csvRows = [headers.join(",")];

    tableRows.forEach((r) => {
      const row = [
        `"${r.user.name}"`,
        `"${r.workspaceName}"`,
        `"${r.taskId}"`,
        `"${r.taskName.replace(/"/g, '""')}"`,
        r.totalHours,
        ...weekDays.map((d) => r.weekHours[format(d, "yyyy-MM-dd")] || 0),
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `timelog_${format(selectedDate, "yyyy-MM-dd")}.csv`,
    );
    a.click();
  };

  return (
    <AppShell title="Time Log Dashboard">
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Time Log</h1>
              <p className="text-sm text-muted-foreground">
                Timesheet and utilization dashboard across all workspaces.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => moveDate(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex flex-col items-center min-w-[200px] bg-muted/50 rounded-md px-4 py-1.5 border">
                <span className="text-sm font-semibold">
                  {format(selectedDate, "EEEE, MMM d, yyyy")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d")}
                </span>
              </div>
              <Button variant="outline" size="icon" onClick={() => moveDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="secondary" onClick={setToday} className="ml-2">
                Today
              </Button>
            </div>
          </div>

          {/* KPI Dashboard */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card
              className={cn(
                "cursor-pointer hover:border-sidebar-ring transition-colors",
                utilizationFilter === "under" &&
                  "border-yellow-500 ring-1 ring-yellow-500",
              )}
              onClick={() => handleKpiClick("under")}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Underutilized {"(< 8h)"}
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.under}</div>
                <p className="text-xs text-muted-foreground">
                  resources on selected day
                </p>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "cursor-pointer hover:border-sidebar-ring transition-colors",
                utilizationFilter === "full" &&
                  "border-green-500 ring-1 ring-green-500",
              )}
              onClick={() => handleKpiClick("full")}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Fully Utilized {"(= 8h)"}
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.full}</div>
                <p className="text-xs text-muted-foreground">
                  resources on selected day
                </p>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "cursor-pointer hover:border-sidebar-ring transition-colors",
                utilizationFilter === "over" &&
                  "border-red-500 ring-1 ring-red-500",
              )}
              onClick={() => handleKpiClick("over")}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Overutilized {"(> 8h)"}
                </CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.over}</div>
                <p className="text-xs text-muted-foreground">
                  resources on selected day
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Avg & Total Hours
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpis.avg}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    avg
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {kpis.totalLogsToday} total hours on selected day
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2 shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources, workspaces, tasks..."
                className="pl-8 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select
              value={selectedWorkspace}
              onValueChange={setSelectedWorkspace}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Workspace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workspaces</SelectItem>
                {store.workspaces.map((w) => (
                  <SelectItem key={w.code} value={w.code}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSprint} onValueChange={setSelectedSprint}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Sprint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sprints</SelectItem>
                {store.sprints.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.workspaceCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {Array.from(
                  new Set(store.items.map((i) => i.team).filter(Boolean)),
                ).map((t) => (
                  <SelectItem key={t as string} value={t as string}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedResource}
              onValueChange={setSelectedResource}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                {DIRECTORY.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={utilizationFilter}
              onValueChange={setUtilizationFilter}
            >
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="under">Underutilized</SelectItem>
                <SelectItem value="full">Fully Utilized</SelectItem>
                <SelectItem value="over">Overutilized</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 ml-auto"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>

          {/* Resource Summary & Gantt Listing */}
          <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground">
                    <th className="font-medium text-left px-4 py-3 min-w-[200px]">
                      Resource
                    </th>
                    <th className="font-medium text-left px-4 py-3 min-w-[150px]">
                      Workspace & Task
                    </th>
                    <th className="font-medium text-center px-4 py-3 w-24 border-r">
                      Total
                    </th>
                    {weekDays.map((d) => {
                      const isSelected = isSameDay(d, selectedDate);
                      return (
                        <th
                          key={d.toString()}
                          className={cn(
                            "font-medium text-center px-2 py-3 w-16",
                            isSelected && "bg-muted/80 text-foreground",
                          )}
                        >
                          <div className="text-[10px] uppercase">
                            {format(d, "EEE")}
                          </div>
                          <div>{format(d, "d")}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tableRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        No time logs found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    tableRows.map((row) => {
                      return (
                        <tr
                          key={`${row.userId}-${row.taskId}`}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <PersonAvatar userId={row.userId} size="sm" />
                              <div>
                                <div className="font-medium">
                                  {row.user.name}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                                  <span>
                                    Mon:{" "}
                                    {weeklyUserTotals[row.userId]?.[
                                      format(weekDays[0], "yyyy-MM-dd")
                                    ] || 0}
                                    h
                                  </span>
                                  <span>
                                    Tue:{" "}
                                    {weeklyUserTotals[row.userId]?.[
                                      format(weekDays[1], "yyyy-MM-dd")
                                    ] || 0}
                                    h
                                  </span>
                                  <span>
                                    Wed:{" "}
                                    {weeklyUserTotals[row.userId]?.[
                                      format(weekDays[2], "yyyy-MM-dd")
                                    ] || 0}
                                    h
                                  </span>
                                  <span>
                                    Thu:{" "}
                                    {weeklyUserTotals[row.userId]?.[
                                      format(weekDays[3], "yyyy-MM-dd")
                                    ] || 0}
                                    h
                                  </span>
                                  <span>
                                    Fri:{" "}
                                    {weeklyUserTotals[row.userId]?.[
                                      format(weekDays[4], "yyyy-MM-dd")
                                    ] || 0}
                                    h
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td
                            className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => openTask(row.taskId)}
                          >
                            <Badge
                              variant="outline"
                              className="mb-1 text-[10px] uppercase font-semibold"
                            >
                              {row.workspaceName}
                            </Badge>
                            <div className="text-sm">
                              <span className="text-muted-foreground mr-1">
                                {row.taskId}
                              </span>
                              <span className="font-medium text-primary hover:underline">
                                {row.taskName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center border-r font-medium">
                            {row.totalHours}h
                          </td>

                          {/* Week Days Gantt representation */}
                          {weekDays.map((d) => {
                            const dateStr = format(d, "yyyy-MM-dd");
                            const hours = row.weekHours[dateStr] || 0;
                            const isSelected = isSameDay(d, selectedDate);

                            // To color code based on TOTAL user hours for that day
                            const userDayTotal =
                              weeklyUserTotals[row.userId]?.[dateStr] || 0;
                            let indicatorClass = "bg-muted";
                            if (hours > 0) {
                              if (userDayTotal < 8)
                                indicatorClass =
                                  "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
                              else if (userDayTotal === 8)
                                indicatorClass =
                                  "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30";
                              else
                                indicatorClass =
                                  "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30";
                            }

                            return (
                              <td
                                key={dateStr}
                                className={cn(
                                  "px-1 py-3 text-center align-middle",
                                  isSelected && "bg-muted/30",
                                )}
                              >
                                {hours > 0 ? (
                                  <div
                                    className={cn(
                                      "mx-auto flex h-8 w-12 items-center justify-center rounded-md border text-xs font-semibold",
                                      indicatorClass,
                                    )}
                                  >
                                    {hours}h
                                  </div>
                                ) : (
                                  <div className="mx-auto h-8 w-12 rounded-md bg-transparent flex items-center justify-center text-muted-foreground/30 text-xs">
                                    -
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
