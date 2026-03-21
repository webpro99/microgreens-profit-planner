import { useFarmData, useFarmMutation } from "@/hooks/useFarmData";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Inventory = Database["public"]["Tables"]["inventory"]["Row"];
type Crop = Database["public"]["Tables"]["crops"]["Row"];

const statusColors: Record<string, string> = {
  growing: "bg-blue-100 text-blue-700",
  harvested: "bg-amber-100 text-amber-700",
  available: "bg-surface-green text-primary",
  expired: "bg-red-100 text-red-700",
  sold: "bg-muted text-muted-foreground",
};

const InventoryPage = () => {
  const { data: inventory = [], isLoading } = useFarmData<Inventory>("inventory");
  const { data: crops = [] } = useFarmData<Crop>("crops");
  const { insert, remove } = useFarmMutation("inventory");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ crop_id: "", quantity_trays: 1, quantity_oz: 0, status: "growing", harvested_date: "", expires_date: "" });

  const openAdd = () => { setForm({ crop_id: crops[0]?.id ?? "", quantity_trays: 1, quantity_oz: 0, status: "growing", harvested_date: "", expires_date: "" }); setDialogOpen(true); };

  const handleSave = async () => {
    try { await insert.mutateAsync(form); toast.success("Inventory added"); setDialogOpen(false); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove?")) return;
    try { await remove.mutateAsync(id); toast.success("Removed"); } catch (e: any) { toast.error(e.message); }
  };

  if (isLoading) return <div className="animate-pulse"><div className="h-8 bg-muted rounded w-32 mb-6" /><div className="h-64 bg-muted rounded-xl" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl md:text-3xl text-foreground">Inventory</h1><p className="text-muted-foreground text-sm mt-1">{inventory.length} entries</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button variant="hero" onClick={openAdd}><Plus className="w-4 h-4" /> Add Entry</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add Inventory</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div><Label className="text-xs">Crop</Label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.crop_id} onChange={(e) => setForm((f) => ({ ...f, crop_id: e.target.value }))}>
                  {crops.filter((c) => c.is_active).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">Trays</Label><Input type="number" value={form.quantity_trays} onChange={(e) => setForm((f) => ({ ...f, quantity_trays: Number(e.target.value) }))} /></div>
                <div><Label className="text-xs">Quantity (oz)</Label><Input type="number" step="0.1" value={form.quantity_oz} onChange={(e) => setForm((f) => ({ ...f, quantity_oz: Number(e.target.value) }))} /></div>
              </div>
              <div><Label className="text-xs">Status</Label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {["growing", "harvested", "available", "expired", "sold"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">Harvested</Label><Input type="date" value={form.harvested_date} onChange={(e) => setForm((f) => ({ ...f, harvested_date: e.target.value }))} /></div>
                <div><Label className="text-xs">Expires</Label><Input type="date" value={form.expires_date} onChange={(e) => setForm((f) => ({ ...f, expires_date: e.target.value }))} /></div>
              </div>
              <Button onClick={handleSave}>Add Entry</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {inventory.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-muted-foreground text-left">
                <th className="px-6 py-3 font-medium">Crop</th>
                <th className="px-6 py-3 font-medium text-right">Trays</th>
                <th className="px-6 py-3 font-medium text-right">Qty (oz)</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">Harvested</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">Expires</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr></thead>
              <tbody>
                {inventory.map((inv) => {
                  const crop = crops.find((c) => c.id === inv.crop_id);
                  return (
                    <tr key={inv.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3 font-medium text-foreground">{crop?.name ?? "—"}</td>
                      <td className="px-6 py-3 text-right tabular-nums">{inv.quantity_trays}</td>
                      <td className="px-6 py-3 text-right tabular-nums">{inv.quantity_oz}</td>
                      <td className="px-6 py-3 text-center"><span className={`inline-block text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[inv.status ?? "growing"]}`}>{inv.status}</span></td>
                      <td className="px-6 py-3 tabular-nums hidden md:table-cell">{inv.harvested_date ?? "—"}</td>
                      <td className="px-6 py-3 tabular-nums hidden md:table-cell">{inv.expires_date ?? "—"}</td>
                      <td className="px-6 py-3 text-right"><button onClick={() => handleDelete(inv.id)} className="p-1.5 rounded-md hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Package className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">No inventory entries</p>
          <Button variant="outline" className="mt-4" onClick={openAdd}>Add First Entry</Button>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
