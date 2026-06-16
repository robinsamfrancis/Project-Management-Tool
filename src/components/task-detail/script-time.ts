import * as fs from "fs";

const file = "src/components/task-detail/TaskDetailDialog.tsx";
let code = fs.readFileSync(file, "utf8");

const timeTrackingReplacement = `
function TimeTrackingTab({ item }: { item: BacklogItem }) {
  const { myUserId } = useCurrentUser();
  const { updateItem, addWorklog } = useWorkspaceStore();
  const wlogs = item.worklogs ?? [];
  const logged = wlogs.reduce((a, b) => a + b.hours, 0);
  const est = item.budgetHours ?? 0;
  const remaining = Math.max(0, est - logged);

  const [hours, setHours] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [comment, setComment] = useState("");

  const burndownData = useMemo(() => {
    if (!est) return [];
    let currentRemaining = est;
    const sortedLogs = [...(item.worklogs ?? [])].sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    const logsByDate: Record<string, number> = {};
    sortedLogs.forEach((w) => {
      logsByDate[w.date] = (logsByDate[w.date] || 0) + w.hours;
    });

    const dates = Object.keys(logsByDate);
    const data = [{ day: "Start", remaining: est, logged: 0 }];

    dates.forEach((date) => {
      const loggedHours = logsByDate[date];
      currentRemaining = Math.max(0, currentRemaining - loggedHours);
      data.push({
        day: new Date(date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        remaining: currentRemaining,
        logged: loggedHours,
      });
    });

    return data;
  }, [item.worklogs, est]);

  return (
    <div className="space-y-6">
      {est > 0 && burndownData.length > 1 && (
        <div className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold tracking-tight">Burndown Trend</h3>
          </div>
          <div className="h-[200px] w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={burndownData}>
                <defs>
                  <linearGradient
                    id="colorRemaining"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  className="opacity-50"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  dx={-10}
                />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  formatter={(value: number, name: string) => [value + 'h', name === 'remaining' ? 'Remaining' : 'Logged']}
                />
                <Area
                  type="monotone"
                  dataKey="remaining"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRemaining)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm space-y-4">
        <h4 className="text-sm font-semibold tracking-tight">Log Work</h4>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="Hours spent"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="h-9 text-sm"
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 w-full text-sm block cursor-pointer text-muted-foreground"
          />
        </div>
        <div className="flex items-start gap-3">
          <Input
            placeholder="What did you work on?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="h-9 text-sm flex-1"
          />
          <Button
            size="sm"
            className="h-9 px-4 shrink-0"
            disabled={!hours || !date}
            onClick={() => {
              const h = parseFloat(hours);
              if (isNaN(h) || h <= 0) return;
              addWorklog(item.id, h, comment, myUserId, date);
              setHours("");
              setComment("");
              toast.success("Time logged");
            }}
          >
            Log time
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold tracking-tight">History</h4>
        {wlogs.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-xl">
            No time has been logged yet
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="grid grid-cols-[100px_1fr_60px_40px] items-center p-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/20 border-b border-border/50">
              <div>Date</div>
              <div>User & Description</div>
              <div className="text-right">Hours</div>
              <div></div>
            </div>
            <div className="divide-y divide-border/50">
              {[...wlogs].reverse().map((w) => (
                <div key={w.id} className="grid grid-cols-[100px_1fr_60px_40px] items-center p-3 text-sm hover:bg-muted/10 transition-colors">
                  <div className="text-muted-foreground text-xs">
                    {new Date(w.date).toLocaleDateString()}
                  </div>
                  <div className="pr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <PersonAvatar userId={w.userId} size="xs" />
                      <span className="font-medium text-xs">
                        {DIRECTORY.find((d) => d.id === w.userId)?.name}
                      </span>
                    </div>
                    {w.comment && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{w.comment}</p>
                    )}
                  </div>
                  <div className="text-right font-medium text-xs">{w.hours}h</div>
                  <div className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        updateItem(item.id, {
                          worklogs: item.worklogs?.filter((x) => x.id !== w.id),
                        });
                        toast.success("Log deleted");
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
`;

code = code.replace(
  /function TimeTrackingTab\(\{\s*item\s*\}\:\s*\{\s*item\:\s*BacklogItem\s*\}\)\s*\{[\s\S]*?\}\n\n\/\* ---------- ATTACHMENTS ---------- \*\//,
  timeTrackingReplacement + "\n\n/* ---------- ATTACHMENTS ---------- */",
);

fs.writeFileSync(file, code);
