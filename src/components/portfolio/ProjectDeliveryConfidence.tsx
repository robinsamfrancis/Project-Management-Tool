import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProjectDeliveryConfidence({ metrics }: { metrics: any[] }) {
  return (
    <Card className="shadow-sm border-border/40">
      <CardHeader className="pb-4 border-b border-border/40 bg-muted/10">
        <CardTitle className="text-base font-semibold">Project Delivery Confidence</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-auto max-h-[400px]">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted/20 border-b border-border/60">
            <tr className="text-muted-foreground text-[12px] uppercase font-semibold tracking-wider">
              <th className="px-5 py-3.5">Project</th>
              <th className="px-5 py-3.5">Planned Progress</th>
              <th className="px-5 py-3.5">Actual Progress</th>
              <th className="px-5 py-3.5 text-right">Confidence Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {metrics.map((pm, idx) => {
              const diff = pm.completionPct - pm.expectedProg;
              let confLevel = "High Confidence";
              let cls = "bg-emerald-100 text-emerald-700";
              let icon = "🟢";

              if (diff < -15) {
                confLevel = "Low Confidence";
                cls = "bg-red-100 text-red-700";
                icon = "🔴";
              } else if (diff < 0) {
                confLevel = "Medium Confidence";
                cls = "bg-amber-100 text-amber-700";
                icon = "🟠";
              }

              return (
                <tr key={idx} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-semibold">{pm.workspace.name}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                       <span className="w-8">{pm.expectedProg}%</span>
                       <div className="w-16 h-1.5 bg-muted rounded-full">
                         <div className="h-full bg-slate-400" style={{ width: `${pm.expectedProg}%` }} />
                       </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                       <span className="w-8">{pm.completionPct}%</span>
                       <div className="w-16 h-1.5 bg-muted rounded-full">
                         <div className={`h-full ${diff < 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pm.completionPct}%` }} />
                       </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Badge className={`${cls} border-none shadow-none`}>{icon} {confLevel}</Badge>
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
