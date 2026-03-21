import { useState } from "react";
import { useFarmData, useFarmMutation } from "@/hooks/useFarmData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ListChecks, Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
};

const TasksPage = () => {
  const { data: tasks = [], isLoading } = useFarmData<Task>("tasks", { orderBy: "created_at" });
  const { insert, update, remove } = useFarmMutation("tasks");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", due_date: "", priority: "medium", category: "other" });

  const openAdd = () => { setForm({ title: "", description: "", due_date: "", priority: "medium", category: "other" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    try { await insert.mutateAsync(form); toast.success("Task added"); setDialogOpen(false); }
    catch (e: any) { toast.error(e.message); }
  };

  const toggleDone = async (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    try {
      await update.mutateAsync({
        id: task.id, status: newStatus,
        completed_at: newStatus === "done" ? new Date().toISOString() : null,
      });
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    try { await remove.mutateAsync(id); toast.success("Deleted"); } catch (e: any) { toast.error(e.message); }
  };

  const openTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");

  if (isLoading) return <div className="animate-pulse"><div className="h-8 bg-muted rounded w-32 mb-6" /><div className="h-64 bg-muted rounded-xl" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl md:text-3xl text-foreground">Tasks</h1><p className="text-muted-foreground text-sm mt-1">{openTasks.length} open, {doneTasks.length} done</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button variant="hero" onClick={openAdd}><Plus className="w-4 h-4" /> Add Task</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div><Label className="text-xs">Title *</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
              <div><Label className="text-xs">Description</Label><Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} /></div>
                <div><Label className="text-xs">Priority</Label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                    {["low", "medium", "high", "urgent"].map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div><Label className="text-xs">Category</Label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {["planting", "harvesting", "delivery", "maintenance", "other"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Button onClick={handleSave}>Add Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tasks.length > 0 ? (
        <div className="space-y-2">
          {openTasks.map((task) => (
            <div key={task.id} className="bg-card rounded-lg border border-border p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <button onClick={() => toggleDone(task)} className="w-5 h-5 rounded border-2 border-border flex items-center justify-center shrink-0 hover:border-primary transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{task.title}</p>
                {task.description && <p className="text-xs text-muted-foreground truncate">{task.description}</p>}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${priorityColors[task.priority ?? "medium"]}`}>{task.priority}</span>
              {task.due_date && <span className="text-xs text-muted-foreground tabular-nums shrink-0 hidden sm:block">{task.due_date}</span>}
              <button onClick={() => handleDelete(task.id)} className="p-1 rounded hover:bg-destructive/10 shrink-0"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
            </div>
          ))}
          {doneTasks.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground font-medium pt-4">Completed ({doneTasks.length})</p>
              {doneTasks.map((task) => (
                <div key={task.id} className="bg-card rounded-lg border border-border/50 p-4 flex items-center gap-4 opacity-60">
                  <button onClick={() => toggleDone(task)} className="w-5 h-5 rounded bg-primary flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-primary-foreground" /></button>
                  <p className="text-sm text-muted-foreground line-through flex-1 truncate">{task.title}</p>
                  <button onClick={() => handleDelete(task.id)} className="p-1 rounded hover:bg-destructive/10 shrink-0"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                </div>
              ))}
            </>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <ListChecks className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">No tasks yet</p>
          <Button variant="outline" className="mt-4" onClick={openAdd}>Add First Task</Button>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
