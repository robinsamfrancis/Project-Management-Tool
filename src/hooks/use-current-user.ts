import { useState, useEffect } from "react";

export function useCurrentUser() {
  const [role, setRole] = useState("Project Member");

  useEffect(() => {
    setRole(localStorage.getItem("demo-role") || "Project Member");
  }, []);

  let myUserId = "u4"; // Project Member
  if (role === "Portfolio Manager") myUserId = "u1";
  else if (role === "Project Manager") myUserId = "u2";
  else if (role === "Admin User") myUserId = "u3";

  const isPortfolioManager = role === "Portfolio Manager";
  const isProjectManager = role === "Project Manager";

  return { role, myUserId, isPortfolioManager, isProjectManager };
}
