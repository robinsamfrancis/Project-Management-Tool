import { useState, useEffect } from "react";
import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
  useNavigate,
} from "@tanstack/react-router";
import {
  Activity,
  CalendarRange,
  Edit3,
  KanbanSquare,
  Layers,
  Map as MapIcon,
  Plus,
  UserPlus,
  Users2,
  History as HistoryIcon,
  FolderClosed,
  LayoutDashboard,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertOctagon,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { AvatarStack } from "@/components/PersonAvatar";
import { useWorkspace, useWorkspaceStore } from "@/lib/workspace-store";
import { cn } from "@/lib/utils";
import { EditWorkspaceForm } from "@/components/EditWorkspaceForm";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/workspaces/$code")({
  validateSearch: (search: Record<string, unknown>): { edit?: boolean } => {
    return {
      edit: search.edit === true || search.edit === "true" ? true : undefined,
    };
  },
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  const { code } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const workspace = useWorkspace(code);
  const { store, loading } = useWorkspaceStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isEditing, setIsEditing] = useState(search.edit || false);
  const { role: userRole, myUserId, isPortfolioManager } = useCurrentUser();

  useEffect(() => {
    setIsEditing(search.edit || false);
  }, [search.edit]);

  const handleSetIsEditing = (editing: boolean) => {
    setIsEditing(editing);
    navigate({
      search: { edit: editing ? true : undefined } as any,
      replace: true,
    });
  };

  if (loading) {
    return (
      <AppShell title="Workspace">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (!workspace) {
    return (
      <AppShell title="Workspace">
        <div className="mx-auto w-full max-w-3xl p-8">
          <EmptyState
            icon={Layers}
            title="Workspace not found"
            description={`We couldn't find a workspace with code "${code}". It may have been deleted.`}
            actionLabel="Create a workspace"
            onAction={() => (window.location.href = "/workspaces/new")}
          />
        </div>
      </AppShell>
    );
  }

  if (isEditing) {
    return (
      <AppShell title={workspace.name}>
        <EditWorkspaceForm
          workspace={workspace}
          onCancel={() => handleSetIsEditing(false)}
          onSaveSuccess={() => handleSetIsEditing(false)}
        />
      </AppShell>
    );
  }

  const isProjectMember =
    !isPortfolioManager &&
    userRole !== "Admin User" &&
    !workspace.ownerIds.includes(myUserId);

  const items = store.items.filter((i) => i.workspaceCode === code);
  const sprints = store.sprints.filter((s) => s.workspaceCode === code);
  const activeSprint = sprints.find((s) => s.state === "active");

  // Member Specific Items for metrics
  // (Leftover myItems for the dashboard only, but KPI calculations now use global `items`)
  const myItems = isProjectMember
    ? items.filter((i) => i.assigneeId === myUserId)
    : items;

  // 1. Project Completion %
  const projectItems = items.filter(
    (i) =>
      (i.type.toLowerCase() === "task" || i.type.toLowerCase() === "feature") &&
      !i.parentId,
  );
  const doneProjectItems = projectItems.filter((i) => i.status === "Completed");
  const completion = projectItems.length
    ? Math.round((doneProjectItems.length / projectItems.length) * 100)
    : 0;

  let expectedProgress = 0;
  if (workspace.startDate && workspace.endDate) {
    const start = new Date(workspace.startDate).getTime();
    const end = new Date(workspace.endDate).getTime();
    const now = new Date().getTime();
    if (now >= end) {
      expectedProgress = 100;
    } else if (now <= start) {
      expectedProgress = 0;
    } else {
      expectedProgress = Math.round(((now - start) / (end - start)) * 100);
    }
  }

  let health: {
    label: string;
    tone: "success" | "warning" | "destructive" | "neutral";
  } = {
    label: "🟢 On Track",
    tone: "success",
  };
  if (completion < expectedProgress - 10) {
    health = { label: "🔴 Off Track", tone: "destructive" };
  } else if (completion < expectedProgress) {
    health = { label: "🟠 At Risk", tone: "warning" };
  } else {
    health = { label: "🟢 On Track", tone: "success" };
  }

  // KPI Calculations
  const dependencyRisks = items.flatMap((i) => i.dependencyRisks || []);
  const openDependencies = dependencyRisks.filter(
    (dr) =>
      dr.type === "Dependency" &&
      (dr.status === "Open" || dr.status === "In Progress"),
  ).length;
  const openRisks = dependencyRisks.filter(
    (dr) =>
      dr.type === "Risk" &&
      (dr.status === "Open" || dr.status === "In Progress"),
  ).length;

  let remainingDays: number | null = null;
  let sprintEndDateFormatted = "No active sprint";
  if (activeSprint?.endDate) {
    const end = new Date(activeSprint.endDate);
    const endDiff = Math.ceil(
      (end.getTime() - new Date().getTime()) / (1000 * 3600 * 24),
    );
    remainingDays = endDiff >= 0 ? endDiff : 0;
    sprintEndDateFormatted = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  const completedSprints = sprints
    .filter((s) => s.state === "completed")
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

  const velocityDataAll = completedSprints.map((s) => {
    return items
      .filter((i) => i.sprintId === s.id && i.status === "Completed")
      .reduce((sum, i) => sum + (i.points || 0), 0);
  });

  const avgVelocity = velocityDataAll.length
    ? Math.round(
        velocityDataAll.reduce((a, b) => a + b, 0) / velocityDataAll.length,
      )
    : 0;

  let velocityTrend = 0;
  if (velocityDataAll.length > 1) {
    const latestSprintVelocity = velocityDataAll[velocityDataAll.length - 1];
    const previousSprintVelocity = velocityDataAll[velocityDataAll.length - 2];
    if (previousSprintVelocity > 0) {
      velocityTrend = Math.round(
        ((latestSprintVelocity - previousSprintVelocity) /
          previousSprintVelocity) *
          100,
      );
    } else if (latestSprintVelocity > 0) {
      velocityTrend = 100;
    }
  }

  const tabs = [
    {
      to: `/workspaces/${code}/dashboard`,
      label: isProjectMember ? "My Dashboard" : "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: `/workspaces/${code}/backlog`,
      label: "Backlog & Sprint",
      icon: Layers,
    },
    {
      to: `/workspaces/${code}/board`,
      label: "Kanban Board",
      icon: KanbanSquare,
    },
    ...(isProjectMember
      ? []
      : [
          {
            to: `/workspaces/${code}/team`,
            label: "Workload Distribution",
            icon: Users2,
          },
        ]),
    {
      to: `/workspaces/${code}/documents`,
      label: "Documents",
      icon: FolderClosed,
    },
    ...(isProjectMember
      ? []
      : [
          {
            to: `/workspaces/${code}/retrospective`,
            label: "Retrospective",
            icon: HistoryIcon,
          },
        ]),
    {
      to: `/workspaces/${code}/risks`,
      label: "Dependencies / Risk",
      icon: AlertTriangle,
    },
    ...(isProjectMember
      ? []
      : [
          {
            to: `/workspaces/${code}/roadmap`,
            label: "Roadmap",
            icon: MapIcon,
          },
        ]),
  ];

  return (
    <AppShell title={workspace.name}>
      {/* Header */}
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 pt-6 pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground font-bold text-sm shadow-glow shrink-0">
                  {workspace.code.slice(0, 2)}
                </div>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                    {workspace.name}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-2 text-xs text-muted-foreground">
                    <span className="font-mono font-semibold">
                      {workspace.code}
                    </span>
                    <span>·</span>
                    <span className="capitalize">{workspace.type}</span>
                    {workspace.parentCode && (
                      <>
                        <span>·</span>
                        <span>Parent: {workspace.parentCode}</span>
                      </>
                    )}
                    <span>·</span>
                    <div className="flex items-center gap-1.5">
                      <span className="opacity-75">Owner:</span>
                      {workspace.ownerIds.length > 0 ? (
                        <AvatarStack userIds={workspace.ownerIds} />
                      ) : (
                        "—"
                      )}
                    </div>
                    <span>·</span>
                    <div className="flex items-center gap-1.5">
                      <span className="opacity-75">Members:</span>
                      {workspace.memberIds.length > 0 ? (
                        <AvatarStack userIds={workspace.memberIds} />
                      ) : (
                        "—"
                      )}
                    </div>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      <span className="opacity-75">Sprint:</span>
                      <span className="font-medium text-foreground">
                        {activeSprint ? activeSprint.name : "None"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-1">
                {!isProjectMember && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 text-xs"
                    onClick={() => handleSetIsEditing(true)}
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatCard
                title="Project Completion %"
                icon={Activity}
                value={`${completion}%`}
                badge={{ label: health.label, tone: health.tone }}
              >
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-2 mb-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-primary"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </StatCard>
              <StatCard
                title="Days Remaining"
                icon={Clock}
                value={remainingDays !== null ? String(remainingDays) : "-"}
                description={sprintEndDateFormatted}
              />
              <StatCard
                title="Sprint Velocity"
                icon={TrendingUp}
                value={`${avgVelocity} SP`}
                trend={velocityTrend}
                trendLabel="vs previous sprint"
              />
              <StatCard
                title="Open Dependencies"
                icon={ArrowRight}
                value={String(openDependencies)}
                tone={openDependencies > 0 ? "warning" : "success"}
                description="Total open dependencies"
              />
              <StatCard
                title="Open Risks"
                icon={AlertOctagon}
                value={String(openRisks)}
                tone={openRisks > 0 ? "destructive" : "success"}
                description="Total open risks"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex items-center gap-1 border-b border-border -mb-px">
            {tabs.map((t) => {
              const active =
                pathname === t.to || pathname.startsWith(t.to + "/");
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <Outlet />
    </AppShell>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  description,
  tone = "neutral",
  children,
  badge,
}: {
  title: string;
  value?: React.ReactNode;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  description?: string;
  tone?: "neutral" | "success" | "warning" | "destructive";
  children?: React.ReactNode;
  badge?: {
    label: string;
    tone: "success" | "warning" | "destructive" | "neutral";
  };
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-3 shadow-sm w-full">
      <div className="flex items-center justify-between gap-1.5 mb-1.5 text-muted-foreground">
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          {title}
        </span>
        <Icon className="h-3.5 w-3.5" />
      </div>
      {(value !== undefined || trend !== undefined || badge) && (
        <div className="flex items-center flex-wrap gap-2 mb-1 min-h-[24px]">
          {value !== undefined && (
            <div
              className={cn(
                "text-lg font-bold tracking-tight text-foreground",
                tone === "success" && "text-emerald-500",
                tone === "destructive" && "text-red-500",
                tone === "warning" && "text-amber-500",
              )}
            >
              {value}
            </div>
          )}
          {badge && (
            <Badge
              variant="secondary"
              className={cn(
                "px-1.5 py-0 text-[10px] h-5",
                badge.tone === "success" &&
                  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                badge.tone === "warning" &&
                  "bg-amber-500/20 text-amber-600 dark:text-amber-400",
                badge.tone === "destructive" &&
                  "bg-red-500/15 text-red-600 dark:text-red-400",
              )}
            >
              {badge.label}
            </Badge>
          )}
          {trend !== undefined && (
            <span
              className={cn(
                "text-[11px] font-medium flex items-center gap-0.5",
                trend >= 0 ? "text-emerald-500" : "text-red-500",
              )}
            >
              {trend > 0 && <TrendingUp className="h-3 w-3" />}
              {trend < 0 && <TrendingDown className="h-3 w-3" />}
              {trend === 0 && (
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
              )}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      )}
      {children}
      {(trendLabel || description) && (
        <p className="text-[10px] text-muted-foreground mt-auto pt-1 leading-tight">
          {trendLabel || description}
        </p>
      )}
    </div>
  );
}
