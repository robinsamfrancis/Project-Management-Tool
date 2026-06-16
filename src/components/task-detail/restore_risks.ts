import * as fs from "fs";

const file = "src/routes/workspaces.$code.risks.tsx";
let code = fs.readFileSync(file, "utf8");

const STR =
  "const canEdit = !isProjectMember || (item.ownerIds || []).includes(myUserId);";

code = code.split(STR).join("");

fs.writeFileSync(file, code);
