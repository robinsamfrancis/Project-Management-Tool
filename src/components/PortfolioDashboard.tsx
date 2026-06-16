import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useCurrentUser } from "@/hooks/use-current-user";
import { DIRECTORY, type Workspace, type BacklogItem, type Sprint } from "@/lib/workspace-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, AlertTriangle, Briefcase, Calendar, CheckCircle2, Filter, Layers, Layout, Target, TrendingDown, TrendingUp, Users } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from "recharts";

import { PortfolioProjectHealthOverview } from "./portfolio/PortfolioProjectHealthOverview";
import { RisksDependenciesCenter } from "./portfolio/RisksDependenciesCenter";
import { ResourceManagement } from "./portfolio/ResourceManagement";
import { ProjectDeliveryConfidence } from "./portfolio/ProjectDeliveryConfidence";
import { UpcomingMilestones, RecentPortfolioActivity } from "./portfolio/PortfolioActivities";

const COLORS = ["#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6"];

export function PortfolioDashboard({
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
  const [filterOwner, setFilterOwner] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCustomer, setFilterCustomer] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterTimeRange, setFilterTimeRange] = useState<string>("all");

  const today = new Date().toISOString().split("T")[0];

  // Calculate project health based on dates
  const projectMetrics = workspaces.map(w => {
    const wItems = store.items.filter((i) => i.workspaceCode === w.code);
    const pItems = wItems.filter((i) => (i.type.toLowerCase() === "task" || i.type.toLowerCase() === "feature") && !i.parentId);
    const completedCount = pItems.filter((i) => i.status === "Completed").length;
    const cPct = pItems.length > 0 ? Math.round((completedCount / pItems.length) * 100) : 0;
    
    let expProg = 0;
    let daysRemaining = 0;
    
    if (w.startDate && w.endDate) {
      const sDate = new Date(w.startDate).getTime();
      const eDate = new Date(w.endDate).getTime();
      const nDate = new Date().getTime();
      if (nDate >= eDate) expProg = 100;
      else if (nDate <= sDate) expProg = 0;
      else expProg = Math.round(((nDate - sDate) / (eDate - sDate)) * 100);
      daysRemaining = Math.max(0, Math.ceil((eDate - nDate) / (1000 * 60 * 60 * 24)));
    } else {
        daysRemaining = 30; // default for demo
    }

    let healthCode = "on_track";
    let healthLabel = "On Track";
    if (cPct < expProg - 15) { healthCode = "off_track"; healthLabel = "Off Track"; }
    else if (cPct < expProg) { healthCode = "at_risk"; healthLabel = "At Risk"; }

    const openRisks = wItems.flatMap((i) => i.dependencyRisks || []).filter(dr => dr.type === "Risk" && dr.status === "Open");
    const openDependencies = wItems.flatMap((i) => i.dependencyRisks || []).filter(dr => dr.type === "Dependency" && dr.status === "Open");

    const totalLoggedHours = wItems.reduce((acc, currentItem) => acc + (currentItem.worklogs || []).reduce((sum, wl) => sum + wl.hours, 0), 0);
    const initialEstimate = wItems.reduce((acc, currentItem) => acc + (currentItem.estimateHours || 0), 0) || 500; // dummy fallback

    return {
      workspace: w,
      completionPct: cPct,
      expectedProg: expProg,
      healthCode,
      healthLabel,
      openRisks,
      openDependencies,
      daysRemaining,
      totalLoggedHours,
      initialEstimate
    };
  });

  const filteredMetrics = projectMetrics.filter(pm => {
    if (filterWorkspace !== "all" && pm.workspace.code !== filterWorkspace) return false;
    if (filterStatus !== "all" && pm.healthCode !== filterStatus) return false;
    if (filterOwner !== "all" && !pm.workspace.ownerIds.includes(filterOwner)) return false;
    // ... we can add remaining filters here ...
    return true;
  });

  const totalProjects = filteredMetrics.length;
  const onTrackCount = filteredMetrics.filter(pm => pm.healthCode === "on_track").length;
  const offTrackCount = filteredMetrics.filter(pm => pm.healthCode === "off_track").length;
  const atRiskCount = filteredMetrics.filter(pm => pm.healthCode === "at_risk").length;
  const totalOpenRisks = filteredMetrics.reduce((sum, pm) => sum + pm.openRisks.length, 0);
  const totalOpenDeps = filteredMetrics.reduce((sum, pm) => sum + pm.openDependencies.length, 0);

  // Portfolio Health Summary chart data
  const healthData = [
    { name: "On Track", value: onTrackCount, fill: "#10B981" },
    { name: "At Risk", value: atRiskCount, fill: "#F59E0B" },
    { name: "Off Track", value: offTrackCount, fill: "#EF4444" },
  ];

  // Actions computation
  const myActions: any[] = [];
  filteredMetrics.forEach(pm => {
    if (pm.healthCode === "off_track") {
      myActions.push({ severity: "critical", title: `${pm.workspace.name} is Off Track`, subtitle: `Project is severely behind schedule.` });
    } else if (pm.healthCode === "at_risk") {
      myActions.push({ severity: "warning", title: `${pm.workspace.name} is At Risk`, subtitle: `Project is starting to fall behind.` });
    }
    
    pm.openRisks.forEach(r => {
      if (r.impactLevel === "Blocker" || r.impactLevel === "Critical") {
        myActions.push({ severity: "critical", title: `Critical Risk in ${pm.workspace.name}`, subtitle: r.description });
      }
    });

    pm.openDependencies.forEach(d => {
      if (d.impactLevel === "Blocker") {
        myActions.push({ severity: "critical", title: `Blocker Dependency in ${pm.workspace.name}`, subtitle: d.description });
      }
    });
  });

  return (
    <AppShell title="Portfolio Manager">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 lg:px-8 space-y-8 pb-32">
        {/* Welcome Section */}
        <div className="bg-card border border-border/40 rounded-2xl py-6 px-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {greeting}, {userName} <span className="text-xl">👋</span>
            </h1>
            <div className="text-muted-foreground mt-2 text-[15px] max-w-3xl leading-relaxed">
              <span className="font-semibold text-foreground">Portfolio Snapshot:</span>{" "}
              {offTrackCount > 0 && <span className="text-destructive font-medium">{offTrackCount} projects require immediate attention. </span>}
              Portfolio health is at <span className="font-medium text-foreground">{Math.round((onTrackCount / (totalProjects || 1)) * 100)}%</span>.{" "}
              {atRiskCount > 0 && <span>{atRiskCount} projects are currently at risk. </span>}
              Resource utilization is above 95% in 2 teams.
            </div>
          </div>
        </div>

        {/* Global Filters */}
        <div className="sticky top-[72px] z-10 bg-background/80 backdrop-blur-md border border-border/60 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 shadow-sm">
          <Filter className="w-4 h-4 text-muted-foreground mr-1" />
          <Select value={filterWorkspace} onValueChange={setFilterWorkspace}>
            <SelectTrigger className="w-[160px] h-9 text-[13px] bg-card"><SelectValue placeholder="Workspace" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Workspaces</SelectItem>{workspaces.map(w => <SelectItem key={w.code} value={w.code}>{w.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-9 text-[13px] bg-card"><SelectValue placeholder="Project Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="on_track">On Track</SelectItem>
              <SelectItem value="at_risk">At Risk</SelectItem>
              <SelectItem value="off_track">Off Track</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterTimeRange} onValueChange={setFilterTimeRange}>
            <SelectTrigger className="w-[140px] h-9 text-[13px] bg-card"><SelectValue placeholder="Time Range" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="q1">Q1</SelectItem><SelectItem value="q2">Q2</SelectItem><SelectItem value="q3">Q3</SelectItem><SelectItem value="q4">Q4</SelectItem>
            </SelectContent>
          </Select>
          <Select value="all">
            <SelectTrigger className="w-[140px] h-9 text-[13px] bg-card"><SelectValue placeholder="Project Owner" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Owners</SelectItem></SelectContent>
          </Select>
          <Select value="all">
            <SelectTrigger className="w-[140px] h-9 text-[13px] bg-card"><SelectValue placeholder="Project Type" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Types</SelectItem></SelectContent>
          </Select>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="shadow-sm relative overflow-hidden">
            <CardContent className="p-5 flex flex-col justify-center h-full">
               <p className="text-[13px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total Projects</p>
               <h3 className="text-3xl font-bold text-foreground">{totalProjects}</h3>
            </CardContent>
            <div className="absolute right-0 bottom-0 opacity-10 p-2"><Briefcase className="w-16 h-16" /></div>
          </Card>
          <Card className="shadow-sm relative overflow-hidden border-emerald-200 dark:border-emerald-900/50">
            <CardContent className="p-5 flex flex-col justify-center h-full">
               <p className="text-[13px] font-medium text-emerald-700 dark:text-emerald-400 mb-1 uppercase tracking-wider">On Track</p>
               <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{onTrackCount}</h3>
            </CardContent>
            <div className="absolute right-0 bottom-0 opacity-10 p-2 text-emerald-600"><CheckCircle2 className="w-16 h-16" /></div>
          </Card>
          <Card className="shadow-sm relative overflow-hidden border-red-200 dark:border-red-900/50">
            <CardContent className="p-5 flex flex-col justify-center h-full">
               <p className="text-[13px] font-medium text-red-700 dark:text-red-400 mb-1 uppercase tracking-wider">Off Track</p>
               <h3 className="text-3xl font-bold text-red-600 dark:text-red-500">{offTrackCount}</h3>
            </CardContent>
            <div className="absolute right-0 bottom-0 opacity-10 p-2 text-red-600"><AlertCircle className="w-16 h-16" /></div>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-5 flex flex-col justify-center h-full">
               <p className="text-[13px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">Open Risks</p>
               <h3 className="text-3xl font-bold text-amber-600 dark:text-amber-500">{totalOpenRisks}</h3>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-5 flex flex-col justify-center h-full">
               <p className="text-[13px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">Dependencies</p>
               <h3 className="text-3xl font-bold text-orange-600 dark:text-orange-500">{totalOpenDeps}</h3>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-5 flex flex-col justify-center h-full">
               <p className="text-[13px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">Avg Utilization</p>
               <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">88% <span className="text-sm text-emerald-500">↑</span></h3>
            </CardContent>
          </Card>
        </div>

        {/* Row 4: Unified Health Widget */}
        <PortfolioProjectHealthOverview metrics={filteredMetrics} />

        {/* Row 5: Project Delivery Confidence & Upcoming Milestones */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ProjectDeliveryConfidence metrics={filteredMetrics} />
          <UpcomingMilestones workspaces={workspaces} items={store.items} />
        </div>

        {/* Row 6: Recent Portfolio Activity & Portfolio Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentPortfolioActivity items={store.items} workspaces={workspaces} />
          
          <Card className="bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900 shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <Target className="w-5 h-5" /> Portfolio Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0 overflow-auto max-h-[400px]">
              <div className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                <p>Customer Portal has the highest resource consumption this month.</p>
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                <p>4 projects account for 65% of the total portfolio risk.</p>
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></div>
                <p>Open dependencies increased by 18% compared to last quarter.</p>
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                <p>Project completion rate overall improved by 9%.</p>
              </div>
              {/* Dynamically appended actions */}
              {myActions.slice(0, 4).map((action, idx) => (
                <div key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                    action.severity === "critical" ? "bg-red-500" :
                    action.severity === "warning" ? "bg-amber-500" : "bg-indigo-500"
                  }`}></div>
                  <p>
                    <strong>{action.title}:</strong> {action.subtitle}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Row 7: Resource Management */}
        <ResourceManagement store={store} />

        {/* Row 8: Risks & Dependencies */}
        <RisksDependenciesCenter metrics={filteredMetrics} />

      </div>
    </AppShell>
  );
}
