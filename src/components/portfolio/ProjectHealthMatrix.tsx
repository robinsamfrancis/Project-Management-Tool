import React from "react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, ReferenceLine, ReferenceArea } from "recharts";

export function ProjectHealthMatrix({ metrics }: { metrics: any[] }) {
  // Bubbles should be sized by total effort/logged hours
  // X: Completion %
  // Y: Days Remaining
  const data = metrics.map(m => ({
    name: m.workspace.name,
    x: m.completionPct,
    y: m.daysRemaining,
    z: m.initialEstimate,
    health: m.healthCode,
    hours: m.totalLoggedHours,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="font-semibold text-sm mb-1">{data.name}</p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Completion: <span className="font-medium text-foreground">{data.x}%</span></p>
            <p>Days Remaining: <span className="font-medium text-foreground">{data.y}</span></p>
            <p>Hours Logged: <span className="font-medium text-foreground">{data.hours}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Determine standard bounds for Y Axis
  const maxDays = data.length > 0 ? Math.max(...data.map(d => d.y)) : 30;
  // Pad Y max to next multiple of 10 for clean grid
  const yAxisMax = Math.max(30, Math.ceil((maxDays + 15) / 10) * 10);
  const yCenter = yAxisMax / 2;

  // Render quadrant watermarks inside the plot area
  const watermarkProps = {
    fontSize: 12,
    fontWeight: 700,
    opacity: 0.5,
    offset: 25,
  };

  return (
    <div className="flex flex-col bg-card min-h-max h-full">
      <div className="px-6 py-4 border-b border-border/40 bg-muted/5 flex justify-between items-center">
        <h3 className="text-base font-semibold text-foreground">Project Health Matrix</h3>
        <div className="flex gap-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 opacity-80" /> Healthy</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 opacity-80" /> At Risk</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-80" /> Critical</div>
        </div>
      </div>
      <div className="p-6 relative flex-1 min-h-[440px]">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#E5E7EB" />
              
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Completion %" 
                domain={[0, 100]} 
                ticks={[0, 25, 50, 75, 100]}
                padding={{ left: 24, right: 30 }}
                stroke="#6B7280" 
                tick={{ fontSize: 12, fill: "#6B7280" }} 
                tickFormatter={(val) => `${val}%`}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Days Remaining" 
                domain={[0, yAxisMax]} 
                padding={{ bottom: 24, top: 30 }}
                stroke="#6B7280" 
                tick={{ fontSize: 12, fill: "#6B7280", dx: -5 }} 
              />
              <ZAxis type="number" dataKey="z" range={[150, 1200]} name="Effort" />
              
              <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#9CA3AF', opacity: 0.5 }} content={<CustomTooltip />} />
              
              {/* Central crosshairs for 4 quadrants */}
              <ReferenceLine x={50} stroke="#E5E7EB" strokeWidth={2} />
              <ReferenceLine y={yCenter} stroke="#E5E7EB" strokeWidth={2} />

              {/* Quadrant Watermarks */}
              <ReferenceArea x1={0} x2={50} y1={yCenter} y2={yAxisMax} fill="transparent" label={{ position: 'insideTopLeft', value: 'MONITOR CLOSELY', fill: '#9CA3AF', ...watermarkProps }} />
              <ReferenceArea x1={50} x2={100} y1={yCenter} y2={yAxisMax} fill="transparent" label={{ position: 'insideTopRight', value: 'HEALTHY PROJECTS', fill: '#10B981', ...watermarkProps }} />
              <ReferenceArea x1={0} x2={50} y1={0} y2={yCenter} fill="transparent" label={{ position: 'insideBottomLeft', value: 'CRITICAL', fill: '#EF4444', ...watermarkProps }} />
              <ReferenceArea x1={50} x2={100} y1={0} y2={yCenter} fill="transparent" label={{ position: 'insideBottomRight', value: 'AT RISK', fill: '#F59E0B', ...watermarkProps }} />

              {/* Data Bubble Layers */}
              <Scatter data={data.filter(d => d.health === 'on_track')} fill="#10B981" fillOpacity={0.8} stroke="#ffffff" strokeWidth={1.5} />
              <Scatter data={data.filter(d => d.health === 'at_risk')} fill="#F59E0B" fillOpacity={0.8} stroke="#ffffff" strokeWidth={1.5} />
              <Scatter data={data.filter(d => d.health === 'off_track')} fill="#EF4444" fillOpacity={0.8} stroke="#ffffff" strokeWidth={1.5} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
