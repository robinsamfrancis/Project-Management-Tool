import React from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Workspace } from "@/lib/workspace-store";
import { Badge } from "@/components/ui/badge";

export function ProjectProgressOverview({ metrics }: { metrics: any[] }) {
  const sorted = [...metrics].sort((a, b) => {
    const healthOrder = { off_track: 0, at_risk: 1, on_track: 2 } as any;
    if (healthOrder[a.healthCode] !== healthOrder[b.healthCode]) {
      return healthOrder[a.healthCode] - healthOrder[b.healthCode];
    }
    return b.completionPct - a.completionPct;
  });

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="px-6 py-4 border-b border-border/40 bg-muted/5 shrink-0">
        <h3 className="text-base font-semibold text-foreground">Project Progress Overview</h3>
      </div>
      <div className="flex-1 p-0 overflow-y-auto min-h-0">
        <div className="divide-y divide-border/40">
          {sorted.map((pm) => (
            <Link key={pm.workspace.code} to={`/workspaces/${pm.workspace.code}/dashboard`} className="block hover:bg-muted/30 transition-colors p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-sm">{pm.workspace.name}</h4>
                  <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">End: {pm.workspace.endDate ? new Date(pm.workspace.endDate).toLocaleDateString() : 'TBD'}</div>
                </div>
                <div className="text-right">
                  <Badge className={`${pm.healthCode === 'on_track' ? 'bg-emerald-100 text-emerald-700' : pm.healthCode === 'off_track' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} border-none shadow-none`}>
                    {pm.healthLabel}
                  </Badge>
                  <div className="text-[11px] text-muted-foreground mt-1 font-medium">{pm.totalLoggedHours.toLocaleString()} Hours Logged</div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="w-10 text-xs font-semibold">{pm.completionPct}%</div>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${pm.healthCode === 'on_track' ? 'bg-emerald-500' : pm.healthCode === 'off_track' ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${pm.completionPct}%` }} />
                </div>
                <div className="w-12 text-right text-[11px] text-muted-foreground">{100 - pm.completionPct}% left</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
