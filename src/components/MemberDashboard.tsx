import React, { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Play,
  Target,
  Star,
  Search,
  LogOut,
  ChevronRight,
  MessageSquare,
  History,
  FileText,
  LayoutDashboard,
  Plus,
  ListTodo,
  Calendar,
  UserPlus,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PieChart,
  Pie,
  Cell,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  isToday,
  isThisWeek,
  isThisMonth,
  isPast,
  isFuture,
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  isWithinInterval,
  setYear,
  setMonth,
  setQuarter,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useTaskDetail } from "@/components/task-detail/TaskDetailProvider";
import { useCurrentUser } from "@/hooks/use-current-user";

export function MemberDashboard({ workspaces, store }: any) {
  const navigate = useNavigate();
  const { updateItem } = useWorkspaceStore();
  const { openTask } = useTaskDetail();
  const { myUserId } = useCurrentUser();

  // State for Global Time Filters
  const [selectedYear, setSelectedYear] = useState(() =>
    String(new Date().getFullYear()),
  );
  const [selectedPeriod, setSelectedPeriod] = useState("Current Month");
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const storedYear = localStorage.getItem("dashboard_year");
    const storedPeriod = localStorage.getItem("dashboard_period");
    if (storedYear) setSelectedYear(storedYear);
    if (storedPeriod) setSelectedPeriod(storedPeriod);
  }, []);

  React.useEffect(() => {
    if (isMounted) {
      localStorage.setItem("dashboard_year", selectedYear);
      localStorage.setItem("dashboard_period", selectedPeriod);
    }
  }, [selectedYear, selectedPeriod, isMounted]);

  // State for filters
  const [selectedWorkspace, setSelectedWorkspace] = useState("all");
  const [selectedSprint, setSelectedSprint] = useState("all");

  // State for Log Time Modal
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);
  const [logTaskId, setLogTaskId] = useState("");
  const [logDate, setLogDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [logHours, setLogHours] = useState("");
  const [logDesc, setLogDesc] = useState("");

  const handleLogTime = () => {
    if (!logTaskId || !logDate || !logHours) return;
    const hours = parseFloat(logHours);
    if (isNaN(hours) || hours < 0) return;

    const task = store.items.find((i: any) => i.id === logTaskId);
    if (!task) return;

    const newWorklog = {
      id: Math.random().toString(36).substring(7),
      userId: myUserId,
      date: logDate,
      hours: hours,
      comment: logDesc,
    };

    updateItem(
      logTaskId,
      {
        worklogs: [...(task.worklogs || []), newWorklog],
      },
      myUserId,
    );

    setIsLogTimeOpen(false);
    setLogTaskId("");
    setLogHours("");
    setLogDesc("");
  };

  // Welcome Message Logic
  const [greeting, setGreeting] = useState({
    text: "Welcome, Robin! 👋",
    sub: "You're making great progress. Keep the momentum going.",
  });

  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting({
        text: "Good Morning, Robin! ☀️",
        sub: "Start your day strong. You have tasks due today, keep the momentum going.",
      });
    } else if (hour < 18) {
      setGreeting({
        text: "Good Afternoon, Robin! 🌤️",
        sub: "You're making great progress. Keep the momentum going.",
      });
    } else {
      setGreeting({
        text: "Good Evening, Robin! 🌙",
        sub: "Great work today! Wrap up any remaining tasks to stay on track.",
      });
    }
  }, []);

  // All tasks assigned to me
  const allMyTasks = store.items.filter((i: any) => i.assigneeId === myUserId);

  const isInSelectedPeriod = React.useCallback(
    (dateString: string | undefined | null) => {
      if (!dateString) return false;
      const date = parseISO(dateString);
      const year = parseInt(selectedYear, 10);
      let start, end;

      if (selectedPeriod === "All") {
        start = startOfYear(new Date(year, 0, 1));
        end = endOfYear(new Date(year, 0, 1));
      } else if (selectedPeriod === "Current Month") {
        const currentMonthIndex = new Date().getMonth();
        const refDate = new Date(year, currentMonthIndex, 1);
        start = startOfMonth(refDate);
        end = endOfMonth(refDate);
      } else {
        const qMatch = selectedPeriod.match(/Q(\d)/);
        if (qMatch) {
          const quarter = parseInt(qMatch[1], 10);
          const refDate = setQuarter(new Date(year, 0, 1), quarter);
          start = startOfQuarter(refDate);
          end = endOfQuarter(refDate);
        } else {
          start = startOfYear(new Date(year, 0, 1));
          end = endOfYear(new Date(year, 0, 1));
        }
      }
      return isWithinInterval(date, { start, end });
    },
    [selectedYear, selectedPeriod],
  );

  // Filter tasks based on global filters
  const filteredTasksScope = allMyTasks.filter((t: any) => {
    if (selectedWorkspace !== "all" && t.workspaceCode !== selectedWorkspace)
      return false;
    if (selectedSprint !== "all" && t.sprintId !== selectedSprint) return false;

    // Fallback to createdAt if dueDate is missing?
    // We'll use dueDate or default to true for pending if we want to see it?
    // The prompt says "All widgets, charts, KPIs should dynamically update based on selected period"
    // So we apply time filter. For completed tasks, we check accomplishment, wait we don't have this.
    // Let's check dueDate for pending, or updated time? We don't have these reliably.
    // Let's check dueDate or a mock created date. For now, if it doesn't have a dueDate, it won't show unless we hack it or don't require date.
    // Let's assume if it has no dueDate, we will check if ANY of its worklogs are in period, OR we will just exclude it for time-based views.
    // Actually, usually pending tasks with NO due date are just "always pending" but let's exclude them if they don't fall in the period.
    const dateToCheck = t.dueDate || t.createdAt || new Date().toISOString();
    return isInSelectedPeriod(dateToCheck);
  });

  const pendingTasks = filteredTasksScope.filter(
    (t: any) => t.status !== "Completed" && t.status !== "Closed",
  );

  // Tasks with due dates
  const overdueTasks = pendingTasks.filter(
    (t: any) =>
      t.dueDate && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)),
  );
  const dueTodayTasks = pendingTasks.filter(
    (t: any) => t.dueDate && isToday(parseISO(t.dueDate)),
  );
  const dueThisWeekTasks = pendingTasks.filter(
    (t: any) =>
      t.dueDate &&
      isThisWeek(parseISO(t.dueDate)) &&
      !isPast(parseISO(t.dueDate)),
  );

  const upcomingTasks = pendingTasks.filter(
    (t: any) =>
      t.status === "Todo" ||
      t.status === "To Do" ||
      t.status === "Open" ||
      t.status === "New",
  );

  const activePendingTasks = pendingTasks.filter(
    (t: any) =>
      t.status !== "Todo" &&
      t.status !== "To Do" &&
      t.status !== "Open" &&
      t.status !== "New",
  );

  const completedTasks = filteredTasksScope.filter(
    (t: any) => t.status === "Completed",
  );
  const filteredCompletedTasks = completedTasks; // Now properly filtered by time period since we use filteredTasksScope

  // Recent Activity mock
  const fallbackDate = new Date().toISOString();
  const allActivities = [
    {
      id: 1,
      type: "mention",
      text: "John replied to your comment on BPM-123",
      time: "2h ago",
      isoDate: fallbackDate,
    },
    {
      id: 2,
      type: "assignment",
      text: "Sarah assigned Task BPM-109 to you",
      time: "4h ago",
      isoDate: fallbackDate,
    },
    {
      id: 3,
      type: "status",
      text: "QA Testing moved from In Review to Completed",
      time: "1d ago",
      isoDate: fallbackDate,
    },
  ];
  const activities = allActivities.filter((a) => isInSelectedPeriod(a.isoDate));

  // Donut chart data
  const statusData = [
    {
      name: "To Do",
      value: pendingTasks.filter(
        (t: any) => t.status === "Todo" || t.status === "To Do",
      ).length,
      color: "#9ca3af",
    },
    {
      name: "In Progress",
      value: pendingTasks.filter((t: any) => t.status === "In Progress").length,
      color: "#3b82f6",
    },
    {
      name: "In Review",
      value: pendingTasks.filter((t: any) => t.status === "In Review").length,
      color: "#eab308",
    },
    { name: "Completed", value: completedTasks.length, color: "#22c55e" },
  ].filter((d) => d.value > 0);

  // Priority chart data
  const priorityData = [
    {
      name: "Critical",
      count: pendingTasks.filter((t: any) => t.priority === "highest").length,
    },
    {
      name: "High",
      count: pendingTasks.filter((t: any) => t.priority === "high").length,
    },
    {
      name: "Medium",
      count: pendingTasks.filter((t: any) => t.priority === "medium").length,
    },
    {
      name: "Low",
      count: pendingTasks.filter(
        (t: any) => t.priority === "low" || t.priority === "lowest",
      ).length,
    },
  ];

  // Burndown chart data logic
  // Adjust granularity based on selected period
  const burndownData = React.useMemo(() => {
    // We scale the data based on filteredTasksScope length so it reacts to Workspace filter
    const taskCount = filteredTasksScope.length;
    const maxPlanned =
      taskCount > 0 ? taskCount * 8 : selectedWorkspace === "all" ? 120 : 50; // mock scaling factor

    let baseData = [];
    if (selectedPeriod === "All") {
      baseData = [
        { day: "Jan", progress: 0.08 },
        { day: "Feb", progress: 0.15 },
        { day: "Mar", progress: 0.25 },
        { day: "Apr", progress: 0.33 },
        { day: "May", progress: 0.45 },
        { day: "Jun", progress: 0.58 },
        { day: "Jul", progress: 0.65 },
        { day: "Aug", progress: 0.75 },
        { day: "Sep", progress: 0.85 },
        { day: "Oct", progress: 0.9 },
        { day: "Nov", progress: 0.95 },
        { day: "Dec", progress: 1.0 },
      ];
    } else if (selectedPeriod.startsWith("Q")) {
      baseData = Array.from({ length: 12 }, (_, i) => ({
        day: `Week ${i + 1}`,
        progress: (i + 1) / 12,
      }));
    } else {
      // Current Month
      baseData = [
        { day: "1", progress: 0.1 },
        { day: "5", progress: 0.2 },
        { day: "10", progress: 0.33 },
        { day: "15", progress: 0.5 },
        { day: "20", progress: 0.66 },
        { day: "25", progress: 0.83 },
        { day: "30", progress: 1.0 },
      ];
    }

    return baseData.map((d, index) => {
      // Create a descending planned line
      const planned = Math.max(0, Math.round(maxPlanned * (1 - d.progress)));
      // Actual wanders slightly around planned
      const actual = Math.max(0, Math.round(planned + (Math.random() * 8 - 2)));
      return { day: d.day, planned, actual };
    });
  }, [
    selectedPeriod,
    selectedYear,
    selectedWorkspace,
    filteredTasksScope.length,
  ]);

  const recentLogs = allMyTasks
    .flatMap((t: any) =>
      (t.worklogs || [])
        .filter((w: any) => w.userId === myUserId)
        .map((w: any) => ({ ...w, taskTitle: t.title })),
    )
    .sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .slice(0, 5);

  const myDependencyRisks = store.items.flatMap((t: any) =>
    (t.dependencyRisks || [])
      .filter((dr: any) => dr.ownerIds?.includes(myUserId))
      .filter((dr: any) =>
        isInSelectedPeriod(dr.loggedDate || new Date().toISOString()),
      )
      .map((dr: any) => ({
        ...dr,
        taskId: t.id,
        taskTitle: t.title,
        workspaceCode: t.workspaceCode,
      })),
  );

  const riskData = [
    {
      name: "Open",
      count: myDependencyRisks.filter(
        (dr: any) => dr.type === "Risk" && dr.status === "Open",
      ).length,
    },
    {
      name: "In Progress",
      count: myDependencyRisks.filter(
        (dr: any) => dr.type === "Risk" && dr.status === "In Progress",
      ).length,
    },
    {
      name: "Closed",
      count: myDependencyRisks.filter(
        (dr: any) => dr.type === "Risk" && dr.status === "Closed",
      ).length,
    },
  ];

  const depData = [
    {
      name: "Open",
      count: myDependencyRisks.filter(
        (dr: any) => dr.type === "Dependency" && dr.status === "Open",
      ).length,
    },
    {
      name: "In Progress",
      count: myDependencyRisks.filter(
        (dr: any) => dr.type === "Dependency" && dr.status === "In Progress",
      ).length,
    },
    {
      name: "Closed",
      count: myDependencyRisks.filter(
        (dr: any) => dr.type === "Dependency" && dr.status === "Closed",
      ).length,
    },
  ];

  return (
    <AppShell title="My Dashboard">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8 space-y-8 pb-32">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {greeting.text}
            </h1>
            <p className="text-muted-foreground">{greeting.sub}</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Current Month">Current Month</SelectItem>
                <SelectItem value="Q1">Q1</SelectItem>
                <SelectItem value="Q2">Q2</SelectItem>
                <SelectItem value="Q3">Q3</SelectItem>
                <SelectItem value="Q4">Q4</SelectItem>
                <SelectItem value="All">All</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedWorkspace}
              onValueChange={setSelectedWorkspace}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Workspace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workspaces</SelectItem>
                {workspaces.map((w: any) => (
                  <SelectItem key={w.code} value={w.code}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isLogTimeOpen} onOpenChange={setIsLogTimeOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Clock className="w-4 h-4" /> Log Time
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Time</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Task</label>
                    <Select value={logTaskId} onValueChange={setLogTaskId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select active task" />
                      </SelectTrigger>
                      <SelectContent>
                        {pendingTasks.map((t: any) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.id} - {t.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        type="date"
                        value={logDate}
                        onChange={(e) => setLogDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hours</label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={logHours}
                        onChange={(e) => setLogHours(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={logDesc}
                      onChange={(e) => setLogDesc(e.target.value)}
                      placeholder="What did you work on?"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleLogTime}>Save Worklog</Button>
                </DialogFooter>

                {recentLogs.length > 0 && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">Recent Logs</h4>
                    <div className="space-y-2">
                      {recentLogs.map((log: any) => (
                        <div
                          key={log.id}
                          className="flex justify-between items-center text-sm p-2 rounded bg-muted/50"
                        >
                          <div>
                            <span className="font-medium mr-2">
                              {format(parseISO(log.date), "MMM d")}
                            </span>
                            <span className="text-muted-foreground truncate max-w-[150px] inline-block align-bottom">
                              {log.taskTitle}
                            </span>
                          </div>
                          <span className="font-medium">{log.hours}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            className="p-4 transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between"
            onClick={() => navigate({ to: "/" })}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  My All Tasks
                </p>
                <h3 className="text-2xl font-bold text-foreground">
                  {allMyTasks.length}
                </h3>
              </div>
              <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <ListTodo className="h-4 w-4" />
              </div>
            </div>
          </Card>

          <Card
            className="p-4 transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between"
            onClick={() => {}}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  My Pending
                </p>
                <h3 className="text-2xl font-bold text-foreground">
                  {pendingTasks.length}
                </h3>
              </div>
              <div className="h-8 w-8 shrink-0 rounded-full bg-info/10 flex items-center justify-center text-info group-hover:scale-110 transition-transform">
                <Target className="h-4 w-4" />
              </div>
            </div>
          </Card>

          <Card
            className="p-4 transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between"
            onClick={() => {}}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  My Overdue
                </p>
                <h3 className="text-2xl font-bold text-destructive">
                  {overdueTasks.length}
                </h3>
              </div>
              <div className="h-8 w-8 shrink-0 rounded-full bg-destructive/10 flex items-center justify-center text-destructive group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
          </Card>

          <Card className="p-4 transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  My Completed
                </p>
                <h3 className="text-2xl font-bold text-success">
                  {filteredCompletedTasks.length}
                </h3>
              </div>
              <div className="h-8 w-8 shrink-0 rounded-full bg-success/10 flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
          </Card>
        </div>

        {/* Widgets Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Tasks lists */}
          <Card className="lg:col-span-2 p-4 flex flex-col h-[300px]">
            <Tabs
              defaultValue="pending"
              className="flex-1 flex flex-col min-h-0 pb-2"
            >
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 uppercase tracking-wider">
                  <ListTodo className="h-4 w-4 text-primary" />
                  My Tasks
                </h3>
                <TabsList className="h-8">
                  <TabsTrigger value="upcoming" className="text-xs px-2">
                    Upcoming
                  </TabsTrigger>
                  <TabsTrigger value="due-today" className="text-xs px-2">
                    Due Today
                  </TabsTrigger>
                  <TabsTrigger value="due-this-week" className="text-xs px-2">
                    Due This Week
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs px-2">
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs px-2">
                    Completed
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar min-h-0 pb-2">
                <TabsContent
                  value="upcoming"
                  className="m-0 space-y-2 outline-none"
                >
                  {upcomingTasks.map((t: any) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      openTask={openTask}
                      store={store}
                    />
                  ))}
                  {upcomingTasks.length === 0 && (
                    <EmptyState
                      message={
                        pendingTasks.length === 0
                          ? "You don't have any pending tasks to work on. Connect with your manager."
                          : "No upcoming tasks"
                      }
                    />
                  )}
                </TabsContent>
                <TabsContent
                  value="due-today"
                  className="m-0 space-y-2 outline-none"
                >
                  {dueTodayTasks.map((t: any) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      openTask={openTask}
                      store={store}
                    />
                  ))}
                  {dueTodayTasks.length === 0 && (
                    <EmptyState
                      message={
                        pendingTasks.length === 0
                          ? "You don't have any pending tasks to work on. Connect with your manager."
                          : "Clear for today!"
                      }
                    />
                  )}
                </TabsContent>
                <TabsContent
                  value="due-this-week"
                  className="m-0 space-y-2 outline-none"
                >
                  {dueThisWeekTasks.map((t: any) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      openTask={openTask}
                      store={store}
                    />
                  ))}
                  {dueThisWeekTasks.length === 0 && (
                    <EmptyState
                      message={
                        pendingTasks.length === 0
                          ? "You don't have any pending tasks to work on. Connect with your manager."
                          : "Nothing due this week."
                      }
                    />
                  )}
                </TabsContent>
                <TabsContent
                  value="pending"
                  className="m-0 space-y-2 outline-none"
                >
                  {activePendingTasks.map((t: any) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      openTask={openTask}
                      store={store}
                    />
                  ))}
                  {activePendingTasks.length === 0 && (
                    <EmptyState
                      message={
                        pendingTasks.length === 0
                          ? "You don't have any pending tasks to work on. Connect with your manager."
                          : "No pending tasks"
                      }
                    />
                  )}
                </TabsContent>
                <TabsContent
                  value="completed"
                  className="m-0 space-y-2 outline-none"
                >
                  {completedTasks.map((t: any) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      openTask={openTask}
                      store={store}
                    />
                  ))}
                  {completedTasks.length === 0 && (
                    <EmptyState message="No completed tasks" />
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </Card>

          {/* Recent Activity */}
          <Card className="p-4 flex flex-col h-[300px]">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
              Recent Activity
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {activities.map((a) => (
                <div key={a.id} className="flex gap-3 text-sm">
                  <div className="mt-0.5 shrink-0">
                    {a.type === "mention" && (
                      <MessageSquare className="w-4 h-4 text-info" />
                    )}
                    {a.type === "assignment" && (
                      <UserPlus className="w-4 h-4 text-primary" />
                    )}
                    {a.type === "status" && (
                      <Activity className="w-4 h-4 text-warning" />
                    )}
                  </div>
                  <div>
                    <p className="text-foreground leading-snug">{a.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.time}
                    </p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <EmptyState message="No recent activity" />
              )}
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-4 h-[260px] flex flex-col">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
              Task Distribution
            </h3>
            <div className="flex-1">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend
                      verticalAlign="bottom"
                      height={24}
                      iconSize={8}
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No data" />
              )}
            </div>
          </Card>

          <Card className="p-4 h-[260px] flex flex-col">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
              Priority (Pending)
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart
                  data={priorityData}
                  layout="vertical"
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip cursor={{ fill: "transparent" }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                    {priorityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "Critical"
                            ? "#ef4444"
                            : entry.name === "High"
                              ? "#f97316"
                              : entry.name === "Medium"
                                ? "#eab308"
                                : "#3b82f6"
                        }
                      />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card
            className="p-4 h-[260px] flex flex-col cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate({ to: "/" })}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
              Risk by Status
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart
                  data={riskData}
                  margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <RechartsTooltip cursor={{ fill: "transparent" }} />
                  <Bar
                    dataKey="count"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card
            className="p-4 h-[260px] flex flex-col cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate({ to: "/" })}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
              Dependencies by Status
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart
                  data={depData}
                  margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <RechartsTooltip cursor={{ fill: "transparent" }} />
                  <Bar
                    dataKey="count"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3 p-4 h-[280px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Personal Burndown (Hours)
              </h3>
            </div>

            <div className="flex-1 flex gap-6">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={burndownData}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Line
                      type="monotone"
                      dataKey="planned"
                      stroke="#9ca3af"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Planned"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Actual"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[150px] hidden sm:flex flex-col justify-between py-1 border-l pl-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Avg Velocity
                  </p>
                  <p className="text-lg font-bold">24 SP</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Completion Trend
                  </p>
                  <p className="text-lg font-bold text-success flex items-center">
                    ↑ 18%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Planned vs Dev
                  </p>
                  <p className="text-sm font-bold">40 / 38 SP</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Avg Logged
                  </p>
                  <p className="text-sm font-bold">
                    6.8 <span className="text-xs font-normal">h/day</span>
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 h-[280px] flex flex-col items-center justify-center text-center bg-primary/5 border-primary/20">
            <Sparkles className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">
              Great Work!
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You've completed{" "}
              <strong className="text-foreground">
                {filteredCompletedTasks.length} tasks
              </strong>{" "}
              so far. Your average completion time improved by{" "}
              <strong className="text-foreground">12%</strong>. Keep it up!
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Sparkles(props: any) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function TaskCard({ task, openTask, store }: any) {
  const workspace = store?.workspaces?.find(
    (w: any) => w.code === task.workspaceCode,
  );
  const isTaskOverdue =
    task.dueDate &&
    isPast(parseISO(task.dueDate)) &&
    !isToday(parseISO(task.dueDate));

  return (
    <div
      className="group p-3 sm:p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-muted/30 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md"
      onClick={() => openTask(task.id)}
    >
      <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-lg bg-muted/60 border border-border flex flex-col items-center justify-center font-mono shrink-0 shadow-sm">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-none mb-0.5">
            {task.workspaceCode}
          </span>
          <span className="text-sm font-bold text-foreground leading-none">
            {task.id.split("-")[1] || task.id}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h4
            className="font-semibold text-sm text-foreground line-clamp-1 mb-0.5"
            title={task.title}
          >
            {task.title}
          </h4>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider",
                task.priority === "highest" || task.priority === "high"
                  ? "bg-destructive/10 text-destructive"
                  : task.priority === "medium"
                    ? "bg-warning/10 text-warning"
                    : "bg-muted text-muted-foreground",
              )}
              title="Priority"
            >
              {task.priority || "none"}
            </span>
            <p className="text-xs text-muted-foreground truncate">
              {workspace?.name || task.workspaceCode}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:ml-4 shrink-0 justify-between sm:justify-end w-full sm:w-auto">
        <div className="flex flex-row sm:flex-col sm:items-end items-center gap-2 sm:gap-1.5 w-full sm:w-auto">
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border",
              task.status === "Todo" || task.status === "To Do"
                ? "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                : task.status === "In Progress"
                  ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800"
                  : task.status === "In Review"
                    ? "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/40 dark:text-fuchsia-300 dark:border-fuchsia-800"
                    : "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
            )}
          >
            {task.status}
          </span>
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Calendar
              className={cn(
                "w-3.5 h-3.5 shrink-0 opacity-70",
                isTaskOverdue && "text-destructive opacity-100",
              )}
            />
            <span className={cn(isTaskOverdue && "text-destructive font-bold")}>
              {task.dueDate
                ? format(parseISO(task.dueDate), "MMM d")
                : "No date"}
            </span>
            {isTaskOverdue && (
              <span className="text-destructive font-bold uppercase text-[10px] ml-1 bg-destructive/10 px-1 rounded">
                Overdue
              </span>
            )}
          </span>
        </div>
        <div className="hidden sm:flex items-center justify-center p-1 rounded hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 text-primary">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-full flex items-center justify-center flex-col text-muted-foreground p-8">
      <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
