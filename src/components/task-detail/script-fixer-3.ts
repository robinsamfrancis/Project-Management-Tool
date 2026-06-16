import * as fs from "fs";

const file = "src/components/task-detail/TaskDetailDialog.tsx";
let code = fs.readFileSync(file, "utf8");

code = code.replace(/points: 0,\s+points: 0,/g, "points: 0,");

fs.writeFileSync(file, code);
