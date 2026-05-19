import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { api, IngestionTask } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState, useCallback } from "react";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/dashboard/")({
  component: Dashboard,
});

/**
 * Dashboard Component State Machine:
 * Uninitialized -> Fetching (Skeleton) -> Active (Rendered) -> Processing (Disabled) -> Error Boundary
 */
function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const {
    data: tasks,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await api.tasks.list();
      return response.payload;
    },
    refetchInterval: 10000,
  });

  const handleLogout = useCallback(async () => {
    setIsProcessing(true);
    try {
      await api.auth.logout();
      toast.success("Session Terminated");
      navigate({ to: "/login" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Logout failed.";
      toast.error("Session Termination Failed", { description: message });
    } finally {
      setIsProcessing(false);
    }
  }, [navigate]);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((task) => {
      const matchesSearch = task.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/80 hover:bg-green-500">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "processing":
        return <Badge className="bg-blue-500 animate-pulse">Processing</Badge>;
      default:
        return <Badge variant="secondary">Queued</Badge>;
    }
  };

  // Error State Render
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
        <div className="p-8 border border-destructive/50 bg-destructive/5 text-center max-w-md">
          <h2 className="text-xl font-bold text-destructive uppercase tracking-tighter">System_Failure</h2>
          <p className="mt-4 text-sm text-muted-foreground font-mono">
            Error: {error instanceof Error ? error.message : "Synchronization lost."}
          </p>
          <button 
            onClick={() => refetch()}
            className="mt-6 px-6 py-2 bg-destructive text-destructive-foreground text-xs font-bold uppercase tracking-widest hover:brightness-110"
          >
            Retry_Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-background min-h-screen text-foreground font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase">Task_Monitor</h1>
          <p className="text-muted-foreground font-mono text-xs mt-2">
            /Active_Ingestion_Pipelines
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            to="/"
            className="text-xs font-mono uppercase border border-border px-4 py-2 hover:bg-surface transition"
          >
            Back_to_Home
          </Link>
          <button
            onClick={handleLogout}
            disabled={isProcessing}
            className="text-xs font-mono uppercase border border-accent/50 text-accent px-4 py-2 hover:bg-accent/10 transition disabled:opacity-50"
          >
            Sign_Out
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8" role="search">
        <div className="flex flex-col gap-1 w-full md:w-64">
          <label htmlFor="search-tasks" className="text-[10px] font-mono uppercase text-muted-foreground sr-only">
            Search Tasks
          </label>
          <input
            id="search-tasks"
            type="text"
            placeholder="Search by Task ID..."
            className="bg-surface/50 border border-border px-4 py-2 text-xs font-mono focus:border-accent outline-none w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="status-filter" className="text-[10px] font-mono uppercase text-muted-foreground sr-only">
            Filter by Status
          </label>
          <select
            id="status-filter"
            className="bg-surface/50 border border-border px-4 py-2 text-xs font-mono focus:border-accent outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All_Statuses</option>
            <option value="queued">Queued</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="border border-border bg-surface/30 backdrop-blur-sm overflow-hidden rounded-sm">
        <Table aria-label="Ingestion Tasks Monitor">
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent bg-muted/20">
              <TableHead className="font-mono text-[10px] uppercase h-12">ID</TableHead>
              <TableHead className="font-mono text-[10px] uppercase h-12">Status</TableHead>
              <TableHead className="font-mono text-[10px] uppercase h-12">Priority</TableHead>
              <TableHead className="font-mono text-[10px] uppercase h-12">Created_At</TableHead>
              <TableHead className="font-mono text-[10px] uppercase h-12 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell colSpan={5} className="p-4">
                    <Skeleton className="h-4 w-full bg-muted/40" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-20 text-muted-foreground font-mono text-xs italic"
                >
                  No_Active_Mandates_Found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow
                  key={task.id}
                  className="border-border hover:bg-surface/50 transition-colors group"
                >
                  <TableCell className="font-mono text-[10px] py-4">
                    <span className="text-muted-foreground">{task.id.slice(0, 8)}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {task.id.slice(8)}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell className="font-mono text-xs">{task.priority}</TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                    {new Date(task.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="text-[10px] font-mono uppercase underline underline-offset-4 hover:text-accent transition">
                      Details
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default Dashboard;
