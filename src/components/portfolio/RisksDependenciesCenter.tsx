import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

export function RisksDependenciesCenter({ metrics }: { metrics: any[] }) {
  const allRisks = metrics.flatMap(m => m.openRisks);
  const allDeps = metrics.flatMap(m => m.openDependencies);

  const riskImpactCounts = { Blocker: 0, Critical: 0, High: 0, Medium: 0, Low: 0 };
  const riskStatusCounts = { Open: 0, "In Progress": 0 };
  const depStatusCounts = { Open: 0, "In Progress": 0 };

  allRisks.forEach(r => {
    if (riskImpactCounts[r.impactLevel] !== undefined) riskImpactCounts[r.impactLevel]++;
    if (riskStatusCounts[r.status] !== undefined) riskStatusCounts[r.status]++;
  });
  
  allDeps.forEach(d => {
    if (depStatusCounts[d.status] !== undefined) depStatusCounts[d.status]++;
  });

  const riskImpactData = Object.entries(riskImpactCounts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  const riskStatusData = Object.entries(riskStatusCounts).map(([name, value]) => ({ name, value }));
  const depStatusData = Object.entries(depStatusCounts).map(([name, value]) => ({ name, value }));

  const COLORS_IMPACT = { Blocker: "#7F1D1D", Critical: "#DC2626", High: "#EA580C", Medium: "#F59E0B", Low: "#10B981" };
  const COLORS_STATUS = { Open: "#EF4444", "In Progress": "#F59E0B" };

  return (
    <Card className="shadow-sm border-border/40">
      <CardHeader className="pb-4 border-b border-border/40 bg-muted/10">
        <CardTitle className="text-base font-semibold">Risks & Dependencies Command Center</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border/40">
          
          <div className="pt-4 md:pt-0">
            <h4 className="text-sm font-semibold text-center mb-4 uppercase tracking-wider text-muted-foreground">Risks by Impact</h4>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskImpactData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                    {riskImpactData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_IMPACT[entry.name] || "#ccc"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="pt-8 md:pt-0">
            <h4 className="text-sm font-semibold text-center mb-4 uppercase tracking-wider text-muted-foreground">Risks by Status</h4>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskStatusData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                    {riskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_STATUS[entry.name] || "#ccc"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="pt-8 md:pt-0">
            <h4 className="text-sm font-semibold text-center mb-4 uppercase tracking-wider text-muted-foreground">Dependencies by Status</h4>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={depStatusData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                    {depStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_STATUS[entry.name] || "#ccc"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
