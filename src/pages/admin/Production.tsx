import { useState } from "react";
import { useFarmData, useFarmMutation } from "@/hooks/useFarmData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarCheck, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Plan = Database["public"]["Tables"]["production_plans"]["Row"];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-surface-green text-primary",
  completed: "bg-blue-100 text-blue-700",
};

const ProductionPage = () => {
  const { data: plans = [], isLoading } = useFarmData<Plan>("production_plans", { orderBy: "created_at" });
  const { insert, update, remove } = useFarmMutation("production_plans");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "", status: "draft", notes: "" });

  const openAdd = () => { setEditing(null); setForm({ name: "", start_date: "", end_date: "", status: "draft", notes: "" }); setDialogOpen(true); };
  const openEdit = (p: Plan) => { setEditing(p); setForm({ name: p.name, start_date: p.start_date ?? "", end_date: p.end_date ?? "", status: p.status ?? "draft", notes: p.notes ?? "" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    try {
      if (editing) { await update.mutateAsync({ id: editing.id, ...form }); toast.success("Plan updated"); }
      else { await insert.mutateAsync(form); toast.success("Plan created"); }
      setDialogOpen(false);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    try { await remove.mutateAsync(id); toast.success("Deleted"); } catch (e: any) { toast.error(e.message); }
  };

  if (isLoading) return <div className="animate-pulse"><div className="h-8 bg-muted rounded w-32 mb-6" /><div className="h-64 bg-muted rounded-xl" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl md:text-3xl text-foreground">Production Plans</h1><p className="text-muted-foreground text-sm mt-1">{plans.length} plans</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button variant="hero" onClick={openAdd}><Plus className="w-4 h-4" /> New Plan</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editing ? "Edit Plan" : "New Plan"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Week 12 Plan" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">Start Date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} /></div>
                <div><Label className="text-xs">End Date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} /></div>
              </div>
              <div><Label className="text-xs">Status</Label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {["draft", "active", "completed"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><Label className="text-xs">Notes</Label><Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
              <Button onClick={handleSave}>{editing ? "Save" : "Create Plan"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {plans.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-foreground">{plan.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[plan.status ?? "draft"]}`}>{plan.status}</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 mb-3">
                {plan.start_date && <p>Start: {plan.start_date}</p>}
                {plan.end_date && <p>End: {plan.end_date}</p>}
                {plan.notes && <p>{plan.notes}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(plan)} className="p-1.5 rounded-md hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                <button onClick={() => handleDelete(plan.id)} className="p-1.5 rounded-md hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <CalendarCheck className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">No production plans</p>
          <Button variant="outline" className="mt-4" onClick={openAdd}>Create First Plan</Button>
        </div>
      )}
    </div>
  );
};

export default ProductionPage;
