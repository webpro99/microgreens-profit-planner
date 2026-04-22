import { useState } from "react";
import { useFarmData, useFarmMutation } from "@/hooks/useFarmData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Leaf, Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { money, moneyPerGram, ozToGrams } from "@/lib/displayUnits";

type Crop = Database["public"]["Tables"]["crops"]["Row"];

const defaultCrop = {
  name: "", variety: "", seed_cost_per_tray: 1, seed_weight_per_tray_grams: 30,
  soak_hours: 8, blackout_days: 3, grow_days: 7, expected_yield_oz_per_tray: 8,
  shelf_life_days: 7, selling_price_per_oz: 2, selling_price_per_clamshell: 4,
  clamshell_size_oz: 2, notes: "", is_active: true,
};

const CropsPage = () => {
  const { data: crops = [], isLoading } = useFarmData<Crop>("crops", { orderBy: "created_at" });
  const { insert, update, remove } = useFarmMutation("crops");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Crop | null>(null);
  const [form, setForm] = useState(defaultCrop);
  const [search, setSearch] = useState("");

  const filtered = crops.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.variety?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(defaultCrop); setDialogOpen(true); };
  const openEdit = (crop: Crop) => {
    setEditing(crop);
    setForm({
      name: crop.name, variety: crop.variety ?? "", seed_cost_per_tray: crop.seed_cost_per_tray ?? 1,
      seed_weight_per_tray_grams: crop.seed_weight_per_tray_grams ?? 30,
      soak_hours: crop.soak_hours ?? 0, blackout_days: crop.blackout_days ?? 0,
      grow_days: crop.grow_days ?? 7, expected_yield_oz_per_tray: crop.expected_yield_oz_per_tray ?? 8,
      shelf_life_days: crop.shelf_life_days ?? 7, selling_price_per_oz: crop.selling_price_per_oz ?? 2,
      selling_price_per_clamshell: crop.selling_price_per_clamshell ?? 4,
      clamshell_size_oz: crop.clamshell_size_oz ?? 2, notes: crop.notes ?? "",
      is_active: crop.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Crop name is required"); return; }
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...form });
        toast.success("Crop updated");
      } else {
        await insert.mutateAsync(form);
        toast.success("Crop added");
      }
      setDialogOpen(false);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this crop?")) return;
    try { await remove.mutateAsync(id); toast.success("Crop deleted"); }
    catch (e: any) { toast.error(e.message); }
  };

  const setField = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl text-foreground">Crops</h1>
          <p className="text-muted-foreground text-sm mt-1">{crops.length} crops in your library</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" onClick={openAdd}><Plus className="w-4 h-4" /> Add Crop</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Crop" : "Add New Crop"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Name *" value={form.name} onChange={(v) => setField("name", v)} />
                <Field label="Variety" value={form.variety} onChange={(v) => setField("variety", v)} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <NumField label="Soak (hrs)" value={form.soak_hours} onChange={(v) => setField("soak_hours", v)} />
                <NumField label="Blackout (days)" value={form.blackout_days} onChange={(v) => setField("blackout_days", v)} />
                <NumField label="Grow (days)" value={form.grow_days} onChange={(v) => setField("grow_days", v)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumField label="Seed Cost / Tray (MAD)" value={form.seed_cost_per_tray} onChange={(v) => setField("seed_cost_per_tray", v)} step="0.01" />
                <NumField label="Seed Weight / Tray (g)" value={form.seed_weight_per_tray_grams} onChange={(v) => setField("seed_weight_per_tray_grams", v)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumField label="Expected Yield (g/tray)" value={form.expected_yield_oz_per_tray} onChange={(v) => setField("expected_yield_oz_per_tray", v)} step="0.1" />
                <NumField label="Shelf Life (days)" value={form.shelf_life_days} onChange={(v) => setField("shelf_life_days", v)} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <NumField label="Price / g (MAD)" value={form.selling_price_per_oz} onChange={(v) => setField("selling_price_per_oz", v)} step="0.01" />
                <NumField label="Price / Clamshell (MAD)" value={form.selling_price_per_clamshell} onChange={(v) => setField("selling_price_per_clamshell", v)} step="0.01" />
                <NumField label="Clamshell Size (g)" value={form.clamshell_size_oz} onChange={(v) => setField("clamshell_size_oz", v)} step="0.5" />
              </div>
              <div>
                <Label className="text-xs">Notes</Label>
                <Input value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setField("is_active", e.target.checked)} id="active" />
                <Label htmlFor="active" className="text-sm">Active</Label>
              </div>
              <Button onClick={handleSave} disabled={insert.isPending || update.isPending}>
                {editing ? "Save Changes" : "Add Crop"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search crops..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="px-6 py-3 font-medium">Crop</th>
                  <th className="px-6 py-3 font-medium hidden sm:table-cell">Grow Days</th>
                  <th className="px-6 py-3 font-medium text-right">Yield (g)</th>
                  <th className="px-6 py-3 font-medium text-right">Price/g</th>
                  <th className="px-6 py-3 font-medium text-right hidden md:table-cell">Seed Cost</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((crop) => (
                  <tr key={crop.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3">
                      <span className="font-medium text-foreground">{crop.name}</span>
                      {crop.variety && <span className="text-muted-foreground text-xs ml-1">({crop.variety})</span>}
                    </td>
                    <td className="px-6 py-3 tabular-nums hidden sm:table-cell">
                      {(crop.soak_hours ?? 0) / 24 + (crop.blackout_days ?? 0) + (crop.grow_days ?? 7)}d
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums">{ozToGrams(crop.expected_yield_oz_per_tray)}</td>
                    <td className="px-6 py-3 text-right tabular-nums">{moneyPerGram(crop.selling_price_per_oz)}</td>
                    <td className="px-6 py-3 text-right tabular-nums hidden md:table-cell">{money(crop.seed_cost_per_tray)}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${crop.is_active ? "bg-surface-green text-primary" : "bg-muted text-muted-foreground"}`}>
                        {crop.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => openEdit(crop)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => handleDelete(crop.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Leaf className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">{search ? "No crops match your search" : "No crops added yet"}</p>
          {!search && <Button variant="outline" className="mt-4" onClick={openAdd}>Add Your First Crop</Button>}
        </div>
      )}
    </div>
  );
};

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div><Label className="text-xs">{label}</Label><Input value={value} onChange={(e) => onChange(e.target.value)} /></div>
  );
}

function NumField({ label, value, onChange, step = "1" }: { label: string; value: number; onChange: (v: number) => void; step?: string }) {
  return (
    <div><Label className="text-xs">{label}</Label><Input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} /></div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-muted rounded w-32" />
      <div className="h-10 bg-muted rounded w-64" />
      <div className="h-64 bg-muted rounded-xl" />
    </div>
  );
}

export default CropsPage;
