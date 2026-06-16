import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState, useRef, useEffect } from "react";
import {
  useWorkspaceStore,
  type Workspace,
  type BacklogItem,
  type Sprint,
} from "@/lib/workspace-store";
import { PMDashboard } from "@/components/PMDashboard";
import { MemberDashboard } from "@/components/MemberDashboard";
import { PortfolioDashboard } from "@/components/PortfolioDashboard";
import {
  Clock,
  MapIcon,
  BarChart2,
  Layers,
  Zap,
  BookOpen,
  CheckSquare,
  Bug,
  Repeat,
  CalendarRange,
  Gauge,
  LineChart,
  PresentationIcon,
  MessageSquare,
  Target,
  ClipboardCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — Beinex Project Mate" },
      {
        name: "description",
        content:
          "Manage projects, collaborate efficiently, and deliver value through Agile practices.",
      },
    ],
  }),
  component: HomePage,
});

interface ConceptCard {
  icon: typeof Layers;
  title: string;
  description: string;
  tone: "primary" | "info" | "success" | "warning" | "destructive" | "accent";
}

const ISSUE_TYPES: ConceptCard[] = [
  {
    icon: Layers,
    title: "Epic",
    description:
      "A large body of work that can be broken into multiple stories and features.",
    tone: "accent",
  },
  {
    icon: Zap,
    title: "Feature",
    description:
      "A major capability delivered to users, grouping related stories together.",
    tone: "primary",
  },
  {
    icon: BookOpen,
    title: "User Story",
    description:
      "A requirement written from the user's perspective — focused on value.",
    tone: "info",
  },
  {
    icon: CheckSquare,
    title: "Task",
    description:
      "A unit of work assigned to team members to move a story forward.",
    tone: "success",
  },
  {
    icon: Bug,
    title: "Bug",
    description:
      "An issue requiring correction — tracked and prioritized like other work.",
    tone: "destructive",
  },
];

const SPRINT_CONCEPTS: ConceptCard[] = [
  {
    icon: Repeat,
    title: "Sprint",
    description:
      "A fixed time-box where the team completes a planned set of work.",
    tone: "primary",
  },
  {
    icon: CalendarRange,
    title: "Sprint Planning",
    description:
      "A meeting where the team decides the scope and goal of the sprint.",
    tone: "info",
  },
  {
    icon: Gauge,
    title: "Sprint Velocity",
    description:
      "The amount of work, in story points, completed during a sprint.",
    tone: "success",
  },
  {
    icon: LineChart,
    title: "Sprint Burndown",
    description:
      "A chart showing work remaining vs. time — a pulse of the sprint.",
    tone: "warning",
  },
  {
    icon: PresentationIcon,
    title: "Sprint Review",
    description:
      "Demonstration of completed work to stakeholders at sprint end.",
    tone: "accent",
  },
  {
    icon: MessageSquare,
    title: "Sprint Retrospective",
    description: "The team reflects on the sprint and identifies improvements.",
    tone: "info",
  },
];

const QUALITY_CONCEPTS: ConceptCard[] = [
  {
    icon: Target,
    title: "Story Points",
    description:
      "A relative estimate of effort — capturing complexity, risk, and uncertainty.",
    tone: "primary",
  },
  {
    icon: ClipboardCheck,
    title: "Definition of Ready",
    description:
      "Shared criteria that a backlog item must meet before the team starts work.",
    tone: "warning",
  },
  {
    icon: CheckCircle2,
    title: "Definition of Done",
    description:
      "Shared criteria that work must meet to be considered complete and shippable.",
    tone: "success",
  },
];

function toneClasses(tone: ConceptCard["tone"]) {
  const map: Record<ConceptCard["tone"], string> = {
    primary: "bg-primary/10 text-primary",
    info: "bg-info/10 text-info",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/10 text-destructive",
    accent: "bg-accent text-accent-foreground",
  };
  return map[tone];
}

function ConceptGrid({ items }: { items: ConceptCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ icon: Icon, title, description, tone }) => (
        <div
          key={title}
          className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <div
            className={cn(
               "inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4",
              toneClasses(tone),
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1.5">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
          <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ))}
    </div>
  );
}

import { useCurrentUser } from "@/hooks/use-current-user";

function HomePage() {
  const navigate = useNavigate();
  const { store } = useWorkspaceStore();
  const workspaces = store.workspaces;
  const [highlightTour, setHighlightTour] = useState(false);
  const { role: userRole, myUserId, isPortfolioManager } = useCurrentUser();

  const handleTourClick = () => {
    const el = document.getElementById("work-hierarchy");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlightTour(true);
      setTimeout(() => setHighlightTour(false), 2000);
    }
  };

  const filteredWorkspaces = workspaces.filter((w: Workspace) => {
    if (isPortfolioManager || userRole === "Admin User") return true;
    return w.ownerIds.includes(myUserId) || w.memberIds.includes(myUserId);
  });

  const hasWorkspaces = filteredWorkspaces && filteredWorkspaces.length > 0;
  const recentWorkspace = hasWorkspaces ? filteredWorkspaces[0] : null;

  const safeStore = store || { items: [], sprints: [] };

  if (userRole === "Admin User") {
    return <AdminDashboard workspaces={filteredWorkspaces} store={safeStore} />;
  }
  if (userRole === "Portfolio Manager") {
    return (
      <PortfolioDashboard workspaces={filteredWorkspaces} store={safeStore} />
    );
  }
  if (userRole === "Project Manager") {
    return <PMDashboard workspaces={filteredWorkspaces} store={safeStore} />;
  }
  return <MemberDashboard workspaces={filteredWorkspaces} store={safeStore} />;
}

function AdminDashboard({
  workspaces,
  store,
}: {
  workspaces: Workspace[];
  store: { items: BacklogItem[]; sprints: Sprint[] };
}) {
  return (
    <AppShell title="Admin Dashboard">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8 lg:py-10 space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Admin Overlook
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 glass rounded-2xl border border-border shadow-glass">
            <h3 className="text-lg font-medium">Total Workspaces</h3>
            <p className="text-4xl font-bold text-primary mt-2">
              {workspaces.length}
            </p>
          </div>
          <div className="p-6 glass rounded-2xl border border-border shadow-glass">
            <h3 className="text-lg font-medium">Total Sprints</h3>
            <p className="text-4xl font-bold text-info mt-2">
              {store.sprints?.length || 0}
            </p>
          </div>
          <div className="p-6 glass rounded-2xl border border-border shadow-glass">
            <h3 className="text-lg font-medium">Total Active Users</h3>
            <p className="text-4xl font-bold text-success mt-2">12</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Database Status</span>
              <span className="text-success font-medium">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Next Backup Setup</span>
              <span className="text-muted-foreground font-medium">
                2 hours ago
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Section({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          {eyebrow}
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function SprintFlowDiagram() {
  const steps = [
    { label: "Backlog", tone: "bg-muted text-foreground" },
    { label: "Sprint Planning", tone: "bg-info/15 text-info" },
    { label: "In Progress", tone: "bg-primary/15 text-primary" },
    { label: "Review", tone: "bg-warning/20 text-warning" },
    { label: "Done", tone: "bg-success/15 text-success" },
  ];
  return (
    <div className="glass rounded-2xl p-6 shadow-glass">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sprint flow
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            The Agile loop
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Continuous delivery
        </div>
      </div>

      <div className="space-y-2.5">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border text-[11px] font-semibold text-foreground">
              {i + 1}
            </div>
            <div
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-xs font-medium",
                step.tone,
              )}
            >
              {step.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <Stat label="Velocity" value="42 pts" />
        <Stat label="Stories" value="18" />
        <Stat label="Health" value="On track" tone="success" />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <div className="rounded-lg bg-background/60 p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-semibold mt-0.5",
          tone === "success" ? "text-success" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}
