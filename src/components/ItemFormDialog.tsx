import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DIRECTORY,
  ISSUE_TYPE_META,
  PRIORITY_META,
  useWorkspaceStore,
  type BacklogItem,
  type IssueType,
  type Priority,
  type Workspace,
} from "@/lib/workspace-store";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
  initial?: BacklogItem;
  defaultType?: IssueType;
  defaultSprintId?: string;
  onCreated?: (item: BacklogItem) => void;
}

export function ItemFormDialog({
  open,
  onOpenChange,
  workspace,
  initial,
  defaultType,
  defaultSprintId,
  onCreated,
}: Props) {
  const { store, createItem, updateItem } = useWorkspaceStore();
  const sprints = store.sprints.filter(
    (s) => s.workspaceCode === workspace.code,
  );
  const parentCandidates = store.items.filter(
    (i) => i.workspaceCode === workspace.code,
  );

  const [type, setType] = useState<IssueType>("task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [points, setPoints] = useState<number>(3);
  const [assigneeId, setAssigneeId] = useState<string | undefined>();
  const [sprintId, setSprintId] = useState<string | undefined>();
  const [parentId, setParentId] = useState<string | undefined>();
  const [budgetHours, setBudgetHours] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<string>(workspace.statuses[0] ?? "Todo");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setType(initial.type);
      setTitle(initial.title);
      setDescription(initial.description ?? "");
      setPriority(initial.priority);
      setPoints(initial.points);
      setAssigneeId(initial.assigneeId);
      setSprintId(initial.sprintId);
      setParentId(initial.parentId);
      setBudgetHours(initial.budgetHours ?? "");
      setStartDate(initial.startDate ?? "");
      setDueDate(initial.dueDate ?? "");
      setStatus(initial.status);
    } else {
      setType(defaultType ?? "task");
      setTitle("");
      setDescription("");
      setPriority("medium");
      setPoints(3);
      setAssigneeId(undefined);
      setSprintId(defaultSprintId);
      setParentId(undefined);
      setBudgetHours("");
      setStartDate("");
      setDueDate("");
      setStatus(workspace.statuses[0] ?? "Todo");
    }
  }, [open, initial, defaultType, defaultSprintId, workspace.statuses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");
    const payload = {
      workspaceCode: workspace.code,
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      points: Number(points) || 0,
      assigneeId,
      sprintId,
      parentId,
      budgetHours: budgetHours === "" ? undefined : Number(budgetHours),
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
      status,
    };
    if (initial) {
      if (!updateItem(initial.id, payload)) {
        return;
      }
      toast.success("Item updated");
    } else {
      const created = createItem(payload);
      toast.success(`${ISSUE_TYPE_META[type].label} created`);
      onCreated?.(created);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit item" : "Create backlog item"}
          </DialogTitle>
          <DialogDescription>
            {initial
              ? "Update the details for this item."
              : "Add a new item to your backlog."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldRow label="Type" required>
              <Select
                value={type}
                onValueChange={(v) => setType(v as IssueType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Priority">
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as Priority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_META[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>
          </div>

          <FieldRow label="Title" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary…"
              autoFocus
            />
          </FieldRow>

          <FieldRow label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context, acceptance criteria, links…"
              rows={3}
            />
          </FieldRow>

          <div className="grid gap-4 sm:grid-cols-3">
            {type !== "feature" && (
              <>
                <FieldRow label="Story points">
                  <Input
                    type="number"
                    min={0}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                  />
                </FieldRow>
                <FieldRow label="Budget hours">
                  <Input
                    type="number"
                    min={0}
                    value={budgetHours}
                    onChange={(e) =>
                      setBudgetHours(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                  />
                </FieldRow>
              </>
            )}
            <FieldRow label="Status">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workspace.statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {type !== "feature" && (
              <>
                <FieldRow label="Assignee">
                  <Select
                    value={assigneeId ?? "__none__"}
                    onValueChange={(v) =>
                      setAssigneeId(v === "__none__" ? undefined : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Unassigned</SelectItem>
                      {workspace.memberIds
                        .concat(workspace.ownerIds)
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .map((id) => {
                          const p = DIRECTORY.find((x) => x.id === id);
                          return (
                            <SelectItem key={id} value={id}>
                              {p?.name ?? id}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </FieldRow>
                <FieldRow label="Sprint">
                  <Select
                    value={sprintId ?? "__backlog__"}
                    onValueChange={(v) =>
                      setSprintId(v === "__backlog__" ? undefined : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__backlog__">Backlog</SelectItem>
                      {sprints.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.state})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>
              </>
            )}
          </div>

          <FieldRow label="Parent">
            <Select
              value={parentId ?? "__none__"}
              onValueChange={(v) =>
                setParentId(v === "__none__" ? undefined : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {parentCandidates
                  .filter(
                    (e) =>
                      (e.type === "feature" || e.type === "epic") &&
                      e.id !== initial?.id,
                  )
                  .map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </FieldRow>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldRow label="Start date">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FieldRow>
            <FieldRow label="Due date">
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </FieldRow>
          </div>

          <FieldRow label="Documents">
            <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              Drop files here or click to attach (mock)
            </div>
          </FieldRow>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary text-primary-foreground"
            >
              {initial ? "Save changes" : "Create item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
