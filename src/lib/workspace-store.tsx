import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

export type Designation =
  | "Frontend Developer"
  | "Backend Developer"
  | "QA Engineer"
  | "UI/UX Designer"
  | "Product Analyst"
  | "DevOps Engineer";

export const DESIGNATIONS: Designation[] = [
  "Frontend Developer",
  "Backend Developer",
  "QA Engineer",
  "UI/UX Designer",
  "Product Analyst",
  "DevOps Engineer",
];

export interface Person {
  id: string;
  name: string;
  designation: Designation;
  email?: string;
  department?: string;
  avatar?: string;
  role?: string;
}

export const DIRECTORY: Person[] = [
  // Portfolio Managers
  { id: "u1", name: "Portfolio Manager", designation: "Product Analyst", email: "portfolio@beinex.com", department: "PMO", role: "Portfolio Manager", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" },
  { id: "u13", name: "Elizabeth Sterling", designation: "Product Analyst", email: "esterling@beinex.com", department: "PMO", role: "Portfolio Manager", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150" },
  { id: "u14", name: "Jonathan Reed", designation: "Product Analyst", email: "jreed@beinex.com", department: "PMO", role: "Portfolio Manager", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
  { id: "u15", name: "Samantha Vance", designation: "Product Analyst", email: "svance@beinex.com", department: "PMO", role: "Portfolio Manager", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" },
  { id: "u16", name: "Chloe Lebon", designation: "Product Analyst", email: "clebon@beinex.com", department: "PMO", role: "Portfolio Manager", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },

  // Project Managers
  { id: "u2", name: "Project Manager", designation: "Backend Developer", email: "pm@beinex.com", department: "PMO", role: "Project Manager", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150" },
  { id: "u17", name: "Arthur Pendragon", designation: "Backend Developer", email: "apendragon@beinex.com", department: "PMO", role: "Project Manager", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
  { id: "u18", name: "Clara Oswald", designation: "Backend Developer", email: "coswald@beinex.com", department: "PMO", role: "Project Manager", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
  { id: "u19", name: "Winston Smith", designation: "Backend Developer", email: "wsmith@beinex.com", department: "Operations", role: "Project Manager", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
  { id: "u20", name: "Diane Nguyen", designation: "Backend Developer", email: "dnguyen@beinex.com", department: "PMO", role: "Project Manager", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150" },
  { id: "u21", name: "Frank Castle", designation: "Backend Developer", email: "fcastle@beinex.com", department: "Security", role: "Project Manager", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150" },
  { id: "u22", name: "Grace Hopper", designation: "Backend Developer", email: "ghopper@beinex.com", department: "Engineering", role: "Project Manager", avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150" },
  { id: "u23", name: "Henry Higgins", designation: "Backend Developer", email: "hhiggins@beinex.com", department: "PMO", role: "Project Manager", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150" },
  { id: "u24", name: "Irene Adler", designation: "Backend Developer", email: "iadler@beinex.com", department: "Strategy", role: "Project Manager", avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150" },
  { id: "u25", name: "Jack Ryan", designation: "Backend Developer", email: "jryan@beinex.com", department: "PMO", role: "Project Manager", avatar: "https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=150" },

  // Admin Users
  { id: "u3", name: "Admin User", designation: "QA Engineer", email: "admin@beinex.com", department: "IT", role: "Admin User", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150" },
  { id: "u11", name: "Sarah Jenkins", designation: "QA Engineer", email: "sjenkins@beinex.com", department: "IT", role: "Admin User", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150" },
  { id: "u12", name: "David Vance", designation: "QA Engineer", email: "dvance@beinex.com", department: "IT", role: "Admin User", avatar: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150" },

  // Project Members
  { id: "u4", name: "Project Member", designation: "UI/UX Designer", email: "member@beinex.com", department: "Engineering", role: "Project Member", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" },
  { id: "u5", name: "Liam O'Connor", designation: "Product Analyst", email: "loconnor@beinex.com", department: "Engineering", role: "Project Member", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150" },
  { id: "u6", name: "Aisha Khan", designation: "DevOps Engineer", email: "akhan@beinex.com", department: "Infrastructure", role: "Project Member", avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150" },
  { id: "u7", name: "Marco Rossi", designation: "Backend Developer", email: "mrossi@beinex.com", department: "Engineering", role: "Project Member", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150" },
  { id: "u8", name: "Nadia Petrova", designation: "Frontend Developer", email: "npetrova@beinex.com", department: "Engineering", role: "Project Member", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150" },
  { id: "u9", name: "Kenji Tanaka", designation: "DevOps Engineer", email: "ktanaka@beinex.com", department: "Infrastructure", role: "Project Member", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150" },
  { id: "u10", name: "Emma Wilson", designation: "QA Engineer", email: "ewilson@beinex.com", department: "QA", role: "Project Member", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150" },
  { id: "u26", name: "Carlos Santana", designation: "Frontend Developer", email: "csantana@beinex.com", department: "Engineering", role: "Project Member", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" },
  { id: "u27", name: "Yukihiro Matsumoto", designation: "Backend Developer", email: "matz@beinex.com", department: "Engineering", role: "Project Member", avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150" },
  { id: "u28", name: "Linus Torvalds", designation: "DevOps Engineer", email: "linus@beinex.com", department: "Infrastructure", role: "Project Member", avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150" },
  { id: "u29", name: "Ada Lovelace", designation: "Backend Developer", email: "ada@beinex.com", department: "Engineering", role: "Project Member", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150" },
  { id: "u30", name: "Alan Turing", designation: "Product Analyst", email: "turing@beinex.com", department: "Engineering", role: "Project Member", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150" },
  { id: "u31", name: "Margaret Hamilton", designation: "QA Engineer", email: "margaret@beinex.com", department: "QA", role: "Project Member", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150" },
  { id: "u32", name: "Guido van Rossum", designation: "Backend Developer", email: "guido@beinex.com", department: "Engineering", role: "Project Member", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150" },
  { id: "u33", name: "Bjarne Stroustrup", designation: "Backend Developer", email: "bjarne@beinex.com", department: "Engineering", role: "Project Member", avatar: "https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=150" },
  { id: "u34", name: "Steve Wozniak", designation: "Frontend Developer", email: "woz@beinex.com", department: "Engineering", role: "Project Member", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
  { id: "u35", name: "Tim Berners-Lee", designation: "Frontend Developer", email: "timbl@beinex.com", department: "Engineering", role: "Project Member", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150" },
  { id: "u36", name: "Vint Cerf", designation: "DevOps Engineer", email: "vcerf@beinex.com", department: "Infrastructure", role: "Project Member", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150" },
  { id: "u37", name: "Satoshi Nakamoto", designation: "Backend Developer", email: "satoshi@beinex.com", department: "Engineering", role: "Project Member", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
  { id: "u38", name: "Donald Knuth", designation: "QA Engineer", email: "knuth@beinex.com", department: "QA", role: "Project Member", avatar: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150" },
  { id: "u39", name: "Radia Perlman", designation: "DevOps Engineer", email: "radia@beinex.com", department: "Infrastructure", role: "Project Member", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" },
  { id: "u40", name: "Barbara Liskov", designation: "Product Analyst", email: "barbara@beinex.com", department: "Engineering", role: "Project Member", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
  { id: "u41", name: "Elena Rostova", designation: "QA Engineer", email: "elena@beinex.com", department: "QA", role: "Project Member", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150" },
  { id: "u42", name: "Vikram Seth", designation: "Frontend Developer", email: "vikram@beinex.com", department: "Engineering", role: "Project Member", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150" },
  { id: "u43", name: "Amara Okafor", designation: "UI/UX Designer", email: "amara@beinex.com", department: "Engineering", role: "Project Member", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150" },
  { id: "u44", name: "Niklaus Wirth", designation: "Frontend Developer", email: "wirth@beinex.com", department: "Engineering", role: "Project Member", avatar: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150" },
  { id: "u45", name: "Richard Stallman", designation: "QA Engineer", email: "stallman@beinex.com", department: "QA", role: "Project Member", avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150" }
];

export type IssueType = "epic" | "feature" | "story" | "task" | "bug" | "spike";
export type Priority = "lowest" | "low" | "medium" | "high" | "highest";
export type LinkType = "blocks" | "blockedBy" | "relatesTo" | "duplicates";

export interface AcceptanceCriterion {
  id: string;
  text: string;
  done: boolean;
  isDefault?: boolean;
}
export interface IssueLink {
  id: string;
  type: LinkType;
  targetId: string;
}
export interface Reaction {
  emoji: string;
  userIds: string[];
}
export interface Comment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  reactions: Reaction[];
  internal: boolean;
  parentId?: string;
  attachments?: Attachment[];
}
export type ActivityType =
  | "created"
  | "updated"
  | "status"
  | "sprint"
  | "assignee"
  | "comment"
  | "attachment"
  | "worklog"
  | "automation";
export interface Activity {
  id: string;
  type: ActivityType;
  actorId: string;
  at: string;
  text: string;
}
export interface Attachment {
  id: string;
  name: string;
  mime: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  documentId?: string;
}
export interface Worklog {
  id: string;
  userId: string;
  date: string;
  hours: number;
  comment?: string;
}

export interface DependencyRisk {
  id: string;
  type: "Dependency" | "Risk";
  description: string;
  ownerIds: string[];
  impactLevel: "Blocker" | "Critical" | "High" | "Medium" | "Low";
  mitigationNote?: string;
  status: "Open" | "In Progress" | "Closed";
  loggedDate: string;
  closureDate?: string;
}

export interface BacklogItem {
  id: string;
  workspaceCode: string;
  type: IssueType;
  title: string;
  description?: string;
  priority: Priority;
  points: number;
  assigneeId?: string;
  reporterId?: string;
  sprintId?: string;
  parentId?: string;
  epicId?: string;
  budgetHours?: number;
  estimateHours?: number;
  remainingHours?: number;
  startDate?: string;
  dueDate?: string;
  status: string;
  order: number;
  team?: string;
  releaseVersion?: string;
  acceptanceCriteria?: AcceptanceCriterion[];
  links?: IssueLink[];
  comments?: Comment[];
  activity?: Activity[];
  attachments?: Attachment[];
  worklogs?: Worklog[];
  dependencyRisks?: DependencyRisk[];
  seededAt?: string;
}

export type SprintState = "planned" | "active" | "completed";

export interface SprintRetrospective {
  whatWentWell?: string;
  whatToImprove?: string;
  actionItems?: string;
  notes?: string;
  completedAt?: string;

  // Enhanced retro fields
  closureSummary?: string;
  whatWentWellList?: string[];
  whatToImproveList?: string[];
  lastModifiedAt?: string;
  managerName?: string;
}

export interface Sprint {
  id: string;
  workspaceCode: string;
  name: string;
  goal?: string;
  durationWeeks: number | "custom";
  startDate: string;
  endDate: string;
  state: SprintState;
  leaves: Record<string, string[]>;
  summary?: string;
  plannedPoints?: number;
  completedPoints?: number;
  carriedPoints?: number;
  completedItemsCount?: number;
  carriedItemsCount?: number;
  destinationSprintName?: string;
  retrospective?: SprintRetrospective;
}

export type ProjectType = "in-house" | "client";

export interface Workspace {
  code: string;
  name: string;
  type: ProjectType;
  ownerIds: string[];
  memberIds: string[];
  parentCode?: string;
  statuses: string[];
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface DocumentVersion {
  version: number;
  name: string;
  url: string; // can contain data URL or mock URL
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ProjectDocument {
  id: string;
  workspaceCode: string;
  name: string;
  type: string; // e.g. "pdf", "docx", "xls", "txt", "png", etc.
  folderId: string | null;
  content?: string; // used for notes generated inside Beinex
  size: number;
  versions: DocumentVersion[];
  associations: {
    type: IssueType | "release";
    id: string;
    title: string;
  }[];
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
  viewCount: number;
}

export interface DocumentFolder {
  id: string;
  workspaceCode: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

const syncDocAttachments = (
  items: BacklogItem[],
  doc: ProjectDocument,
): BacklogItem[] => {
  const associatedItemIds = doc.associations.map((a) => a.id);
  return items.map((i) => {
    const isAssociated = associatedItemIds.includes(i.id);
    const hasAttachment = (i.attachments ?? []).some(
      (a) => a.documentId === doc.id || a.name === doc.name,
    );

    if (isAssociated && !hasAttachment) {
      const newAtt: Attachment = {
        id: rid("ATT"),
        name: doc.name,
        mime: "application/octet-stream",
        size: doc.size,
        url: doc.content || doc.versions[doc.versions.length - 1]?.url || "#",
        uploadedBy: doc.lastModifiedBy,
        uploadedAt: doc.lastModifiedAt,
        version: doc.versions.length,
        documentId: doc.id,
      };
      return {
        ...i,
        attachments: [...(i.attachments ?? []), newAtt],
      };
    } else if (!isAssociated && hasAttachment) {
      return {
        ...i,
        attachments: (i.attachments ?? []).filter(
          (a) => a.documentId !== doc.id && a.name !== doc.name,
        ),
      };
    }
    return i;
  });
};

const getWorkingDays = (startDateStr: string, endDateStr: string): number => {
  if (!startDateStr || !endDateStr) return 0;
  const [sy, sm, sd] = startDateStr.split("T")[0].split("-").map(Number);
  const [ey, em, ed] = endDateStr.split("T")[0].split("-").map(Number);
  if (!sy || !ey) return 0;

  const date = new Date(sy, sm - 1, sd);
  const endDate = new Date(ey, em - 1, ed);
  let days = 0;
  while (date <= endDate) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      days++;
    }
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const checkOverallocation = (
  sprints: Sprint[],
  items: BacklogItem[],
  itemDetails: Partial<BacklogItem>,
) => {
  const sprintId = itemDetails.sprintId;
  const assigneeId = itemDetails.assigneeId;

  if (!sprintId || !assigneeId) return;

  const sprint = sprints.find((s) => s.id === sprintId);
  if (!sprint) return;

  const workingDays = getWorkingDays(sprint.startDate, sprint.endDate);

  // Calculate Leave Hours (each date in string[] represents 1 full day = 8 hours)
  const leaveDates = sprint.leaves?.[assigneeId] || [];
  const leaveHours = leaveDates.length * 8;

  const availableCapacity = workingDays * 8 - leaveHours;

  const assignedItems = items.filter(
    (i) =>
      i.sprintId === sprintId &&
      i.assigneeId === assigneeId &&
      i.id !== itemDetails.id,
  );

  let assignedHours = assignedItems.reduce(
    (acc, curr) => acc + Number(curr.estimateHours || curr.budgetHours || 0),
    0,
  );
  assignedHours += Number(
    itemDetails.estimateHours || itemDetails.budgetHours || 0,
  );

  if (assignedHours > availableCapacity) {
    const overallocatedBy = assignedHours - availableCapacity;
    toast.warning(`Resource Overallocated by ${overallocatedBy} Hours`);
  }
};

export interface StrategicGoal {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export type DiscoveryStatus =
  | "Idea"
  | "Research"
  | "Validation"
  | "Approved"
  | "Planned"
  | "In Progress"
  | "Delivered"
  | "Rejected"
  | string;

export interface DiscoveryItem {
  id: string;
  title: string;
  description?: string;
  problemStatement?: string;
  proposedSolution?: string;
  businessValue?: string;
  targetUsers?: string;
  ownerId?: string;
  contributors?: string[];
  priority?: "Low" | "Medium" | "High" | "Critical";
  status: DiscoveryStatus;
  impactScore?: number; // 1-10
  effortScore?: number; // 1-10
  goalIds?: string[];
  tags?: string[];
  linkedWorkspaceCode?: string;
  linkedItemId?: string; // converted to Epic/Feature
  targetQuarter?: string;
  expectedDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveryTag {
  id: string;
  name: string;
  color?: string;
}

interface Store {
  workspaces: Workspace[];
  items: BacklogItem[];
  sprints: Sprint[];
  documents: ProjectDocument[];
  folders: DocumentFolder[];
  discoveryItems: DiscoveryItem[];
  strategicGoals: StrategicGoal[];
  discoveryTags: DiscoveryTag[];
}

const STORAGE_KEY = "bpm-store-v1";

const createEnterpriseMockData = (): Store => {
  const workspaces: Workspace[] = [
    {
      code: "CPM",
      name: "Customer Portal Modernization",
      type: "client",
      ownerIds: ["u2"],
      memberIds: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u10", "u26", "u31", "u42"],
      statuses: ["Planning", "Design", "In Progress", "UAT", "Completed"],
      startDate: "2026-04-01",
      endDate: "2026-10-15",
      createdAt: "2026-03-15T08:00:00Z"
    },
    {
      code: "DTP",
      name: "Digital Transformation Program",
      type: "in-house",
      ownerIds: ["u17"],
      memberIds: ["u1", "u13", "u17", "u5", "u6", "u7", "u8", "u9", "u10", "u27", "u28", "u33"],
      statuses: ["Discovery", "Analysis", "Implementation", "Testing", "Deployment"],
      startDate: "2026-01-15",
      endDate: "2026-12-31",
      createdAt: "2026-01-01T08:00:00Z"
    },
    {
      code: "DLI",
      name: "Data Lake Implementation",
      type: "client",
      ownerIds: ["u18"],
      memberIds: ["u1", "u18", "u3", "u5", "u6", "u10", "u32", "u36", "u38", "u39"],
      statuses: ["Requirements", "Architecture", "Ingestion", "Validation", "Live"],
      startDate: "2026-03-01",
      endDate: "2026-09-30",
      createdAt: "2026-02-15T08:00:00Z"
    },
    {
      code: "CRP",
      name: "Customer Relationship Platform",
      type: "client",
      ownerIds: ["u20"],
      memberIds: ["u1", "u20", "u4", "u5", "u7", "u8", "u29", "u30", "u34", "u35"],
      statuses: ["Initiation", "Customization", "Integration", "Pilot", "Completed"],
      startDate: "2026-05-01",
      endDate: "2026-11-30",
      createdAt: "2026-04-10T08:00:00Z"
    },
    {
      code: "MBU",
      name: "Mobile Banking Upgrade",
      type: "client",
      ownerIds: ["u22"],
      memberIds: ["u1", "u22", "u4", "u6", "u7", "u8", "u9", "u10", "u37", "u40", "u43", "u44"],
      statuses: ["Scoping", "UI/UX", "Sprint Cycles", "Security Audit", "App Store Done"],
      startDate: "2026-06-01",
      endDate: "2027-02-28",
      createdAt: "2026-05-20T08:00:00Z"
    }
  ];

  const sprints: Sprint[] = [];
  const items: BacklogItem[] = [];

  const sprintList = [
    { num: 1, state: "completed" as const, start: "2026-04-13", end: "2026-04-27", spPlan: 45, spComp: 45 },
    { num: 2, state: "completed" as const, start: "2026-04-27", end: "2026-05-11", spPlan: 42, spComp: 42 },
    { num: 3, state: "completed" as const, start: "2026-05-11", end: "2026-05-25", spPlan: 48, spComp: 48 },
    { num: 4, state: "completed" as const, start: "2026-05-25", end: "2026-06-08", spPlan: 50, spComp: 47 },
    { num: 5, state: "active" as const, start: "2026-06-08", end: "2026-06-22", spPlan: 55, spComp: 0 },
    { num: 6, state: "planned" as const, start: "2026-06-22", end: "2026-07-06", spPlan: 48, spComp: 0 },
    { num: 7, state: "planned" as const, start: "2026-07-06", end: "2026-07-20", spPlan: 52, spComp: 0 },
  ];

  workspaces.forEach((w) => {
    sprintList.forEach((sp) => {
      sprints.push({
        id: `S-${w.code}-${sp.num}`,
        workspaceCode: w.code,
        name: `Sprint ${sp.num} - ${w.code}`,
        goal: `Core deliverables for stage ${sp.num} of ${w.name}`,
        startDate: sp.start,
        endDate: sp.end,
        state: sp.state,
        capacity: 120,
        storyPointsPlanned: sp.spPlan,
        storyPointsCompleted: sp.spComp,
        velocity: sp.state === "completed" ? sp.spComp : undefined,
        createdAt: w.createdAt,
      });
    });
  });

  const rawTemplates: Array<{
    workspaceCode: string;
    idShort: string;
    title: string;
    type: IssueType;
    priority: Priority;
    points: number;
    assigneeId: string;
    parentShort?: string;
    sprintNum?: number;
    status?: string;
  }> = [
    // --- CUSTOMER PORTAL MODERNIZATION (CPM) ---
    { workspaceCode: "CPM", idShort: "E101", title: "Enterprise Security & Authentication Architecture", type: "epic", priority: "highest", points: 13, assigneeId: "u2" },
    { workspaceCode: "CPM", idShort: "E102", title: "User Dashboard & Account Portlet Suite", type: "epic", priority: "high", points: 13, assigneeId: "u2" },
    
    { workspaceCode: "CPM", idShort: "F201", title: "OAuth Single Sign-On integration", type: "feature", priority: "high", points: 8, assigneeId: "u7", parentShort: "E101" },
    { workspaceCode: "CPM", idShort: "F202", title: "Multi-Factor Authentication (MFA)", type: "feature", priority: "highest", points: 8, assigneeId: "u8", parentShort: "E101" },
    { workspaceCode: "CPM", idShort: "F203", title: "Responsive Real-time Account Balance Widgets", type: "feature", priority: "medium", points: 5, assigneeId: "u4", parentShort: "E102" },
    { workspaceCode: "CPM", idShort: "F204", title: "Detailed Security Audit and Activity Trail", type: "feature", priority: "medium", points: 5, assigneeId: "u6", parentShort: "E101" },

    { workspaceCode: "CPM", idShort: "301", title: "Design high-fidelity user dashboard wireframes", type: "story", priority: "medium", points: 3, assigneeId: "u4", sprintNum: 1, status: "Completed" },
    { workspaceCode: "CPM", idShort: "302", title: "Implement JWT token-based session guard", type: "story", priority: "highest", points: 5, assigneeId: "u7", sprintNum: 1, status: "Completed" },
    { workspaceCode: "CPM", idShort: "303", title: "Setup PostgreSQL cloud database instances", type: "task", priority: "high", points: 2, assigneeId: "u7", sprintNum: 1, status: "Completed" },
    { workspaceCode: "CPM", idShort: "304", title: "Create initial mobile-responsive React routing structure", type: "story", priority: "medium", points: 5, assigneeId: "u8", sprintNum: 2, status: "Completed" },
    { workspaceCode: "CPM", idShort: "305", title: "Build secure login web UI with styling guidelines", type: "story", priority: "high", points: 3, assigneeId: "u8", sprintNum: 2, status: "Completed" },
    { workspaceCode: "CPM", idShort: "306", title: "Integrate TOTP (Time-based OTP) core algorithm", type: "task", priority: "high", points: 3, assigneeId: "u7", sprintNum: 2, status: "Completed" },
    { workspaceCode: "CPM", idShort: "307", title: "Conduct user experience testing on legacy portal", type: "spike", priority: "low", points: 2, assigneeId: "u5", sprintNum: 1, status: "Completed" },
    
    // CPM Current sprint (Sprint 5)
    { workspaceCode: "CPM", idShort: "308", title: "Build balance portlet API integration layer", type: "story", priority: "high", points: 5, assigneeId: "u8", sprintNum: 3, status: "Completed" },
    { workspaceCode: "CPM", idShort: "309", title: "Design and code MFA recovery code modal interface", type: "story", priority: "high", points: 3, assigneeId: "u4", sprintNum: 5, status: "In Progress" },
    { workspaceCode: "CPM", idShort: "310", title: "Configure Redis caching cluster for session queries", type: "task", priority: "medium", points: 5, assigneeId: "u6", sprintNum: 5, status: "In Progress" },
    { workspaceCode: "CPM", idShort: "311", title: "Verify WCAG AA accessibility compliance on login pages", type: "task", priority: "medium", points: 2, assigneeId: "u10", sprintNum: 5, status: "In Review" },
    { workspaceCode: "CPM", idShort: "312", title: "Fix vulnerability in OAuth package callback handler", type: "bug", priority: "highest", points: 3, assigneeId: "u7", sprintNum: 5, status: "In Progress" },
    { workspaceCode: "CPM", idShort: "313", title: "Write API endpoint documentation in Swagger format", type: "task", priority: "low", points: 2, assigneeId: "u5", sprintNum: 5, status: "Completed" },
    { workspaceCode: "CPM", idShort: "314", title: "Fix layout breakage in dashboard on Safari 15", type: "bug", priority: "medium", points: 1, assigneeId: "u26", sprintNum: 5, status: "Completed" },

    // CPM Upcoming sprints & backlog
    { workspaceCode: "CPM", idShort: "315", title: "Deploy initial alpha build to staging environment", type: "task", priority: "high", points: 5, assigneeId: "u6", sprintNum: 6, status: "Todo" },
    { workspaceCode: "CPM", idShort: "316", title: "Implement dark mode theme selectors", type: "story", priority: "lowest", points: 3, assigneeId: "u42", sprintNum: 6, status: "Todo" },
    { workspaceCode: "CPM", idShort: "317", title: "Setup automated end-to-end testing with Playwright", type: "task", priority: "medium", points: 8, assigneeId: "u31", sprintNum: 7, status: "Todo" },
    { workspaceCode: "CPM", idShort: "318", title: "Integrate Twilio SMS MFA channel alternative", type: "story", priority: "medium", points: 5, assigneeId: "u8", sprintNum: 7, status: "Todo" },
    { workspaceCode: "CPM", idShort: "319", title: "Draft executive production release roadmap", type: "task", priority: "medium", points: 3, assigneeId: "u5", status: "Todo" },

    // --- DIGITAL TRANSFORMATION PROGRAM (DTP) ---
    { workspaceCode: "DTP", idShort: "E101", title: "Legacy SAP ERP Database Migration", type: "epic", priority: "highest", points: 13, assigneeId: "u17" },
    { workspaceCode: "DTP", idShort: "E102", title: "Executive Business Intelligence Dashboard Platform", type: "epic", priority: "high", points: 13, assigneeId: "u17" },
    
    { workspaceCode: "DTP", idShort: "F201", title: "Automated ERP Data Extraction Pipeline", type: "feature", priority: "highest", points: 8, assigneeId: "u6", parentShort: "E101" },
    { workspaceCode: "DTP", idShort: "F202", title: "Real-time Sales Revenue Chart Components", type: "feature", priority: "high", points: 8, assigneeId: "u8", parentShort: "E102" },
    { workspaceCode: "DTP", idShort: "F203", title: "Data Lineage & Delta Lake Schema Sync", type: "feature", priority: "medium", points: 5, assigneeId: "u7", parentShort: "E101" },

    { workspaceCode: "DTP", idShort: "301", title: "Map out legacy customer records table structures", type: "spike", priority: "high", points: 3, assigneeId: "u5", sprintNum: 1, status: "Completed" },
    { workspaceCode: "DTP", idShort: "302", title: "Configure Apache Airflow scheduler variables", type: "task", priority: "medium", points: 2, assigneeId: "u6", sprintNum: 1, status: "Completed" },
    { workspaceCode: "DTP", idShort: "303", title: "Build ETL extraction scripts for customer sales history", type: "story", priority: "high", points: 8, assigneeId: "u7", sprintNum: 2, status: "Completed" },
    { workspaceCode: "DTP", idShort: "304", title: "Validate 10M record transfer counts against hash-checks", type: "task", priority: "high", points: 5, assigneeId: "u10", sprintNum: 2, status: "Completed" },
    { workspaceCode: "DTP", idShort: "305", title: "Build foundational SQL views for sales reporting", type: "task", priority: "medium", points: 3, assigneeId: "u27", sprintNum: 3, status: "Completed" },
    { workspaceCode: "DTP", idShort: "306", title: "Implement multi-series layout for executive charts", type: "story", priority: "high", points: 5, assigneeId: "u8", sprintNum: 3, status: "Completed" },
    
    // DTP Active (Sprint 5) - Behind Schedule! Let's make expectations high but actual progress low so it calculates as OFF TRACK!
    { workspaceCode: "DTP", idShort: "307", title: "Draft final ERP mapping handbook of tables", type: "task", priority: "low", points: 2, assigneeId: "u5", sprintNum: 4, status: "Completed" },
    { workspaceCode: "DTP", idShort: "308", title: "Debug Airflow memory-drain on multi-join ETL", type: "bug", priority: "highest", points: 5, assigneeId: "u6", sprintNum: 5, status: "In Progress" },
    { workspaceCode: "DTP", idShort: "309", title: "Implement incremental sync for Salesforce pipelines", type: "story", priority: "high", points: 8, assigneeId: "u7", sprintNum: 5, status: "In Progress" },
    { workspaceCode: "DTP", idShort: "310", title: "Optimize complex postgresql dashboard aggregation query", type: "task", priority: "high", points: 5, assigneeId: "u27", sprintNum: 5, status: "In Progress" },
    { workspaceCode: "DTP", idShort: "311", title: "Create custom date range picker on executive portal", type: "story", priority: "medium", points: 3, assigneeId: "u8", sprintNum: 5, status: "Todo" },
    { workspaceCode: "DTP", idShort: "312", title: "Test reporting layout on older tablet touchscreens", type: "task", priority: "low", points: 2, assigneeId: "u10", sprintNum: 5, status: "Todo" },
    { workspaceCode: "DTP", idShort: "313", title: "Create PII column-level encryption keys in cloud", type: "task", priority: "highest", points: 5, assigneeId: "u28", sprintNum: 5, status: "In Review" },

    // DTP Upcoming & backlog
    { workspaceCode: "DTP", idShort: "314", title: "Connect ERP inventory pipeline to live UI portal", type: "story", priority: "high", points: 8, assigneeId: "u8", sprintNum: 6, status: "Todo" },
    { workspaceCode: "DTP", idShort: "315", title: "Build customer loyalty segment filter tags", type: "story", priority: "medium", points: 5, assigneeId: "u5", sprintNum: 6, status: "Todo" },
    { workspaceCode: "DTP", idShort: "316", title: "Conduct full regression test on staging environment", type: "task", priority: "high", points: 8, assigneeId: "u31", sprintNum: 7, status: "Todo" },
    { workspaceCode: "DTP", idShort: "317", title: "Formulate user training manuals for business managers", type: "task", priority: "low", points: 3, assigneeId: "u33", status: "Todo" },

    // --- DATA LAKE IMPLEMENTATION (DLI) ---
    { workspaceCode: "DLI", idShort: "E101", title: "Lambda ETL Cloud Lake Architecture", type: "epic", priority: "highest", points: 13, assigneeId: "u18" },
    { workspaceCode: "DLI", idShort: "E102", title: "Data Governance Security & Access Controls", type: "epic", priority: "high", points: 13, assigneeId: "u18" },

    { workspaceCode: "DLI", idShort: "F201", title: "Spark Streaming Consumer Pipeline", type: "feature", priority: "high", points: 8, assigneeId: "u6", parentShort: "E101" },
    { workspaceCode: "DLI", idShort: "F202", title: "PII Detection & Row masking filters", type: "feature", priority: "highest", points: 8, assigneeId: "u3", parentShort: "E102" },

    { workspaceCode: "DLI", idShort: "301", title: "Write initial Terraform scripts for S3 buckets", type: "task", priority: "medium", points: 3, assigneeId: "u6", sprintNum: 1, status: "Completed" },
    { workspaceCode: "DLI", idShort: "302", title: "Configure secure VPC peering for database servers", type: "task", priority: "high", points: 2, assigneeId: "u9", sprintNum: 1, status: "Completed" },
    { workspaceCode: "DLI", idShort: "303", title: "Prototype Spark streaming consumer in PySpark", type: "spike", priority: "high", points: 5, assigneeId: "u32", sprintNum: 2, status: "Completed" },
    { workspaceCode: "DLI", idShort: "304", title: "Optimize partitions on parquet raw folder logs", type: "task", priority: "medium", points: 3, assigneeId: "u32", sprintNum: 2, status: "Completed" },
    { workspaceCode: "DLI", idShort: "305", title: "Set up AWS Glue catalog schemas crawler definitions", type: "task", priority: "medium", points: 3, assigneeId: "u9", sprintNum: 2, status: "Completed" },
    
    // DLI Active (Sprint 5) - Ahead of schedule (completed count is high, expects are mid)
    { workspaceCode: "DLI", idShort: "306", title: "Configure Apache Ranger security matrix tables", type: "story", priority: "high", points: 5, assigneeId: "u9", sprintNum: 3, status: "Completed" },
    { workspaceCode: "DLI", idShort: "307", title: "Build regex-based PII column identification script", type: "task", priority: "high", points: 3, assigneeId: "u38", sprintNum: 3, status: "Completed" },
    { workspaceCode: "DLI", idShort: "308", title: "Fix schema registry mismatch crash on nested JSONs", type: "bug", priority: "highest", points: 3, assigneeId: "u6", sprintNum: 5, status: "Completed" },
    { workspaceCode: "DLI", idShort: "309", title: "Implement parquet metadata compaction utility script", type: "task", priority: "medium", points: 5, assigneeId: "u36", sprintNum: 5, status: "In Progress" },
    { workspaceCode: "DLI", idShort: "310", title: "Verify masking performance on 1M record batch run", type: "task", priority: "medium", points: 3, assigneeId: "u38", sprintNum: 5, status: "In Review" },
    { workspaceCode: "DLI", idShort: "311", title: "Optimize Glue cluster trigger parameters cost metrics", type: "task", priority: "low", points: 2, assigneeId: "u9", sprintNum: 5, status: "In Progress" },
    { workspaceCode: "DLI", idShort: "312", title: "Draft Spark failure alert webhook configurations", type: "task", priority: "low", points: 1, assigneeId: "u39", sprintNum: 5, status: "Todo" },

    // DLI Upcoming & backlog
    { workspaceCode: "DLI", idShort: "313", title: "Verify compliance of audit table rows with security", type: "task", priority: "medium", points: 5, assigneeId: "u3", sprintNum: 6, status: "Todo" },
    { workspaceCode: "DLI", idShort: "314", title: "Write production deployment runbook documentation", type: "task", priority: "low", points: 3, assigneeId: "u5", sprintNum: 7, status: "Todo" },

    // --- CUSTOMER RELATIONSHIP PLATFORM (CRP) ---
    { workspaceCode: "CRP", idShort: "E101", title: "Enterprise Lead Funnel Pipelines Flow", type: "epic", priority: "high", points: 13, assigneeId: "u20" },
    { workspaceCode: "CRP", idShort: "E102", title: "Mailchimp and CRM Interaction Synchronization", type: "epic", priority: "medium", points: 13, assigneeId: "u20" },

    { workspaceCode: "CRP", idShort: "F201", title: "Interactive Drag & Drop Leads Board", type: "feature", priority: "medium", points: 8, assigneeId: "u8", parentShort: "E101" },
    { workspaceCode: "CRP", idShort: "F202", title: "OAuth Contact Sync & Sync Handler", type: "feature", priority: "medium", points: 5, assigneeId: "u7", parentShort: "E102" },

    { workspaceCode: "CRP", idShort: "301", title: "Draw CRM model relationship entity diagrams", type: "task", priority: "low", points: 2, assigneeId: "u5", sprintNum: 1, status: "Completed" },
    { workspaceCode: "CRP", idShort: "302", title: "Build React lead opportunity custom card design", type: "story", priority: "medium", points: 3, assigneeId: "u8", sprintNum: 1, status: "Completed" },
    { workspaceCode: "CRP", idShort: "303", title: "Write contact search and filter logic by segment", type: "story", priority: "high", points: 5, assigneeId: "u8", sprintNum: 2, status: "Completed" },
    { workspaceCode: "CRP", idShort: "304", title: "Connect to Mailchimp subscriber update webhooks", type: "story", priority: "medium", points: 5, assigneeId: "u29", sprintNum: 2, status: "Completed" },

    // CRP Active (Sprint 5) - At Risk (slightly behind elapsed expectation)
    { workspaceCode: "CRP", idShort: "305", title: "Design Mailchimp API credentials verification flow", type: "task", priority: "medium", points: 2, assigneeId: "u7", sprintNum: 3, status: "Completed" },
    { workspaceCode: "CRP", idShort: "306", title: "Build contacts automated deduplication logic algorithm", type: "task", priority: "high", points: 5, assigneeId: "u5", sprintNum: 5, status: "In Progress" },
    { workspaceCode: "CRP", idShort: "307", title: "Add drag-over columns styling feedback on board UI", type: "story", priority: "low", points: 3, assigneeId: "u4", sprintNum: 5, status: "In Progress" },
    { workspaceCode: "CRP", idShort: "308", title: "Write unit tests for MailChimp subscriber payload parser", type: "task", priority: "low", points: 3, assigneeId: "u31", sprintNum: 5, status: "In Review" },
    { workspaceCode: "CRP", idShort: "309", title: "Debug lead board scrolling freeze on mobile sizes", type: "bug", priority: "high", points: 3, assigneeId: "u34", sprintNum: 5, status: "In Progress" },
    { workspaceCode: "CRP", idShort: "310", title: "Integrate customer tag filters inside CRM workspace", type: "story", priority: "medium", points: 5, assigneeId: "u35", sprintNum: 5, status: "Todo" },

    // CRP Upcoming & Backlog
    { workspaceCode: "CRP", idShort: "311", title: "Migrate CRM contacts list to unified cloud schemas", type: "task", priority: "high", points: 8, assigneeId: "u7", sprintNum: 6, status: "Todo" },
    { workspaceCode: "CRP", idShort: "312", title: "Develop automated PDF reports scheduler system", type: "story", priority: "medium", points: 5, assigneeId: "u30", status: "Todo" },

    // --- MOBILE BANKING UPGRADE (MBU) ---
    { workspaceCode: "MBU", idShort: "E101", title: "iOS & Android Biometric Security Integration", type: "epic", priority: "highest", points: 13, assigneeId: "u22" },
    { workspaceCode: "MBU", idShort: "E102", title: "QR Code Scanning peer-to-peer payments ecosystem", type: "epic", priority: "high", points: 13, assigneeId: "u22" },

    { workspaceCode: "MBU", idShort: "F201", title: "Biometric authentication toggles UI & keychain secure store", type: "feature", priority: "high", points: 8, assigneeId: "u4", parentShort: "E101" },
    { workspaceCode: "MBU", idShort: "F202", title: "Payment Scanner overlay engine", type: "feature", priority: "medium", points: 8, assigneeId: "u43", parentShort: "E102" },

    { workspaceCode: "MBU", idShort: "301", title: "Review Apple Keychain and secure enclave accessibility", type: "spike", priority: "high", points: 2, assigneeId: "u5", sprintNum: 1, status: "Completed" },
    { workspaceCode: "MBU", idShort: "302", title: "Setup React Native LocalAuthentication bridging layer", type: "task", priority: "high", points: 5, assigneeId: "u37", sprintNum: 1, status: "Completed" },
    { workspaceCode: "MBU", idShort: "303", title: "Code biometric validation logic fallback flow", type: "story", priority: "medium", points: 5, assigneeId: "u44", sprintNum: 2, status: "Completed" },

    // MBU Active (Sprint 5) - Active progress
    { workspaceCode: "MBU", idShort: "304", title: "Build QR payments camera overlay scanner viewfinder UI", type: "story", priority: "high", points: 3, assigneeId: "u4", sprintNum: 3, status: "Completed" },
    { workspaceCode: "MBU", idShort: "305", title: "Implement peer-to-peer transfer limit validations helper", type: "task", priority: "high", points: 5, assigneeId: "u37", sprintNum: 5, status: "In Progress" },
    { workspaceCode: "MBU", idShort: "306", title: "Write native Android face-decryption bridge code", type: "task", priority: "high", points: 8, assigneeId: "u44", sprintNum: 5, status: "In Progress" },
    { workspaceCode: "MBU", idShort: "307", title: "Integrate peer-to-peer security PIN confirmation page", type: "story", priority: "medium", points: 5, assigneeId: "u40", sprintNum: 5, status: "In Progress" },
    { workspaceCode: "MBU", idShort: "308", title: "Fix QR camera preview lockup on navigation switches", type: "bug", priority: "highest", points: 3, assigneeId: "u6", sprintNum: 5, status: "In Review" },
    { workspaceCode: "MBU", idShort: "309", title: "Design custom receipts templates for transfer success", type: "story", priority: "low", points: 2, assigneeId: "u43", sprintNum: 5, status: "Todo" },

    // MBU Upcoming & backlog
    { workspaceCode: "MBU", idShort: "310", title: "Audit security logs encryption keys inside device", type: "task", priority: "highest", points: 5, assigneeId: "u10", sprintNum: 6, status: "Todo" },
    { workspaceCode: "MBU", idShort: "311", title: "Conduct full load testing on transaction APIs", type: "task", priority: "high", points: 8, assigneeId: "u6", sprintNum: 6, status: "Todo" },
    { workspaceCode: "MBU", idShort: "312", title: "Create push notifications system on transaction success", type: "story", priority: "medium", points: 5, assigneeId: "u37", sprintNum: 7, status: "Todo" }
  ];

  // Programmatic filler to reach 100+ items across the 5 workspaces
  const fillerTopics = [
    { title: "Refactor legacy telemetry queries to enhance speed", type: "task", priority: "medium", points: 3 },
    { title: "Review pull requests from contract development team", type: "task", priority: "low", points: 1 },
    { title: "Verify automated test suite code coverage indexes", type: "task", priority: "medium", points: 2 },
    { title: "Create user stories documentation for next phase release", type: "story", priority: "medium", points: 5 },
    { title: "Investigate database query timeouts on staging", type: "spike", priority: "high", points: 3 },
    { title: "Investigate performance bottleneck on heavy batch load", type: "spike", priority: "medium", points: 2 }
  ];

  workspaces.forEach((w) => {
    fillerTopics.forEach((topic, index) => {
      const sprintNumVal = (index % 3) + 5; // sprint 5, 6, 7
      rawTemplates.push({
        workspaceCode: w.code,
        idShort: `FILL-${index + 500}`,
        title: `${topic.title} (${w.code})`,
        type: topic.type as IssueType,
        priority: topic.priority as Priority,
        points: topic.points,
        assigneeId: w.memberIds[index % w.memberIds.length],
        sprintNum: sprintNumVal,
        status: "Todo"
      });
    });
  });

  const generateRid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  rawTemplates.forEach((tmp) => {
    const parentId = tmp.parentShort ? `${tmp.workspaceCode}-${tmp.parentShort}` : undefined;
    const sprintId = tmp.sprintNum ? `S-${tmp.workspaceCode}-${tmp.sprintNum}` : undefined;
    const id = `${tmp.workspaceCode}-${tmp.idShort}`;
    
    let finalStatus = tmp.status || "Todo";
    if (!tmp.status) {
      if (sprintId) {
        const sprintObj = sprints.find(s => s.id === sprintId);
        if (sprintObj?.state === "completed") {
          finalStatus = "Completed";
        } else if (sprintObj?.state === "active") {
          const rand = Math.random();
          finalStatus = rand < 0.3 ? "In Progress" : rand < 0.5 ? "In Review" : rand < 0.75 ? "Completed" : "Todo";
        }
      }
    }

    const estHr = tmp.points * 6;
    const remHr = finalStatus === "Completed" ? 0 : Math.round(estHr * 0.7);

    const comments: Comment[] = [];
    if (finalStatus !== "Todo") {
      comments.push({
        id: generateRid("CMT"),
        authorId: "u5",
        body: `Initial analysis complete. Looks like estimation is consistent. @${DIRECTORY.find(p => p.id === tmp.assigneeId)?.name || "assignee"} let's review this.`,
        createdAt: "2026-06-10T12:00:00Z"
      });
    }
    if (finalStatus === "Completed") {
      comments.push({
        id: generateRid("CMT"),
        authorId: tmp.assigneeId,
        body: `Completed all requirements and tested locally. Verified on staging.`,
        createdAt: "2026-06-12T15:30:00Z"
      });
    }

    const worklogs: Worklog[] = [];
    if (finalStatus === "Completed" || finalStatus === "In Progress" || finalStatus === "In Review") {
      if (finalStatus === "Completed") {
        worklogs.push({
          id: generateRid("WL"),
          userId: tmp.assigneeId,
          date: "2026-06-12",
          hours: Math.max(1, Math.round(estHr / 2)),
          comment: "Initial layout and test scripts"
        });
        worklogs.push({
          id: generateRid("WL"),
          userId: tmp.assigneeId,
          date: "2026-06-15",
          hours: Math.max(1, estHr - Math.max(1, Math.round(estHr / 2))),
          comment: "Core integration complete, ran test suites"
        });
      } else {
        worklogs.push({
          id: generateRid("WL"),
          userId: tmp.assigneeId,
          date: "2026-06-16",
          hours: 4,
          comment: "Developing active controller methods"
        });
        worklogs.push({
          id: generateRid("WL"),
          userId: tmp.assigneeId,
          date: "2026-06-15",
          hours: 4,
          comment: "Database setup and schema connection verification"
        });
      }
    }

    const activity: Activity[] = [
      { id: generateRid("ACT"), type: "created", actorId: "u2", at: "2026-06-01T09:00:00Z", text: "Created task" }
    ];
    if (tmp.assigneeId) {
      activity.push({
        id: generateRid("ACT"),
        type: "assignee",
        actorId: "u2",
        at: "2026-06-01T10:00:00Z",
        text: `Assigned to ${DIRECTORY.find(p => p.id === tmp.assigneeId)?.name || tmp.assigneeId}`
      });
    }
    if (finalStatus !== "Todo") {
      activity.push({
        id: generateRid("ACT"),
        type: "status",
        actorId: tmp.assigneeId,
        at: "2026-06-11T14:00:00Z",
        text: `Changed status to ${finalStatus}`
      });
    }

    const dependencyRisks: DependencyRisk[] = [];
    if (tmp.idShort === "309" && tmp.workspaceCode === "CPM") {
      dependencyRisks.push({
        id: `DR-CPM-1`,
        workspaceCode: "CPM",
        itemId: id,
        type: "Risk",
        title: "Delay in TwinEngine authentication verification key delivery",
        description: "The authentication engine key delivery from the third-party security auditor is delayed by 4 business days.",
        impactLevel: "Critical",
        status: "Open",
        ownerId: "u8",
        createdAt: "2026-06-02T10:00:00Z"
      });
    }
    if (tmp.idShort === "308" && tmp.workspaceCode === "DTP") {
      dependencyRisks.push({
        id: `DR-DTP-1`,
        workspaceCode: "DTP",
        itemId: id,
        type: "Dependency",
        title: "Database server capacity allocation by central IT",
        description: "Requires central infrastructure team to map virtual networks and provision memory before testing the ETL pipelines.",
        impactLevel: "Blocker",
        status: "Open",
        ownerId: "u6",
        createdAt: "2026-06-01T10:00:00Z"
      });
    }
    if (tmp.idShort === "307" && tmp.workspaceCode === "MBU") {
      dependencyRisks.push({
        id: `DR-MBU-1`,
        workspaceCode: "MBU",
        itemId: id,
        type: "Risk",
        title: "AppStore biometric validation policy change",
        description: "Apple might release updated rules for biometric security descriptors in European Union, forcing security policy updates.",
        impactLevel: "Medium",
        status: "Open",
        ownerId: "u40",
        createdAt: "2026-06-05T10:00:00Z"
      });
    }
    if (tmp.idShort === "306" && tmp.workspaceCode === "CRP") {
      dependencyRisks.push({
        id: `DR-CRP-1`,
        workspaceCode: "CRP",
        itemId: id,
        type: "Dependency",
        title: "Mailchimp subscriber endpoint access approval",
        description: "Needs client marketing team to approve production Mailchimp keys sandbox access.",
        impactLevel: "High",
        status: "In Progress",
        ownerId: "u29",
        createdAt: "2026-06-05T10:00:00Z"
      });
    }

    items.push({
      id,
      workspaceCode: tmp.workspaceCode,
      title: tmp.title,
      type: tmp.type,
      priority: tmp.priority,
      status: finalStatus as any,
      sprintId,
      parentId,
      points: tmp.points,
      assigneeId: tmp.assigneeId,
      reporterId: "u2",
      estimateHours: estHr,
      remainingHours: remHr,
      team: tmp.workspaceCode === "CPM" ? "Core Tech Squad" : tmp.workspaceCode === "DTP" ? "Enterprise Analytics" : "Platform Architect Group",
      releaseVersion: "v1.4.0",
      createdAt: "2026-06-01T08:00:00Z",
      comments,
      activity,
      worklogs,
      dependencyRisks
    });
  });

  const folders: DocumentFolder[] = [];
  const documents: ProjectDocument[] = [];

  workspaces.forEach((w) => {
    const f1Id = `FLD-${w.code}-1`;
    const f2Id = `FLD-${w.code}-2`;
    const f3Id = `FLD-${w.code}-3`;

    folders.push(
      { id: f1Id, workspaceCode: w.code, name: "User Stories", parentId: null, createdAt: "2026-06-01T08:00:00Z" },
      { id: f2Id, workspaceCode: w.code, name: "MOM (Minutes of Meeting)", parentId: null, createdAt: "2026-06-01T08:00:00Z" },
      { id: f3Id, workspaceCode: w.code, name: "Release Notes", parentId: null, createdAt: "2026-06-01T08:00:00Z" }
    );

    documents.push(
      {
        id: `DOC-${w.code}-1`,
        workspaceCode: w.code,
        name: "Business Requirement Document (BRD).pdf",
        type: "pdf",
        folderId: f1Id,
        size: 215420,
        versions: [{ version: 1, name: "Business Requirement Document (BRD).pdf", url: "#", size: 215420, uploadedBy: "pmo@beinex.com", uploadedAt: "2026-06-01T09:00:00Z" }],
        associations: [{ type: "feature", id: `${w.code}-F201`, title: "Unified Ingestion Pipelines" }],
        createdBy: "portfolio@beinex.com",
        createdAt: "2026-06-01T09:00:00Z",
        lastModifiedBy: "portfolio@beinex.com",
        lastModifiedAt: "2026-06-01T09:00:00Z",
        viewCount: 35
      },
      {
        id: `DOC-${w.code}-2`,
        workspaceCode: w.code,
        name: "Technical Architecture Specs.docx",
        type: "docx",
        folderId: f1Id,
        size: 98320,
        versions: [{ version: 1, name: "Technical Architecture Specs.docx", url: "#", size: 98320, uploadedBy: "pmo@beinex.com", uploadedAt: "2026-06-02T10:00:00Z" }],
        associations: [{ type: "epic", id: `${w.code}-E101`, title: "Epic Spec Outline" }],
        createdBy: "pm@beinex.com",
        createdAt: "2026-06-02T10:00:00Z",
        lastModifiedBy: "pm@beinex.com",
        lastModifiedAt: "2026-06-02T10:00:00Z",
        viewCount: 14
      },
      {
        id: `DOC-${w.code}-3`,
        workspaceCode: w.code,
        name: "Sprint 5 Execution Plan.xlsx",
        type: "xlsx",
        folderId: f2Id,
        size: 45800,
        versions: [{ version: 1, name: "Sprint 5 Execution Plan.xlsx", url: "#", size: 45800, uploadedBy: "pm@beinex.com", uploadedAt: "2026-06-15T09:00:00Z" }],
        associations: [],
        createdBy: "pm@beinex.com",
        createdAt: "2026-06-15T09:00:00Z",
        lastModifiedBy: "pm@beinex.com",
        lastModifiedAt: "2026-06-15T09:00:00Z",
        viewCount: 8
      },
      {
        id: `DOC-${w.code}-4`,
        workspaceCode: w.code,
        name: "Module Security Test Strategy.pdf",
        type: "pdf",
        folderId: f3Id,
        size: 320500,
        versions: [{ version: 1, name: "Module Security Test Strategy.pdf", url: "#", size: 320500, uploadedBy: "admin@beinex.com", uploadedAt: "2026-06-10T11:00:00Z" }],
        associations: [],
        createdBy: "admin@beinex.com",
        createdAt: "2026-06-10T11:00:00Z",
        lastModifiedBy: "admin@beinex.com",
        lastModifiedAt: "2026-06-10T11:00:00Z",
        viewCount: 19
      }
    );
  });

  const strategicGoals: StrategicGoal[] = [
    { id: "SG-1", title: "Enhance Customer Experience (CX) & Portal Self-service", description: "Increase user platform interactions and lower client touchpoints by delivering robust portlet dashboards.", createdAt: "2026-01-01T00:00:00Z" },
    { id: "SG-2", title: "Modernize Core Architecture & Secure Storage Integration", description: "Bypass legacy ledger bottlenecks and set up biometrics, encryption suites, and rapid caching frameworks.", createdAt: "2026-01-01T00:00:00Z" },
    { id: "SG-3", title: "Drive Enterprise Analytics & Data-Driven Reporting", description: "Deliver Snowflake warehouse ingestion channels and construct rich multi-series visual charts.", createdAt: "2026-01-01T00:00:00Z" },
    { id: "SG-4", title: "Strengthen Corporate Cybersecurity & Compliance Standards", description: "Attain WCAG AA accessibility, configure automated audit lists, and ensure PII data masking.", createdAt: "2026-01-01T00:00:00Z" }
  ];

  const discoveryTags: DiscoveryTag[] = [
    { id: "TAG-SEC", name: "Security Gate", color: "blue" },
    { id: "TAG-UX", name: "User Experience", color: "purple" },
    { id: "TAG-CLOUD", name: "Cloud Migration", color: "green" },
    { id: "TAG-DATA", name: "Big Data", color: "orange" },
    { id: "TAG-PAY", name: "Mobile Payments", color: "teal" }
  ];

  const discoveryItems: DiscoveryItem[] = [
    {
      id: "DSC-1",
      title: "Biometric Fingerprint and Facial recognition login",
      description: "Allow clients to securely access bank ledger records with mobile biometric hardware enclaves.",
      problemStatement: "Keypad pincodes represent high validation friction and can be easily skimmed.",
      proposedSolution: "Integrate biometric iOS/Android enclaves with local keychain storage wrappers.",
      businessValue: "Lower support tickets for forgotten passwords by 25%. Strengthen transaction security rating.",
      targetUsers: "Retail banking mobile app clients",
      ownerId: "u22",
      contributors: ["u4", "u37", "u44"],
      priority: "Critical",
      status: "Approved",
      impactScore: 9,
      effortScore: 5,
      goalIds: ["SG-2", "SG-1"],
      tags: ["TAG-SEC", "TAG-UX", "TAG-PAY"],
      linkedWorkspaceCode: "MBU",
      createdAt: "2026-05-22T10:00:00Z",
      updatedAt: "2026-06-01T08:00:00Z"
    },
    {
      id: "DSC-2",
      title: "AI-Powered Predictive Customer Support Chatbot",
      description: "Employ natural language models server-side to respond to standard portal status queries.",
      problemStatement: "The support desk is flooded with client questions about portal transfers that are easily answered with data lookups.",
      proposedSolution: "Interface the portal account database with a secure Gemini support model agent context.",
      businessValue: "Lower call volumes on basic support inquiries by 40% in first 2 months.",
      targetUsers: "New and active corporate clients",
      ownerId: "u4",
      contributors: ["u5", "u7"],
      priority: "High",
      status: "Research",
      impactScore: 9,
      effortScore: 7,
      goalIds: ["SG-1"],
      tags: ["TAG-UX"],
      createdAt: "2026-06-01T10:00:00Z",
      updatedAt: "2026-06-15T12:00:00Z"
    },
    {
      id: "DSC-3",
      title: "Apache Ranger PII Column-level Masking Rules",
      description: "Implement automated data masking of user-identifiable columns (SSN, emails, balances) in central files.",
      problemStatement: "Engineers and contractors currently have full query readability on database backups.",
      proposedSolution: "Inject Apache Ranger row-filter gates during Glue schema crawler cataloging runs.",
      businessValue: "Perfect compliance with GDPR and high-level corporate finance audit specifications.",
      targetUsers: "Internal data analysts and backend engineers",
      ownerId: "u18",
      contributors: ["u6", "u38", "u39"],
      priority: "Critical",
      status: "Validation",
      impactScore: 10,
      effortScore: 6,
      goalIds: ["SG-4", "SG-3"],
      tags: ["TAG-SEC", "TAG-DATA"],
      linkedWorkspaceCode: "DLI",
      createdAt: "2026-05-15T10:00:00Z",
      updatedAt: "2026-06-10T12:00:00Z"
    },
    {
      id: "DSC-4",
      title: "Dynamic executive KPI visualization panels",
      description: "Create structured chart templates displaying sales margins for multi-series reporting.",
      problemStatement: "Corporate managers spend up to 4 hours each friday mapping Excel sheets for board summaries.",
      proposedSolution: "Refactor backend ETL sales tables to auto-refresh and serve dynamic chart arrays.",
      businessValue: "Eliminate manual report compilation completely. Provide immediate actuals visibility.",
      targetUsers: "C-level managers and PMO staff",
      ownerId: "u17",
      contributors: ["u8", "u27"],
      priority: "Medium",
      status: "Delivered",
      impactScore: 8,
      effortScore: 4,
      goalIds: ["SG-3"],
      tags: ["TAG-UX", "TAG-DATA"],
      linkedWorkspaceCode: "DTP",
      createdAt: "2026-02-01T10:00:00Z",
      updatedAt: "2026-05-30T17:00:00Z"
    },
    {
      id: "DSC-5",
      title: "Redundant Customer Records Auto-Deduplication Engine",
      description: "An automated CRM validation routine to identify and merge duplicate leads based on domain matching.",
      problemStatement: "The CRM ledger has 15% duplicate entries, inflating outbound sales emails.",
      proposedSolution: "Write a background server cron that matches leads, compares activity histories, and merges records.",
      businessValue: "Correct outbound logging data. Reduce email service bills.",
      targetUsers: "Outbound sales specialists",
      ownerId: "u20",
      contributors: ["u5", "u29", "u34"],
      priority: "Low",
      status: "In Progress",
      impactScore: 7,
      effortScore: 3,
      goalIds: ["SG-2"],
      tags: ["TAG-DATA"],
      linkedWorkspaceCode: "CRP",
      createdAt: "2026-06-05T10:00:00Z",
      updatedAt: "2026-06-15T14:00:00Z"
    }
  ];

  return {
    workspaces,
    items,
    sprints,
    documents,
    folders,
    strategicGoals,
    discoveryTags,
    discoveryItems
  };
};

const initialStore = (): Store => {
  if (typeof window === "undefined")
    return {
      workspaces: [],
      items: [],
      sprints: [],
      documents: [],
      folders: [],
      discoveryItems: [],
      strategicGoals: [],
      discoveryTags: [],
    };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.workspaces && parsed.workspaces.length > 0 && parsed.workspaces.some((w: any) => w.code === "CPM")) {
        return {
          workspaces: parsed.workspaces || [],
          items: parsed.items || [],
          sprints: parsed.sprints || [],
          documents: parsed.documents || [],
          folders: parsed.folders || [],
          discoveryItems: parsed.discoveryItems || [],
          strategicGoals: parsed.strategicGoals || [],
          discoveryTags: parsed.discoveryTags || [],
        };
      }
    }
  } catch {
    // ignore
  }
  const seeded = createEnterpriseMockData();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  } catch {
    // ignore
  }
  return seeded;
};

const rid = (p: string) =>
  `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const now = () => new Date().toISOString();

interface Ctx {
  store: Store;
  loading: boolean;
  createWorkspace: (w: Omit<Workspace, "createdAt">) => void;
  updateWorkspace: (code: string, patch: Partial<Workspace>) => void;
  deleteWorkspace: (code: string) => void;
  createItem: (item: Omit<BacklogItem, "id" | "order">) => BacklogItem;
  updateItem: (
    id: string,
    patch: Partial<BacklogItem>,
    actorId?: string,
  ) => boolean;
  deleteItem: (id: string) => void;
  moveItem: (id: string, targetSprintId: string | undefined) => void;
  createSprint: (s: Omit<Sprint, "id" | "state" | "leaves">) => Sprint;
  updateSprint: (id: string, patch: Partial<Sprint>) => void;
  startSprint: (id: string) => void;
  completeSprint: (
    id: string,
    stats?: {
      plannedPoints: number;
      completedPoints: number;
      carriedPoints: number;
      completedItemsCount: number;
      carriedItemsCount: number;
      destinationSprintName?: string;
    },
    moveIncompleteToSprintId?: string,
  ) => void;
  deleteSprint: (id: string) => void;
  // task detail extras
  addComment: (
    itemId: string,
    c: Omit<Comment, "id" | "createdAt" | "reactions">,
  ) => void;
  toggleReaction: (
    itemId: string,
    commentId: string,
    emoji: string,
    userId: string,
  ) => void;
  addAcceptance: (itemId: string, text: string) => void;
  updateAcceptance: (itemId: string, acId: string, text: string) => void;
  toggleAcceptance: (itemId: string, acId: string) => void;
  removeAcceptance: (itemId: string, acId: string) => void;
  addLink: (itemId: string, type: LinkType, targetId: string) => void;
  removeLink: (itemId: string, linkId: string) => void;
  addWorklog: (itemId: string, w: Omit<Worklog, "id">) => void;
  addAttachment: (
    itemId: string,
    a: Omit<Attachment, "id" | "uploadedAt" | "version">,
  ) => void;
  removeAttachment: (itemId: string, attId: string) => void;
  addDependencyRisk: (
    itemId: string,
    dr: Omit<DependencyRisk, "id" | "loggedDate" | "closureDate">,
  ) => void;
  updateDependencyRisk: (
    itemId: string,
    drId: string,
    patch: Partial<
      Omit<DependencyRisk, "id" | "loggedDate" | "closureDate">
    > & { status?: "Open" | "In Progress" | "Closed" },
  ) => void;
  removeDependencyRisk: (itemId: string, drId: string) => void;
  seedItemDetails: (itemId: string) => void;

  // Documents and folders
  createFolder: (folder: {
    workspaceCode: string;
    name: string;
    parentId: string | null;
  }) => void;
  renameFolder: (id: string, name: string) => void;
  moveFolder: (id: string, parentId: string | null) => void;
  deleteFolder: (id: string) => void;
  uploadOrUpdateDocument: (
    workspaceCode: string,
    name: string,
    type: string,
    folderId: string | null,
    size: number,
    uploadedBy: string,
    fileContent?: string,
    associations?: ProjectDocument["associations"],
  ) => void;
  createDocument: (doc: {
    workspaceCode: string;
    name: string;
    type: string;
    folderId: string | null;
    content: string;
    createdBy: string;
    associations?: ProjectDocument["associations"];
  }) => void;
  updateDocument: (
    id: string,
    patch: Partial<Omit<ProjectDocument, "versions" | "viewCount">>,
  ) => void;
  deleteDocument: (id: string) => void;
  incrementDocumentView: (id: string) => void;

  // Discovery
  createDiscoveryItem: (
    d: Omit<DiscoveryItem, "id" | "createdAt" | "updatedAt">,
  ) => void;
  updateDiscoveryItem: (id: string, patch: Partial<DiscoveryItem>) => void;
  deleteDiscoveryItem: (id: string) => void;
  createStrategicGoal: (g: Omit<StrategicGoal, "id" | "createdAt">) => void;
  updateStrategicGoal: (id: string, patch: Partial<StrategicGoal>) => void;
  deleteStrategicGoal: (id: string) => void;
  createDiscoveryTag: (t: Omit<DiscoveryTag, "id">) => DiscoveryTag;
  updateDiscoveryTag: (id: string, patch: Partial<DiscoveryTag>) => void;
  deleteDiscoveryTag: (id: string) => void;
}

const StoreContext = createContext<Ctx | null>(null);

function logActivityArr(
  prev: Activity[] | undefined,
  type: ActivityType,
  actorId: string,
  text: string,
): Activity[] {
  const next = [
    ...(prev ?? []),
    { id: rid("ACT"), type, actorId, at: now(), text },
  ];
  return next.slice(-200);
}

export const DEFAULT_ACCEPTANCE_CRITERIA_TEXTS = [
  "KT Delivered",
  "Backend API Done",
  "API Documentation Done",
  "Performance Test Done",
  "Frontend Development Done",
  "Unit Testing Completed",
  "Feature Demo Done",
  "Design Verified",
  "Content Verified",
  "Product Analyst Approved",
  "QA Approved",
];

export function ensureDefaultAcceptanceCriteria(i: BacklogItem): BacklogItem {
  if (i.type === "feature") {
    return { ...i, acceptanceCriteria: [] };
  }
  if (i.type !== "epic" && i.type !== "task") {
    return i;
  }
  const currentCriteria = i.acceptanceCriteria ?? [];
  // For tasks, we might not want to auto-populate default criteria unless specified, but for epic it was there.
  // Actually, the previous code only did this for epic and feature.
  if (i.type === "task") {
    return i;
  }
  const missingTexts = DEFAULT_ACCEPTANCE_CRITERIA_TEXTS.filter(
    (text) => !currentCriteria.some((c) => c.text === text),
  );
  if (missingTexts.length === 0) {
    return i;
  }
  const addedCriteria = missingTexts.map((text, idx) => ({
    id: `AC-def-${idx}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    text,
    done: false,
    isDefault: true,
  }));
  return {
    ...i,
    acceptanceCriteria: [...currentCriteria, ...addedCriteria],
  };
}

export function WorkspaceStoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(initialStore);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const workspaces = parsed.workspaces || [];
        const folders = parsed.folders || [];
        const documents = parsed.documents || [];
        const sprints = parsed.sprints || [];
        const items = parsed.items || [];
        const discoveryItems = parsed.discoveryItems || [];
        const strategicGoals = parsed.strategicGoals || [];
        const discoveryTags = parsed.discoveryTags || [];

        let changed = false;
        const validatedFolders = [...folders];

        // Ensure default folders exist for all workspaces loaded
        workspaces.forEach((w: Workspace) => {
          const workspaceFolders = validatedFolders.filter(
            (f) => f.workspaceCode === w.code,
          );
          const hasUserStories = workspaceFolders.some(
            (f) => f.name.toLowerCase() === "user stories",
          );
          const hasMOM = workspaceFolders.some(
            (f) =>
              f.name.toLowerCase() === "mom" ||
              f.name.toLowerCase() === "mom (minutes of meeting)" ||
              f.name.toLowerCase().includes("minutes of meeting"),
          );
          const hasReleaseNotes = workspaceFolders.some(
            (f) => f.name.toLowerCase() === "release notes",
          );

          if (!hasUserStories) {
            validatedFolders.push({
              id: rid("FLD"),
              workspaceCode: w.code,
              name: "User Stories",
              parentId: null,
              createdAt: new Date().toISOString(),
            });
            changed = true;
          }
          if (!hasMOM) {
            validatedFolders.push({
              id: rid("FLD"),
              workspaceCode: w.code,
              name: "MOM (Minutes of Meeting)",
              parentId: null,
              createdAt: new Date().toISOString(),
            });
            changed = true;
          }
          if (!hasReleaseNotes) {
            validatedFolders.push({
              id: rid("FLD"),
              workspaceCode: w.code,
              name: "Release Notes",
              parentId: null,
              createdAt: new Date().toISOString(),
            });
            changed = true;
          }
        });

        // Seed some starter files into these default folders if we created folders and there are no documents yet
        const nextDocs = [...documents];
        if (nextDocs.length === 0 && validatedFolders.length > 0) {
          // Let's seed some mock documents to give the user a beautiful initial experience as described in instructions
          workspaces.forEach((w: Workspace) => {
            const userStoriesFolder = validatedFolders.find(
              (f) => f.workspaceCode === w.code && f.name === "User Stories",
            );
            const momFolder = validatedFolders.find(
              (f) =>
                f.workspaceCode === w.code &&
                f.name === "MOM (Minutes of Meeting)",
            );
            const releaseNotesFolder = validatedFolders.find(
              (f) => f.workspaceCode === w.code && f.name === "Release Notes",
            );

            const nowStr = new Date().toISOString();

            if (userStoriesFolder) {
              nextDocs.push({
                id: rid("DOC"),
                workspaceCode: w.code,
                name: "Login User Story.docx",
                type: "docx",
                folderId: userStoriesFolder.id,
                size: 24576,
                versions: [
                  {
                    version: 1,
                    name: "Login User Story.docx",
                    url: "https://example.com/login_story_v1.docx",
                    size: 24576,
                    uploadedBy: "robinfrancisadr@gmail.com",
                    uploadedAt: nowStr,
                  },
                ],
                associations: [
                  { type: "story", id: `${w.code}-101`, title: "Login Flow" },
                ],
                createdBy: "robinfrancisadr@gmail.com",
                createdAt: nowStr,
                lastModifiedBy: "robinfrancisadr@gmail.com",
                lastModifiedAt: nowStr,
                viewCount: 15,
              });
              nextDocs.push({
                id: rid("DOC"),
                workspaceCode: w.code,
                name: "Authentication Flow.pdf",
                type: "pdf",
                folderId: userStoriesFolder.id,
                size: 154200,
                versions: [
                  {
                    version: 1,
                    name: "Authentication Flow.pdf",
                    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    size: 154200,
                    uploadedBy: "robinfrancisadr@gmail.com",
                    uploadedAt: nowStr,
                  },
                ],
                associations: [
                  {
                    type: "feature",
                    id: `${w.code}-102`,
                    title: "Authentication Module",
                  },
                ],
                createdBy: "robinfrancisadr@gmail.com",
                createdAt: nowStr,
                lastModifiedBy: "robinfrancisadr@gmail.com",
                lastModifiedAt: nowStr,
                viewCount: 22,
              });
            }

            if (momFolder) {
              nextDocs.push({
                id: rid("DOC"),
                workspaceCode: w.code,
                name: "Sprint Planning Meeting.docx",
                type: "docx",
                folderId: momFolder.id,
                size: 31200,
                versions: [
                  {
                    version: 1,
                    name: "Sprint Planning Meeting.docx",
                    url: "https://example.com/planning_v1.docx",
                    size: 31200,
                    uploadedBy: "robinfrancisadr@gmail.com",
                    uploadedAt: nowStr,
                  },
                ],
                associations: [],
                createdBy: "robinfrancisadr@gmail.com",
                createdAt: nowStr,
                lastModifiedBy: "robinfrancisadr@gmail.com",
                lastModifiedAt: nowStr,
                viewCount: 8,
              });
              nextDocs.push({
                id: rid("DOC"),
                workspaceCode: w.code,
                name: "Retrospective Meeting.docx",
                type: "docx",
                folderId: momFolder.id,
                size: 28900,
                versions: [
                  {
                    version: 1,
                    name: "Retrospective Meeting.docx",
                    url: "https://example.com/retro_v1.docx",
                    size: 28900,
                    uploadedBy: "robinfrancisadr@gmail.com",
                    uploadedAt: nowStr,
                  },
                ],
                associations: [],
                createdBy: "robinfrancisadr@gmail.com",
                createdAt: nowStr,
                lastModifiedBy: "robinfrancisadr@gmail.com",
                lastModifiedAt: nowStr,
                viewCount: 12,
              });
            }

            if (releaseNotesFolder) {
              nextDocs.push({
                id: rid("DOC"),
                workspaceCode: w.code,
                name: "Release v1.0.pdf",
                type: "pdf",
                folderId: releaseNotesFolder.id,
                size: 450000,
                versions: [
                  {
                    version: 1,
                    name: "Release v1.0.pdf",
                    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    size: 450000,
                    uploadedBy: "robinfrancisadr@gmail.com",
                    uploadedAt: nowStr,
                  },
                ],
                associations: [],
                createdBy: "robinfrancisadr@gmail.com",
                createdAt: nowStr,
                lastModifiedBy: "robinfrancisadr@gmail.com",
                lastModifiedAt: nowStr,
                viewCount: 4,
              });
            }
          });
          changed = true;
        }

        setStore({
          workspaces,
          items,
          sprints,
          documents: nextDocs,
          folders: validatedFolders,
          discoveryItems,
          strategicGoals,
          discoveryTags,
        });
      } else {
        const seeded = initialStore();
        setStore(seeded);
      }
    } catch (e) {
      console.error("Failed to load store", e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // ignore
    }
  }, [store, isLoaded]);

  const value = useMemo<Ctx>(
    () => ({
      store,
      loading: !isLoaded,
      createWorkspace: (w) =>
        setStore((s) => {
          const workspaceCode = w.code;
          const userStoriesFldId = rid("FLD");
          const momFldId = rid("FLD");
          const releaseNotesFldId = rid("FLD");

          const newFolders: DocumentFolder[] = [
            {
              id: userStoriesFldId,
              workspaceCode,
              name: "User Stories",
              parentId: null,
              createdAt: new Date().toISOString(),
            },
            {
              id: momFldId,
              workspaceCode,
              name: "MOM (Minutes of Meeting)",
              parentId: null,
              createdAt: new Date().toISOString(),
            },
            {
              id: releaseNotesFldId,
              workspaceCode,
              name: "Release Notes",
              parentId: null,
              createdAt: new Date().toISOString(),
            },
          ];

          return {
            ...s,
            workspaces: [
              ...s.workspaces,
              { ...w, createdAt: new Date().toISOString() },
            ],
            folders: [...(s.folders || []), ...newFolders],
          };
        }),
      updateWorkspace: (code, patch) =>
        setStore((s) => ({
          ...s,
          workspaces: s.workspaces.map((w) =>
            w.code === code ? { ...w, ...patch } : w,
          ),
        })),
      deleteWorkspace: (code) =>
        setStore((s) => ({
          ...s,
          workspaces: s.workspaces.filter((w) => w.code !== code),
          items: s.items.filter((i) => i.workspaceCode !== code),
          sprints: s.sprints.filter((sp) => sp.workspaceCode !== code),
          documents: s.documents.filter((d) => d.workspaceCode !== code),
          folders: s.folders.filter((f) => f.workspaceCode !== code),
        })),
      createItem: (item) => {
        let newItem: BacklogItem = {
          ...item,
          estimateHours: item.budgetHours ?? item.estimateHours,
          id: `${item.workspaceCode}-${Math.floor(Math.random() * 900 + 100)}`,
          order: Date.now(),
          activity: [
            {
              id: rid("ACT"),
              type: "created",
              actorId: item.assigneeId ?? "u1",
              at: now(),
              text: "created this item",
            },
          ],
        };
        newItem = ensureDefaultAcceptanceCriteria(newItem);
        setStore((s) => ({ ...s, items: [...s.items, newItem] }));

        checkOverallocation(store.sprints, store.items, newItem);

        return newItem;
      },
      updateItem: (id, patch, actorId = "u1") => {
        if (patch.status === "Completed") {
          const item = store.items.find((i) => i.id === id);
          if (item) {
            const subtasks = store.items.filter((i) => i.parentId === id);
            const hasIncompleteSubtasks = subtasks.some(
              (st) => st.status !== "Completed",
            );

            const currentItem = store.items.find((i) => i.id === id);

            if (hasIncompleteSubtasks && currentItem?.type !== "feature") {
              toast.warning("Cannot Complete Task", {
                description:
                  "This task has incomplete subtasks. Complete all associated subtasks before marking the parent task as Completed.",
              });
              return false;
            }

            if (item.type === "epic" || item.type === "feature") {
              const acs = item.acceptanceCriteria ?? [];
              if (acs.some((a) => !a.done)) {
                toast.warning(
                  "Unable to complete this item. Please ensure all acceptance criteria are marked as complete.",
                );
                return false;
              }
            }
          }
        }

        setStore((s) => {
          let updatedItems = s.items.map((i) => {
            if (i.id !== id) return i;
            let next: BacklogItem = { ...i, ...patch };
            if (patch.budgetHours !== undefined) {
              next.estimateHours = patch.budgetHours;
            }
            if (
              next.type === "epic" ||
              next.type === "task" ||
              next.type === "feature"
            ) {
              next = ensureDefaultAcceptanceCriteria(next);
            }
            let activity = i.activity;
            if (patch.status && patch.status !== i.status) {
              activity = logActivityArr(
                activity,
                "status",
                actorId,
                `changed status from ${i.status} to ${patch.status}`,
              );
            }
            if ("assigneeId" in patch && patch.assigneeId !== i.assigneeId) {
              const name =
                DIRECTORY.find((d) => d.id === patch.assigneeId)?.name ??
                "Unassigned";
              activity = logActivityArr(
                activity,
                "assignee",
                actorId,
                `assigned to ${name}`,
              );
            }
            if ("sprintId" in patch && patch.sprintId !== i.sprintId) {
              activity = logActivityArr(
                activity,
                "sprint",
                actorId,
                patch.sprintId ? `moved to sprint` : `moved to backlog`,
              );
            }
            next.activity = activity;
            return next;
          });

          if (patch.status === "Completed") {
            const currentItem = updatedItems.find((i) => i.id === id);
            if (currentItem && currentItem.parentId) {
              const parent = updatedItems.find(
                (i) => i.id === currentItem.parentId,
              );
              if (parent && parent.type === "feature") {
                const subtasks = updatedItems.filter(
                  (i) => i.parentId === parent.id,
                );
                if (
                  subtasks.length > 0 &&
                  subtasks.every((st) => st.status === "Completed") &&
                  parent.status !== "Completed"
                ) {
                  // Check acceptance criteria if any
                  const acs = parent.acceptanceCriteria ?? [];
                  const canComplete = acs.every((a) => a.done);
                  if (canComplete) {
                    updatedItems = updatedItems.map((i) => {
                      if (i.id === parent.id) {
                        return {
                          ...i,
                          status: "Completed",
                          activity: logActivityArr(
                            i.activity,
                            "status",
                            actorId,
                            `changed status to Completed automatically (all child tasks completed)`,
                          ),
                        };
                      }
                      return i;
                    });
                  }
                }
              }
            }
          }

          return { ...s, items: updatedItems };
        });

        const itemBefore = store.items.find((i) => i.id === id);
        if (itemBefore) {
          const nextItem = { ...itemBefore, ...patch };
          if (patch.budgetHours !== undefined) {
            nextItem.estimateHours = patch.budgetHours;
          }
          if (
            "sprintId" in patch ||
            "assigneeId" in patch ||
            "budgetHours" in patch ||
            "estimateHours" in patch
          ) {
            checkOverallocation(store.sprints, store.items, nextItem);
          }
        }

        return true;
      },
      deleteItem: (id) =>
        setStore((s) => ({ ...s, items: s.items.filter((i) => i.id !== id) })),
      moveItem: (id, targetSprintId) => {
        setStore((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  sprintId: targetSprintId,
                  activity: logActivityArr(
                    i.activity,
                    "sprint",
                    "u1",
                    targetSprintId ? "moved to sprint" : "moved to backlog",
                  ),
                }
              : i,
          ),
        }));

        const itemBefore = store.items.find((i) => i.id === id);
        if (itemBefore) {
          const nextItem = { ...itemBefore, sprintId: targetSprintId };
          checkOverallocation(store.sprints, store.items, nextItem);
        }
      },
      createSprint: (sp) => {
        const newSprint: Sprint = {
          ...sp,
          id: `SPR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          state: "planned",
          leaves: {},
        };
        setStore((s) => ({ ...s, sprints: [...s.sprints, newSprint] }));
        return newSprint;
      },
      updateSprint: (id, patch) =>
        setStore((s) => ({
          ...s,
          sprints: s.sprints.map((sp) =>
            sp.id === id ? { ...sp, ...patch } : sp,
          ),
        })),
      startSprint: (id) =>
        setStore((s) => ({
          ...s,
          sprints: s.sprints.map((sp) =>
            sp.id === id ? { ...sp, state: "active" as SprintState } : sp,
          ),
        })),
      completeSprint: (id, stats, moveIncompleteToSprintId) =>
        setStore((s) => {
          let summary = "";
          if (stats) {
            summary = `Completed ${stats.completedItemsCount} of ${stats.completedItemsCount + stats.carriedItemsCount} items · ${stats.completedPoints}/${stats.plannedPoints} story points delivered.`;
          } else {
            const sprintItems = s.items.filter((i) => i.sprintId === id);
            const done = sprintItems.filter((i) => i.status === "Completed");
            const points = sprintItems.reduce((a, b) => a + b.points, 0);
            const donePts = done.reduce((a, b) => a + b.points, 0);
            summary = `Completed ${done.length} of ${sprintItems.length} items · ${donePts}/${points} story points delivered.`;
          }

          // Move any items that belong to this sprint and are not completed
          const updatedItems = s.items.map((i) => {
            if (
              i.sprintId === id &&
              i.status !== "Completed" &&
              moveIncompleteToSprintId
            ) {
              return {
                ...i,
                sprintId: moveIncompleteToSprintId,
                activity: logActivityArr(
                  i.activity,
                  "sprint",
                  "u1",
                  `moved to sprint as part of sprint completion`,
                ),
              };
            }
            return i;
          });

          return {
            ...s,
            items: updatedItems,
            sprints: s.sprints.map((sp) =>
              sp.id === id
                ? {
                    ...sp,
                    state: "completed" as SprintState,
                    summary,
                    ...(stats ?? {}),
                  }
                : sp,
            ),
          };
        }),
      deleteSprint: (id) =>
        setStore((s) => ({
          ...s,
          sprints: s.sprints.filter((sp) => sp.id !== id),
          items: s.items.map((i) =>
            i.sprintId === id ? { ...i, sprintId: undefined } : i,
          ),
        })),
      addComment: (itemId, c) =>
        setStore((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  comments: [
                    ...(i.comments ?? []),
                    { ...c, id: rid("CMT"), createdAt: now(), reactions: [] },
                  ],
                  activity: logActivityArr(
                    i.activity,
                    "comment",
                    c.authorId,
                    "added a comment",
                  ),
                }
              : i,
          ),
        })),
      toggleReaction: (itemId, commentId, emoji, userId) =>
        setStore((s) => ({
          ...s,
          items: s.items.map((i) => {
            if (i.id !== itemId) return i;
            return {
              ...i,
              comments: (i.comments ?? []).map((c) => {
                if (c.id !== commentId) return c;
                const existing = c.reactions.find((r) => r.emoji === emoji);
                let reactions: Reaction[];
                if (!existing)
                  reactions = [...c.reactions, { emoji, userIds: [userId] }];
                else if (existing.userIds.includes(userId))
                  reactions = c.reactions
                    .map((r) =>
                      r.emoji === emoji
                        ? {
                            ...r,
                            userIds: r.userIds.filter((u) => u !== userId),
                          }
                        : r,
                    )
                    .filter((r) => r.userIds.length > 0);
                else
                  reactions = c.reactions.map((r) =>
                    r.emoji === emoji
                      ? { ...r, userIds: [...r.userIds, userId] }
                      : r,
                  );
                return { ...c, reactions };
              }),
            };
          }),
        })),
      addAcceptance: (itemId, text) =>
        setStore((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  acceptanceCriteria: [
                    ...(i.acceptanceCriteria ?? []),
                    { id: rid("AC"), text, done: false },
                  ],
                }
              : i,
          ),
        })),
      updateAcceptance: (itemId, acId, text) =>
        setStore((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  acceptanceCriteria: (i.acceptanceCriteria ?? []).map((a) =>
                    a.id === acId ? { ...a, text } : a,
                  ),
                }
              : i,
          ),
        })),
      toggleAcceptance: (itemId, acId) =>
        setStore((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  acceptanceCriteria: (i.acceptanceCriteria ?? []).map((a) =>
                    a.id === acId ? { ...a, done: !a.done } : a,
                  ),
                }
              : i,
          ),
        })),
      removeAcceptance: (itemId, acId) =>
        setStore((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  acceptanceCriteria: (i.acceptanceCriteria ?? []).filter(
                    (a) => {
                      if (a.id === acId) {
                        const isDefault =
                          a.isDefault ||
                          DEFAULT_ACCEPTANCE_CRITERIA_TEXTS.includes(a.text);
                        return isDefault;
                      }
                      return true;
                    },
                  ),
                }
              : i,
          ),
        })),
      addLink: (itemId, type, targetId) =>
        setStore((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  links: [
                    ...(i.links ?? []),
                    { id: rid("LNK"), type, targetId },
                  ],
                }
              : i,
          ),
        })),
      removeLink: (itemId, linkId) =>
        setStore((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.id === itemId
              ? { ...i, links: (i.links ?? []).filter((l) => l.id !== linkId) }
              : i,
          ),
        })),
      addWorklog: (itemId, w) =>
        setStore((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  worklogs: [...(i.worklogs ?? []), { ...w, id: rid("WL") }],
                  remainingHours: Math.max(
                    0,
                    (i.remainingHours ?? i.estimateHours ?? 0) - w.hours,
                  ),
                  activity: logActivityArr(
                    i.activity,
                    "worklog",
                    w.userId,
                    `logged ${w.hours}h`,
                  ),
                }
              : i,
          ),
        })),
      addAttachment: (itemId, a) =>
        setStore((s) => {
          const item = s.items.find((i) => i.id === itemId);
          if (!item) return s;

          const workspaceCode = itemId.split("-")[0];
          const newAttId = rid("ATT");
          const newDocId = rid("DOC");

          // Create the new document
          const newDoc: ProjectDocument = {
            id: newDocId,
            workspaceCode,
            name: a.name,
            type: a.name.split(".").pop() || "unknown",
            folderId: null,
            content: a.url,
            size: a.size,
            versions: [
              {
                name: a.name,
                url: a.url,
                size: a.size,
                uploadedBy: a.uploadedBy,
                uploadedAt: now(),
                version: 1,
              },
            ],
            associations: [
              {
                type: item.type as IssueType,
                id: item.id,
                title: item.title,
              },
            ],
            createdBy: a.uploadedBy,
            createdAt: now(),
            lastModifiedBy: a.uploadedBy,
            lastModifiedAt: now(),
            viewCount: 0,
          };

          const newAttachment: Attachment = {
            ...a,
            id: newAttId,
            uploadedAt: now(),
            version: 1,
            documentId: newDocId,
          };

          return {
            ...s,
            documents: [...(s.documents || []), newDoc],
            items: s.items.map((i) =>
              i.id === itemId
                ? {
                    ...i,
                    attachments: [...(i.attachments ?? []), newAttachment],
                    activity: logActivityArr(
                      i.activity,
                      "attachment",
                      a.uploadedBy,
                      `attached ${a.name}`,
                    ),
                  }
                : i,
            ),
          };
        }),
      removeAttachment: (itemId, attId) =>
        setStore((s) => {
          const item = s.items.find((i) => i.id === itemId);
          if (!item) return s;
          const removedAtt = item.attachments?.find((a) => a.id === attId);
          const docIdToRemove = removedAtt?.documentId;

          return {
            ...s,
            documents: docIdToRemove
              ? (s.documents || []).filter(
                  (d) => d.id !== docIdToRemove && d.name !== removedAtt.name,
                )
              : (s.documents || []).filter((d) => d.name !== removedAtt?.name),
            items: s.items.map((i) =>
              i.id === itemId
                ? {
                    ...i,
                    attachments: (i.attachments ?? []).filter(
                      (a) => a.id !== attId,
                    ),
                  }
                : i,
            ),
          };
        }),
      addDependencyRisk: (itemId, dr) =>
        setStore((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  dependencyRisks: [
                    ...(i.dependencyRisks ?? []),
                    {
                      ...dr,
                      id: rid("DR"),
                      loggedDate: new Date().toISOString().split("T")[0],
                      closureDate:
                        dr.status === "Closed"
                          ? new Date().toISOString().split("T")[0]
                          : undefined,
                    },
                  ],
                }
              : i,
          ),
        })),
      updateDependencyRisk: (itemId, drId, patch) =>
        setStore((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  dependencyRisks: (i.dependencyRisks ?? []).map((dr) => {
                    if (dr.id !== drId) return dr;
                    const nextStatus = patch.status ?? dr.status;
                    let nextClosureDate = dr.closureDate;
                    if (nextStatus === "Closed") {
                      nextClosureDate =
                        dr.closureDate ??
                        new Date().toISOString().split("T")[0];
                    } else {
                      nextClosureDate = undefined;
                    }
                    return {
                      ...dr,
                      ...patch,
                      closureDate: nextClosureDate,
                    };
                  }),
                }
              : i,
          ),
        })),
      removeDependencyRisk: (itemId, drId) =>
        setStore((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  dependencyRisks: (i.dependencyRisks ?? []).filter(
                    (dr) => dr.id !== drId,
                  ),
                }
              : i,
          ),
        })),
      createFolder: (folder) =>
        setStore((s) => ({
          ...s,
          folders: [
            ...(s.folders || []),
            {
              id: rid("FLD"),
              createdAt: new Date().toISOString(),
              ...folder,
            },
          ],
        })),
      renameFolder: (id, name) =>
        setStore((s) => ({
          ...s,
          folders: (s.folders || []).map((f) =>
            f.id === id ? { ...f, name } : f,
          ),
        })),
      moveFolder: (id, parentId) =>
        setStore((s) => ({
          ...s,
          folders: (s.folders || []).map((f) =>
            f.id === id ? { ...f, parentId } : f,
          ),
        })),
      deleteFolder: (id) =>
        setStore((s) => {
          const getAllSubFolderIds = (folderId: string): string[] => {
            const list = [folderId];
            const children = (s.folders || []).filter(
              (f) => f.parentId === folderId,
            );
            children.forEach((child) => {
              list.push(...getAllSubFolderIds(child.id));
            });
            return list;
          };
          const foldersToDelete = getAllSubFolderIds(id);
          return {
            ...s,
            folders: (s.folders || []).filter(
              (f) => !foldersToDelete.includes(f.id),
            ),
            documents: (s.documents || []).filter(
              (d) =>
                d.folderId === null || !foldersToDelete.includes(d.folderId),
            ),
          };
        }),
      uploadOrUpdateDocument: (
        workspaceCode,
        name,
        type,
        folderId,
        size,
        uploadedBy,
        fileContent,
        associations = [],
      ) =>
        setStore((s) => {
          const docs = s.documents || [];
          const existingIdx = docs.findIndex(
            (d) =>
              d.workspaceCode === workspaceCode &&
              d.name.toLowerCase() === name.toLowerCase() &&
              d.folderId === folderId,
          );

          const nowTime = new Date().toISOString();

          if (existingIdx > -1) {
            const existing = docs[existingIdx];
            const nextVersion = existing.versions.length + 1;
            const updatedVersionList = [
              ...existing.versions,
              {
                version: nextVersion,
                name,
                url:
                  fileContent ||
                  existing.versions[existing.versions.length - 1].url,
                size,
                uploadedBy,
                uploadedAt: nowTime,
              },
            ];

            const updatedDoc: ProjectDocument = {
              ...existing,
              size,
              versions: updatedVersionList,
              lastModifiedBy: uploadedBy,
              lastModifiedAt: nowTime,
              content: fileContent || existing.content,
              associations:
                associations.length > 0 ? associations : existing.associations,
            };

            const newDocs = [...docs];
            newDocs[existingIdx] = updatedDoc;

            return {
              ...s,
              documents: newDocs,
              items: syncDocAttachments(s.items, updatedDoc),
            };
          } else {
            const newDoc: ProjectDocument = {
              id: rid("DOC"),
              workspaceCode,
              name,
              type,
              folderId,
              size,
              content: fileContent,
              versions: [
                {
                  version: 1,
                  name,
                  url: fileContent || "#",
                  size,
                  uploadedBy,
                  uploadedAt: nowTime,
                },
              ],
              associations,
              createdBy: uploadedBy,
              createdAt: nowTime,
              lastModifiedBy: uploadedBy,
              lastModifiedAt: nowTime,
              viewCount: 1,
            };

            return {
              ...s,
              documents: [...docs, newDoc],
              items: syncDocAttachments(s.items, newDoc),
            };
          }
        }),
      createDocument: (doc) =>
        setStore((s) => {
          const nowTime = new Date().toISOString();
          const newDoc: ProjectDocument = {
            id: rid("DOC"),
            workspaceCode: doc.workspaceCode,
            name: doc.name,
            type: doc.type,
            folderId: doc.folderId,
            size: doc.content.length,
            content: doc.content,
            versions: [
              {
                version: 1,
                name: doc.name,
                url: doc.content,
                size: doc.content.length,
                uploadedBy: doc.createdBy,
                uploadedAt: nowTime,
              },
            ],
            associations: doc.associations || [],
            createdBy: doc.createdBy,
            createdAt: nowTime,
            lastModifiedBy: doc.createdBy,
            lastModifiedAt: nowTime,
            viewCount: 1,
          };
          return {
            ...s,
            documents: [...(s.documents || []), newDoc],
            items: syncDocAttachments(s.items, newDoc),
          };
        }),
      updateDocument: (id, patch) =>
        setStore((s) => {
          const nowStr = new Date().toISOString();
          let updatedFullDoc: ProjectDocument | null = null;

          const newDocs = (s.documents || []).map((d) => {
            if (d.id !== id) return d;
            const updatedVersions = [...d.versions];
            let size = d.size;
            if (patch.content !== undefined && patch.content !== d.content) {
              size = patch.content.length;
              const nextVer = d.versions.length + 1;
              updatedVersions.push({
                version: nextVer,
                name: patch.name || d.name,
                url: patch.content,
                size,
                uploadedBy: patch.lastModifiedBy || d.lastModifiedBy,
                uploadedAt: nowStr,
              });
            }
            const updatedD: ProjectDocument = {
              ...d,
              ...patch,
              size,
              versions: updatedVersions,
              lastModifiedAt: nowStr,
            };
            updatedFullDoc = updatedD;
            return updatedD;
          });

          return {
            ...s,
            documents: newDocs,
            items: updatedFullDoc
              ? syncDocAttachments(s.items, updatedFullDoc)
              : s.items,
          };
        }),
      deleteDocument: (id) =>
        setStore((s) => ({
          ...s,
          documents: (s.documents || []).filter((d) => d.id !== id),
          items: s.items.map((i) => ({
            ...i,
            attachments: (i.attachments ?? []).filter(
              (a) => a.documentId !== id,
            ),
          })),
        })),
      incrementDocumentView: (id) =>
        setStore((s) => ({
          ...s,
          documents: (s.documents || []).map((d) =>
            d.id === id ? { ...d, viewCount: (d.viewCount || 0) + 1 } : d,
          ),
        })),

      createDiscoveryItem: (d) =>
        setStore((s) => ({
          ...s,
          discoveryItems: [
            ...s.discoveryItems,
            { ...d, id: rid("DISC"), createdAt: now(), updatedAt: now() },
          ],
        })),
      updateDiscoveryItem: (id, patch) =>
        setStore((s) => ({
          ...s,
          discoveryItems: s.discoveryItems.map((d) =>
            d.id === id ? { ...d, ...patch, updatedAt: now() } : d,
          ),
        })),
      deleteDiscoveryItem: (id) =>
        setStore((s) => ({
          ...s,
          discoveryItems: s.discoveryItems.filter((d) => d.id !== id),
        })),
      createStrategicGoal: (g) =>
        setStore((s) => ({
          ...s,
          strategicGoals: [
            ...s.strategicGoals,
            { ...g, id: rid("GOAL"), createdAt: now() },
          ],
        })),
      updateStrategicGoal: (id, patch) =>
        setStore((s) => ({
          ...s,
          strategicGoals: s.strategicGoals.map((g) =>
            g.id === id ? { ...g, ...patch } : g,
          ),
        })),
      deleteStrategicGoal: (id) =>
        setStore((s) => ({
          ...s,
          strategicGoals: s.strategicGoals.filter((g) => g.id !== id),
        })),

      createDiscoveryTag: (t) => {
        const newTag = { ...t, id: rid("TAG") };
        setStore((s) => ({
          ...s,
          discoveryTags: [...s.discoveryTags, newTag],
        }));
        return newTag;
      },
      updateDiscoveryTag: (id, patch) =>
        setStore((s) => ({
          ...s,
          discoveryTags: s.discoveryTags.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        })),
      deleteDiscoveryTag: (id) =>
        setStore((s) => ({
          ...s,
          discoveryTags: s.discoveryTags.filter((t) => t.id !== id),
          // We also need to remove this tag from all discovery items
          discoveryItems: s.discoveryItems.map((item) => {
            if (item.tags && item.tags.includes(id)) {
              return { ...item, tags: item.tags.filter((tId) => tId !== id) };
            }
            return item;
          }),
        })),

      seedItemDetails: (itemId) =>
        setStore((s) => ({
          ...s,
          items: s.items.map((i) => {
            if (i.id !== itemId || i.seededAt) return i;
            const pick = (n: number) => DIRECTORY.slice(0, n);
            const today = new Date();
            const iso = (offset: number) => {
              const d = new Date(today);
              d.setDate(d.getDate() + offset);
              return d.toISOString();
            };
            return {
              ...i,
              seededAt: now(),
              reporterId: i.reporterId ?? "u5",
              estimateHours: i.estimateHours ?? (i.points || 3) * 4,
              remainingHours:
                i.remainingHours ?? Math.max(0, (i.points || 3) * 4 - 6),
              team: i.team ?? "Platform Squad",
              releaseVersion: i.releaseVersion ?? "v1.4.0",
              acceptanceCriteria:
                i.acceptanceCriteria && i.acceptanceCriteria.length > 0
                  ? i.type === "epic"
                    ? ensureDefaultAcceptanceCriteria(i).acceptanceCriteria
                    : i.type === "feature"
                      ? []
                      : i.acceptanceCriteria
                  : i.type === "epic"
                    ? ensureDefaultAcceptanceCriteria({
                        ...i,
                        acceptanceCriteria: [],
                      }).acceptanceCriteria
                    : i.type === "feature"
                      ? []
                      : [
                          {
                            id: rid("AC"),
                            text: "Component renders without console warnings",
                            done: true,
                          },
                          {
                            id: rid("AC"),
                            text: "Keyboard navigation works end-to-end",
                            done: false,
                          },
                          {
                            id: rid("AC"),
                            text: "Meets WCAG AA color contrast",
                            done: false,
                          },
                        ],
              comments: i.comments?.length
                ? i.comments
                : [
                    {
                      id: rid("CMT"),
                      authorId: "u5",
                      body: "Initial scope looks good. Let's confirm the acceptance criteria with QA before grooming.",
                      createdAt: iso(-3),
                      reactions: [{ emoji: "👍", userIds: ["u1", "u2"] }],
                      internal: false,
                    },
                    {
                      id: rid("CMT"),
                      authorId: "u2",
                      body: "I'll start on the API contract. @u1 can you sync on the frontend types?",
                      createdAt: iso(-2),
                      reactions: [{ emoji: "🚀", userIds: ["u1"] }],
                      internal: false,
                    },
                    {
                      id: rid("CMT"),
                      authorId: "u3",
                      body: "QA note: edge case for empty states needs a screenshot in the spec.",
                      createdAt: iso(-1),
                      reactions: [],
                      internal: true,
                    },
                  ],
              attachments: i.attachments?.length
                ? i.attachments
                : [
                    {
                      id: rid("ATT"),
                      name: "design-spec.png",
                      mime: "image/png",
                      size: 482311,
                      url: `https://picsum.photos/seed/${i.id}/600/400`,
                      uploadedBy: "u4",
                      uploadedAt: iso(-4),
                      version: 1,
                    },
                    {
                      id: rid("ATT"),
                      name: "requirements.pdf",
                      mime: "application/pdf",
                      size: 128321,
                      url: "#",
                      uploadedBy: "u5",
                      uploadedAt: iso(-5),
                      version: 2,
                    },
                  ],
              worklogs: i.worklogs?.length ? i.worklogs : [],
              activity: i.activity?.length
                ? i.activity
                : [
                    {
                      id: rid("ACT"),
                      type: "created",
                      actorId: "u5",
                      at: iso(-7),
                      text: "created this item",
                    },
                    {
                      id: rid("ACT"),
                      type: "assignee",
                      actorId: "u5",
                      at: iso(-6),
                      text: `assigned to ${pick(1)[0].name}`,
                    },
                    {
                      id: rid("ACT"),
                      type: "status",
                      actorId: "u1",
                      at: iso(-4),
                      text: "changed status from Todo to In Progress",
                    },
                    {
                      id: rid("ACT"),
                      type: "comment",
                      actorId: "u5",
                      at: iso(-3),
                      text: "added a comment",
                    },
                    {
                      id: rid("ACT"),
                      type: "attachment",
                      actorId: "u4",
                      at: iso(-4),
                      text: "attached design-spec.png",
                    },
                    {
                      id: rid("ACT"),
                      type: "worklog",
                      actorId: "u1",
                      at: iso(-2),
                      text: "logged 3.5h",
                    },
                  ],
            };
          }),
        })),
    }),
    [store, isLoaded],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useWorkspaceStore() {
  const ctx = useContext(StoreContext);
  if (!ctx)
    throw new Error(
      "useWorkspaceStore must be used within WorkspaceStoreProvider",
    );
  return ctx;
}

export function useWorkspace(code: string) {
  const { store } = useWorkspaceStore();
  return store.workspaces.find((w) => w.code === code);
}

export const ISSUE_TYPE_META: Record<
  IssueType,
  { label: string; color: string; bg: string; icon: string }
> = {
  epic: {
    label: "Epic",
    color: "text-accent-foreground",
    bg: "bg-accent",
    icon: "◆",
  },
  feature: {
    label: "Feature",
    color: "text-primary",
    bg: "bg-primary/15",
    icon: "★",
  },
  story: { label: "Story", color: "text-info", bg: "bg-info/15", icon: "▌" },
  task: {
    label: "Task",
    color: "text-success",
    bg: "bg-success/15",
    icon: "✓",
  },
  bug: {
    label: "Bug",
    color: "text-destructive",
    bg: "bg-destructive/15",
    icon: "🐞",
  },
  spike: {
    label: "Spike",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/15",
    icon: "⚡",
  },
};

export const PRIORITY_META: Record<Priority, { label: string; color: string }> =
  {
    lowest: { label: "Lowest", color: "text-muted-foreground" },
    low: { label: "Low", color: "text-info" },
    medium: { label: "Medium", color: "text-warning" },
    high: { label: "High", color: "text-destructive" },
    highest: { label: "Highest", color: "text-destructive" },
  };

export const LINK_TYPE_META: Record<
  LinkType,
  { label: string; color: string }
> = {
  blocks: { label: "Blocks", color: "text-destructive" },
  blockedBy: { label: "Blocked by", color: "text-warning" },
  relatesTo: { label: "Relates to", color: "text-info" },
  duplicates: { label: "Duplicates", color: "text-muted-foreground" },
};

export const DEFAULT_STATUSES = [
  "Todo",
  "In Progress",
  "In Review",
  "Completed",
];

export function avatarColor(id: string) {
  const colors = [
    "oklch(0.7 0.15 30)",
    "oklch(0.7 0.15 90)",
    "oklch(0.7 0.15 150)",
    "oklch(0.7 0.15 210)",
    "oklch(0.7 0.15 270)",
    "oklch(0.7 0.15 330)",
  ];
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return colors[Math.abs(h) % colors.length];
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
