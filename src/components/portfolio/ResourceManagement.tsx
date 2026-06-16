import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { DIRECTORY } from "@/lib/workspace-store";

export function ResourceManagement({ store }: { store: any }) {
  // Compute basic resource allocation mock data
  const totalAssignedItems = store.items.filter(i => i.assigneeId && i.status !== "Completed");
  const uniqueAssignees = Array.from(new Set(totalAssignedItems.map(i => i.assigneeId)));

  const teamCapacityData = [
    { team: "Frontend", Allocated: 320, Capacity: 400 },
    { team: "Backend", Allocated: 380, Capacity: 320 },
    { team: "QA", Allocated: 200, Capacity: 240 },
    { team: "Design", Allocated: 150, Capacity: 160 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-sm border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Resource Occupancy Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/20 border-b border-border/60">
                <tr className="text-muted-foreground text-[12px] uppercase font-semibold tracking-wider">
                  <th className="px-4 py-2">Resource Name</th>
                  <th className="px-4 py-2 text-right">Allocated (Hrs)</th>
                  <th className="px-4 py-2 text-right">Capacity (Hrs)</th>
                  <th className="px-4 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {uniqueAssignees.map((uid) => {
                  const user = DIRECTORY.find((d) => d.id === uid);
                  if (!user) return null;
                  const assignedPoints = totalAssignedItems.filter((i) => i.assigneeId === uid).reduce((a, b) => a + (b.points || 0), 0);
                  const allocatedHours = assignedPoints * 4; 
                  const capacity = 40;
                  const pct = Math.round((allocatedHours / capacity) * 100);
                  let statCls = "bg-emerald-100 text-emerald-700";
                  let statLbl = "Healthy";
                  
                  if (pct > 95) { statCls = "bg-red-100 text-red-700"; statLbl = "Overallocated"; }
                  else if (pct > 80) { statCls = "bg-orange-100 text-orange-700"; statLbl = "Near Capacity"; }

                  return (
                    <tr key={uid} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{allocatedHours}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{capacity}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`${statCls} border-none shadow-none`}>{statLbl}</Badge>
                      </td>
                    </tr>
                  );
                }).slice(0, 6)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Team Capacity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamCapacityData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="team" tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="Allocated" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Capacity" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
