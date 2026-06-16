import * as fs from "fs";

const file = "src/components/task-detail/TaskDetailDialog.tsx";
let code = fs.readFileSync(file, "utf8");

// Fix bg access
code = code.replace(
  /PRIORITY_META\[item\.priority\]\.bg/g,
  'PRIORITY_META[item.priority]?.bg || ""',
);
// Wait, PRIORITY_META doesn't have bg. It only has color, label.
// In the recent rewrite I used bg for PRIORITY_META.
code = code.replace(/PRIORITY_META\[item\.priority\]\.\?bg \|\| \"\"/g, '""');
code = code.replace(/PRIORITY_META\[item\.priority\]\.bg,/g, "");

// Fix Type capitalization issues
code = code.replace(/ISSUE_TYPE_META\.Task/g, "ISSUE_TYPE_META.task");
code = code.replace(/type: "Task",/g, 'type: "task",');
code = code.replace(/priority: "Medium",/g, 'priority: "medium",');

fs.writeFileSync(file, code);
