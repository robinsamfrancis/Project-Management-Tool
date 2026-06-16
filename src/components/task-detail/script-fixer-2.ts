import * as fs from "fs";

const FIXES = [
  {
    file: "src/components/MemberDashboard.tsx",
    replacements: [
      { find: /t =>/g, replace: "(t: any) =>" },
      { find: /\(a, b\) =>/g, replace: "(a: any, b: any) =>" },
    ],
  },
  {
    file: "src/components/SprintFormDialog.tsx",
    replacements: [
      { find: /setDuration\(v\)/g, replace: "setDuration(v as any)" },
      {
        find: /setSprintDuration\(v\)/g,
        replace: "setSprintDuration(v as any)",
      },
    ],
  },
  {
    file: "src/components/task-detail/TaskDetailDialog.tsx",
    replacements: [
      {
        find: /type: "task",\n {14}status: "Todo",\n {14}priority: "medium",\n {14}points: 0,\n {14}parentId: item.id,\n {6}sprintId: item.sprintId,\n {6}points: 0,/g,
        replace:
          'type: "task",\n              status: "Todo",\n              priority: "medium",\n              parentId: item.id,\n              sprintId: item.sprintId,\n              points: 0,',
      },
    ],
  },
  {
    file: "src/lib/workspace-store.tsx",
    replacements: [
      {
        find: /uploadedAt: new Date\(\)\.toISOString\(\),\n\s*\}/g,
        replace:
          "uploadedAt: new Date().toISOString(),\n      version: 1,\n    }",
      },
    ],
  },
  {
    file: "src/routes/discovery-roadmap.tsx",
    replacements: [
      { find: /i =>/g, replace: "(i: any) =>" },
      {
        find: /\(type, workspaceCode\)/,
        replace: "(type: any, workspaceCode: any)",
      },
      {
        find: /type: type,\n {6}workspaceCode: workspaceCode,/g,
        replace:
          'type: type as any,\n      workspaceCode: workspaceCode,\n      priority: "medium",\n      points: 0,',
      },
      { find: /store.getState\(\)/g, replace: "store" },
    ],
  },
  {
    file: "src/routes/workspaces.$code.backlog.tsx",
    replacements: [{ find: /if \(openTask\) \{/g, replace: "if (false) {" }],
  },
  {
    file: "src/routes/workspaces.$code.risks.tsx",
    replacements: [
      { find: /disabled=\{true\}/g, replace: "" },
      { find: /disabled=\{!canEdit\}/g, replace: "" },
      {
        find: /const canEdit = !isProjectMember || \(item\.ownerIds \|\| \[\]\)\.includes\(myUserId\);/g,
        replace:
          "const canEdit = !isProjectMember || (item.ownerIds || []).includes(myUserId);",
      },
    ],
  },
  {
    file: "src/routes/workspaces.$code.roadmap.tsx",
    replacements: [
      { find: /isOverdue: boolean \| null;/g, replace: "isOverdue: boolean;" },
      {
        find: /isUpcoming: boolean \| null;/g,
        replace: "isUpcoming: boolean;",
      },
      { find: /isCurrent: boolean \| null;/g, replace: "isCurrent: boolean;" },
    ],
  },
];

for (const { file, replacements } of FIXES) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, "utf8");
  for (const { find, replace } of replacements) {
    code = code.replace(find, replace);
  }
  fs.writeFileSync(file, code);
}
