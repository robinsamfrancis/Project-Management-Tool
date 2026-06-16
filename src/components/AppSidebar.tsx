import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Home,
  LayoutGrid,
  Plus,
  Search,
  Star,
  StarOff,
  Sparkles,
  LogOut,
  MoreVertical,
  Trash2,
  Edit2,
  Clock,
  MapIcon,
  BarChart2,
} from "lucide-react";
import { BpmLogo } from "@/components/BpmLogo";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore, type Workspace } from "@/lib/workspace-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EditWorkspaceForm } from "@/components/EditWorkspaceForm";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { store, deleteWorkspace } = useWorkspaceStore();
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const [query, setQuery] = useState("");
  const { role: userRole, myUserId, isPortfolioManager } = useCurrentUser();

  // User state
  const [userEmail, setUserEmail] = useState("sophia.chen@beinex.com");
  useEffect(() => {
    try {
      const stored = localStorage.getItem("bpm-user");
      if (stored) {
        setUserEmail(JSON.parse(stored).email || "sophia.chen@beinex.com");
      }
    } catch {}
  }, []);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    if (userEmail) {
      try {
        const stored = localStorage.getItem(`bpm-favorites-${userEmail}`);
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch {}
    }
  }, [userEmail]);

  const toggleFavorite = (code: string) => {
    const isFav = favorites.includes(code);
    let next;
    if (isFav) {
      next = favorites.filter((f) => f !== code);
    } else {
      next = [...favorites, code];
    }
    setFavorites(next);
    localStorage.setItem(`bpm-favorites-${userEmail}`, JSON.stringify(next));
  };

  const workspaces = store.workspaces.filter((w) => {
    if (isPortfolioManager || userRole === "Admin User") return true;
    return w.ownerIds.includes(myUserId) || w.memberIds.includes(myUserId);
  });

  const filtered = workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(query.toLowerCase()) ||
      w.code.toLowerCase().includes(query.toLowerCase()),
  );

  const favWorkspaces = filtered
    .filter((w) => favorites.includes(w.code))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar sticky top-0">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <BpmLogo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarItem
          to="/"
          icon={<Home className="h-4 w-4" />}
          label="Home"
          active={pathname === "/"}
        />

        <button
          onClick={() => setWorkspaceOpen((o) => !o)}
          className="mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <LayoutGrid className="h-4 w-4" />
            Workspaces
          </span>
          {workspaceOpen ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {workspaceOpen && (
          <div className="mt-2 space-y-3 pl-2">
            {workspaces.length > 0 && (
              <div className="relative px-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search workspaces"
                  className="h-8 pl-8 text-xs bg-background/60"
                />
              </div>
            )}

            {workspaces.length === 0 ? (
              <div className="rounded-lg border border-dashed border-sidebar-border p-3 text-center">
                <Sparkles className="mx-auto h-4 w-4 text-primary mb-1.5" />
                <p className="text-[11px] text-muted-foreground mb-2">
                  No workspaces yet. Create your first one.
                </p>
                <Button
                  size="sm"
                  className="w-full gap-1.5 h-7 text-xs bg-gradient-primary text-primary-foreground"
                  onClick={() => navigate({ to: "/workspaces/new" })}
                >
                  <Plus className="h-3 w-3" /> New workspace
                </Button>
              </div>
            ) : (
              <>
                {favWorkspaces.length > 0 && (
                  <div className="mb-4">
                    <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Star className="h-3 w-3" /> Favorite Workspaces
                    </p>
                    <div className="space-y-0.5">
                      {favWorkspaces.map((w) => (
                        <WorkspaceNavItem
                          key={`fav-${w.code}`}
                          workspace={w}
                          pathname={pathname}
                          isFavorite={true}
                          onToggleFavorite={() => toggleFavorite(w.code)}
                          onDeleteWorkspace={deleteWorkspace}
                          store={store}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Workspaces
                  </p>
                  <div className="space-y-0.5">
                    {filtered.map((w) => (
                      <WorkspaceNavItem
                        key={w.code}
                        workspace={w}
                        pathname={pathname}
                        isFavorite={favorites.includes(w.code)}
                        onToggleFavorite={() => toggleFavorite(w.code)}
                        onDeleteWorkspace={deleteWorkspace}
                        store={store}
                      />
                    ))}
                    {filtered.length === 0 && (
                      <p className="px-3 py-1 text-xs text-muted-foreground">
                        No matches
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start gap-2 h-8 text-xs mt-3 lg:mt-5"
                  onClick={() => navigate({ to: "/workspaces/new" })}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create workspace
                </Button>
              </>
            )}
          </div>
        )}

        <div className="mt-2 text-sidebar-foreground">
          <SidebarItem
            to="/timelog"
            icon={<Clock className="h-4 w-4" />}
            label="Time Log"
            active={pathname === "/timelog"}
          />
          <SidebarItem
            to="/discovery-roadmap"
            icon={<MapIcon className="h-4 w-4" />}
            label="Discovery Roadmap"
            active={pathname === "/discovery-roadmap"}
          />
          <SidebarItem
            to="/impact-vs-effort"
            icon={<BarChart2 className="h-4 w-4" />}
            label="Impact vs Effort"
            active={pathname === "/impact-vs-effort"}
          />
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <UserCard />
      </div>
    </aside>
  );
}

function WorkspaceNavItem({
  workspace,
  pathname,
  isFavorite,
  onToggleFavorite,
  onDeleteWorkspace,
  store,
}: {
  workspace: Workspace;
  pathname: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onDeleteWorkspace: (code: string) => void;
  store: any;
}) {
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // Route to the edit page
  const handleEdit = () => {
    navigate({
      to: `/workspaces/$code/dashboard`,
      params: { code: workspace.code },
      search: { edit: true },
    });
  };

  const handleDeleteClick = () => setDeleting(true);

  const confirmDelete = () => {
    onDeleteWorkspace(workspace.code);
    toast.success(`Workspace "${workspace.name}" deleted.`);
    setDeleting(false);
    if (pathname.includes(`/workspaces/${workspace.code}`)) {
      navigate({ to: "/" });
    }
  };

  const hasContent = () => {
    const code = workspace.code;
    const wItems = store.items.filter((i: any) => i.workspaceCode === code);
    const wSprints = store.sprints.filter((s: any) => s.workspaceCode === code);
    const wDocs = store.documents.filter((d: any) => d.workspaceCode === code);
    const activeSprints =
      wSprints.filter((s: any) => s.state === "active").length > 0;
    const hasTasks = wItems.length > 0;
    const hasDocs = wDocs.length > 0;
    const hasDependenciesOrRisks = wItems.some(
      (i: any) => (i.dependencyRisks || []).length > 0,
    );
    return activeSprints || hasTasks || hasDocs || hasDependenciesOrRisks;
  };

  return (
    <>
      <div
        className={cn(
          "group relative flex w-full items-center justify-between rounded-md px-3 py-1.5 transition-colors",
          pathname.startsWith(`/workspaces/${workspace.code}`)
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "hover:bg-sidebar-accent/60",
        )}
      >
        <Link
          to="/workspaces/$code/dashboard"
          params={{ code: workspace.code }}
          className="flex flex-1 items-center gap-2.5 text-left text-xs text-sidebar-foreground truncate"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-primary text-[9px] font-bold text-primary-foreground shrink-0">
            {workspace.code.slice(0, 2)}
          </span>
          <span className="flex-1 truncate font-medium">{workspace.name}</span>
        </Link>

        {/* Workspace Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleEdit}
              className="gap-2 cursor-pointer"
            >
              <Edit2 className="h-4 w-4" /> Edit Workspace
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onToggleFavorite}
              className="gap-2 cursor-pointer"
            >
              {isFavorite ? (
                <>
                  <StarOff className="h-4 w-4" /> Remove from Favorites
                </>
              ) : (
                <>
                  <Star className="h-4 w-4" /> Add to Favorites
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDeleteClick}
              className="gap-2 text-destructive focus:text-destructive cursor-pointer"
            >
              <Trash2 className="h-4 w-4" /> Delete Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={deleting} onOpenChange={setDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workspace? This action cannot
              be undone.
              {hasContent() && (
                <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-sm font-medium">
                  Warning: This workspace contains active sprints, tasks,
                  documents, risks, or dependencies.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Workspace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SidebarItem({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/60",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

function UserCard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "Project Member",
    email: "sophia.chen@beinex.com",
    department: "Engineering",
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bpm-user");
      if (stored) {
        setUser((prev) => ({ ...prev, ...JSON.parse(stored) }));
      }
    } catch {
      // ignore
    }
  }, []);

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem("bpm-user");
    navigate({ to: "/login" });
  };

  return (
    <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent/60 transition-colors cursor-default">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground shrink-0 cursor-pointer">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-sidebar-foreground truncate">
          {user.name}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {user.department}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
        onClick={handleLogout}
        title="Logout"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
