import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import { ProjectProgressOverview } from "./ProjectProgressOverview";
import { ProjectHealthMatrix } from "./ProjectHealthMatrix";

export function PortfolioProjectHealthOverview({ metrics }: { metrics: any[] }) {
  const onTrackCount = metrics.filter(pm => pm.healthCode === "on_track").length;
  const atRiskCount = metrics.filter(pm => pm.healthCode === "at_risk").length;
  const offTrackCount = metrics.filter(pm => pm.healthCode === "off_track").length;

  return (
    <Card className="shadow-sm border-border/40 overflow-hidden flex flex-col h-[700px]">
      <CardHeader className="pb-4 border-b border-border/40 bg-muted/10 shrink-0">
        <CardTitle className="text-base font-semibold">Portfolio Project Health Overview</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/40 flex-1 min-h-0">
        <div className="h-full min-h-0">
          <ProjectProgressOverview metrics={metrics} />
        </div>
        <div className="flex flex-col h-full min-h-0">
          <div className="p-6 border-b border-border/40 bg-muted/5 shrink-0">
            <h3 className="text-base font-semibold text-foreground mb-4">Portfolio Health Summary</h3>
            <div className="h-[60px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: "Portfolio", OnTrack: onTrackCount, AtRisk: atRiskCount, OffTrack: offTrackCount }]} layout="vertical" barSize={24} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", fontSize: "12px", zIndex: 50 }} />
                  <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                  <Bar dataKey="OnTrack" stackId="a" fill="#10B981" radius={[4, 0, 0, 4]} />
                  <Bar dataKey="AtRisk" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="OffTrack" stackId="a" fill="#EF4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ProjectHealthMatrix metrics={metrics} />
          </div>
        </div>
      </div>
    </Card>
  );
}
