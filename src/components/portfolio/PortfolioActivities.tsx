import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function UpcomingMilestones({ workspaces, items }: { workspaces: any[], items: any[] }) {
  // Just gathering epics or features with due dates
  const deliverables = items.filter(i => (i.type === "epic" || i.type === "feature") && i.dueDate && i.status !== "Completed")
    .map(i => {
      const w = workspaces.find(w => w.code === i.workspaceCode);
      return { ...i, projectName: w ? w.name : i.workspaceCode };
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 10);

  return (
    <Card className="shadow-sm border-border/40">
      <CardHeader className="pb-4 border-b border-border/40 bg-muted/10">
        <CardTitle className="text-base font-semibold">Upcoming Milestones & Deliverables</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-auto max-h-[400px]">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted/20 border-b border-border/60">
            <tr className="text-muted-foreground text-[12px] uppercase font-semibold tracking-wider">
              <th className="px-5 py-3.5">Project</th>
              <th className="px-5 py-3.5">Deliverable</th>
              <th className="px-5 py-3.5">Due Date</th>
              <th className="px-5 py-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {deliverables.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No upcoming milestones found.</td></tr>
            )}
            {deliverables.map((d, idx) => {
              const diffToToday = Math.ceil((new Date(d.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              let statText = "Upcoming";
              let statCls = "bg-blue-100 text-blue-700";
              
              if (diffToToday < 0) {
                statText = "Overdue";
                statCls = "bg-red-100 text-red-700 font-bold";
              } else if (diffToToday <= 7) {
                statText = "This Week";
                statCls = "bg-amber-100 text-amber-700";
              } else if (diffToToday <= 30) {
                statText = "This Month";
                statCls = "bg-emerald-100 text-emerald-700";
              }

              return (
                <tr key={idx} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-semibold">{d.projectName}</td>
                  <td className="px-5 py-3">{d.title}</td>
                  <td className="px-5 py-3 text-muted-foreground">{new Date(d.dueDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <Badge className={`${statCls} border-none shadow-none`}>{statText}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export function RecentPortfolioActivity({ items, workspaces }: { items: any[], workspaces: any[] }) {
  const activities = items.flatMap(i => (i.activity || []).map((a: any) => ({ ...a, itemTitle: i.title, workspaceCode: i.workspaceCode })))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 10);

  return (
    <Card className="shadow-sm border-border/40">
      <CardHeader className="pb-4 border-b border-border/40 bg-muted/10">
        <CardTitle className="text-base font-semibold">Recent Portfolio Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-4 overflow-auto max-h-[400px]">
        <div className="space-y-4">
          {activities.length === 0 && <div className="text-center text-muted-foreground text-sm py-4">No recent activity.</div>}
          {activities.map((a, idx) => {
             const ws = workspaces.find(w => w.code === a.workspaceCode);
             return (
               <div key={idx} className="flex gap-3 text-sm">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                 <div>
                   <p><span className="font-semibold text-foreground">{ws?.name || a.workspaceCode}</span>: {a.text}</p>
                   <p className="text-xs text-muted-foreground mt-0.5">{new Date(a.at).toLocaleString()}</p>
                 </div>
               </div>
             );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
