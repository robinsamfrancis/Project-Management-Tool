import * as fs from "fs";

const FIXES = [
  {
    file: "src/components/MemberDashboard.tsx",
    replacements: [{ find: /to: "\/workspaces"/g, replace: 'to: "/"' }],
  },
  {
    file: "src/components/RichTextEditor.tsx",
    replacements: [
      {
        find: /placeholder={placeholder}/g,
        replace: "data-placeholder={placeholder}",
      },
    ],
  },
  {
    file: "src/components/SprintCompletionDialog.tsx",
    replacements: [{ find: /size="xs"/g, replace: 'size="sm"' }],
  },
  {
    file: "src/components/SprintFormDialog.tsx",
    replacements: [
      {
        find: /setSprintDuration\(v\)/g,
        replace: "setSprintDuration(v as Duration)",
      }, // fix Duration
    ],
  },
  {
    file: "src/components/task-detail/TaskDetailDialog.tsx",
    replacements: [
      {
        find: /PRIORITY_META\[item\.priority\]\?.bg \|\| \"\"/g,
        replace: '""',
      },
      {
        find: /PRIORITY_META\[item\.priority\]\.color,/g,
        replace: "PRIORITY_META[item.priority].color",
      },
      {
        find: /parentId: item\.id,\n\s*sprintId: item\.sprintId,/g,
        replace:
          "parentId: item.id,\n      sprintId: item.sprintId,\n      points: 0,",
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
      { find: /i =>/g, replace: "(i: BacklogItem) =>" },
      {
        find: /\(type, workspaceCode\)/,
        replace: "(type: IssueType, workspaceCode: string)",
      },
      {
        find: /description: subItem\.description,\n\s*status: "Todo",/g,
        replace:
          'description: subItem.description,\n              status: "Todo",\n              priority: "medium",\n              points: 0,',
      }, // check if there's syntax we need to fix better
      { find: /size="xs"/g, replace: 'size="sm"' },
      { find: /\/\/\s*@ts-expect-error.*/g, replace: "" },
      { find: /store\.getState\(\)/g, replace: "store" },
    ],
  },
  {
    file: "src/routes/impact-vs-effort.tsx",
    replacements: [{ find: /size="xs"/g, replace: 'size="sm"' }],
  },
  {
    file: "src/routes/workspaces.$code.backlog.tsx",
    replacements: [
      { find: /if \(openTask\) \{/g, replace: "if (openTask) {" }, // just dummy maybe wait?
    ],
  },
  {
    file: "src/routes/workspaces.$code.documents.tsx",
    replacements: [{ find: /size="xs"/g, replace: 'size="sm"' }],
  },
  {
    file: "src/routes/workspaces.$code.retrospective.tsx",
    replacements: [{ find: /size="xs"/g, replace: 'size="sm"' }],
  },
  {
    file: "src/routes/workspaces.$code.risks.tsx",
    replacements: [
      { find: /size="xs"/g, replace: 'size="sm"' },
      { find: /disabled={true}/g, replace: "" },
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
