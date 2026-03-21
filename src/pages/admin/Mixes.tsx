import { useState } from "react";
import { useFarmData, useFarmMutation } from "@/hooks/useFarmData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Blend, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Mix = Database["public"]["Tables"]["mixes"]["Row"];
type Crop = Database["public"]["Tables"]["crops"]["Row"];
type MixIngredient = Database["public"]["Tables"]["mix_ingredients"]["Row"];

const MixesPage = () => {
  const { farmId } = useAuth();
  const { data: mixes = [], isLoading } = useFarmData<Mix>("mixes", { orderBy: "created_at" });
  const { data: crops = [] } = useFarmData<Crop>("crops");
  const { insert, update, remove } = useFarmMutation("mixes");
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Mix | null>(null);
  const [form, setForm] = useState({ name: "", description: "", selling_price_per_oz: 2.5, selling_price_per_clamshell: 5, clamshell_size_oz: 2, is_active: true });
  const [ingredients, setIngredients] = useState<{ crop_id: string; percentage: number }[]>([]);

  // Fetch all ingredients
  const { data: allIngredients = [] } = useQuery({
    queryKey: ["mix_ingredients", farmId],
    enabled: !!farmId,
    queryFn: async () => {
      const mixIds = mixes.map((m) => m.id);
      if (mixIds.length === 0) return [];
      const { data, error } = await supabase.from("mix_ingredients").select("*").in("mix_id", mixIds);
      if (error) throw error;
      return data;
    },
  });

  const activeCrops = crops.filter((c) => c.is_active);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", description: "", selling_price_per_oz: 2.5, selling_price_per_clamshell: 5, clamshell_size_oz: 2, is_active: true });
    setIngredients([]);
    setDialogOpen(true);
  };

  const openEdit = async (mix: Mix) => {
    setEditing(mix);
    setForm({
      name: mix.name, description: mix.description ?? "",
      selling_price_per_oz: mix.selling_price_per_oz ?? 2.5,
      selling_price_per_clamshell: mix.selling_price_per_clamshell ?? 5,
      clamshell_size_oz: mix.clamshell_size_oz ?? 2, is_active: mix.is_active ?? true,
    });
    const mixIngredients = allIngredients.filter((i) => i.mix_id === mix.id);
    setIngredients(mixIngredients.map((i) => ({ crop_id: i.crop_id, percentage: i.percentage })));
    setDialogOpen(true);
  };

  const addIngredient = () => {
    if (activeCrops.length === 0) return;
    setIngredients((prev) => [...prev, { crop_id: activeCrops[0].id, percentage: 0 }]);
  };

  const removeIngredient = (idx: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalPercent = ingredients.reduce((s, i) => s + i.percentage, 0);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Mix name is required"); return; }
    if (ingredients.length > 0 && Math.abs(totalPercent - 100) > 0.1) {
      toast.error("Ingredient percentages must total 100%"); return;
    }
    try {
      let mixId: string;
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...form });
        mixId = editing.id;
        // Delete old ingredients
        await supabase.from("mix_ingredients").delete().eq("mix_id", mixId);
      } else {
        const result = await insert.mutateAsync(form);
        mixId = (result as any).id;
      }
      // Insert ingredients
      if (ingredients.length > 0) {
        await supabase.from("mix_ingredients").insert(
          ingredients.map((i, idx) => ({ mix_id: mixId, crop_id: i.crop_id, percentage: i.percentage, sort_order: idx }))
        );
      }
      queryClient.invalidateQueries({ queryKey: ["mix_ingredients"] });
      toast.success(editing ? "Mix updated" : "Mix created");
      setDialogOpen(false);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this mix?")) return;
    try { await remove.mutateAsync(id); toast.success("Mix deleted"); }
    catch (e: any) { toast.error(e.message); }
  };

  if (isLoading) return <div className="animate-pulse"><div className="h-8 bg-muted rounded w-32 mb-6" /><div className="h-64 bg-muted rounded-xl" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl text-foreground">Mixes</h1>
          <p className="text-muted-foreground text-sm mt-1">Build custom crop blends</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" onClick={openAdd}><Plus className="w-4 h-4" /> New Mix</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Mix" : "Create Mix"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div><Label className="text-xs">Description</Label><Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label className="text-xs">Price/oz ($)</Label><Input type="number" step="0.01" value={form.selling_price_per_oz} onChange={(e) => setForm((f) => ({ ...f, selling_price_per_oz: Number(e.target.value) }))} /></div>
                <div><Label className="text-xs">Price/Clamshell ($)</Label><Input type="number" step="0.01" value={form.selling_price_per_clamshell} onChange={(e) => setForm((f) => ({ ...f, selling_price_per_clamshell: Number(e.target.value) }))} /></div>
                <div><Label className="text-xs">Clamshell (oz)</Label><Input type="number" step="0.5" value={form.clamshell_size_oz} onChange={(e) => setForm((f) => ({ ...f, clamshell_size_oz: Number(e.target.value) }))} /></div>
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold">Ingredients</Label>
                  <span className={`text-xs tabular-nums ${Math.abs(totalPercent - 100) < 0.1 ? "text-primary" : "text-destructive"}`}>
                    {totalPercent}%
                  </span>
                </div>
                {ingredients.map((ing, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <select
                      className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={ing.crop_id}
                      onChange={(e) => setIngredients((prev) => prev.map((p, i) => i === idx ? { ...p, crop_id: e.target.value } : p))}
                    >
                      {activeCrops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <Input type="number" className="w-20" step="1" value={ing.percentage}
                      onChange={(e) => setIngredients((prev) => prev.map((p, i) => i === idx ? { ...p, percentage: Number(e.target.value) } : p))} />
                    <span className="text-xs text-muted-foreground">%</span>
                    <button onClick={() => removeIngredient(idx)} className="p-1 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addIngredient} disabled={activeCrops.length === 0}>
                  <Plus className="w-3 h-3" /> Add Ingredient
                </Button>
              </div>

              <Button onClick={handleSave} disabled={insert.isPending || update.isPending}>
                {editing ? "Save Changes" : "Create Mix"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {mixes.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mixes.map((mix) => {
            const mixIngs = allIngredients.filter((i) => i.mix_id === mix.id);
            return (
              <div key={mix.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-foreground">{mix.name}</h3>
                    {mix.description && <p className="text-xs text-muted-foreground mt-0.5">{mix.description}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(mix)} className="p-1.5 rounded-md hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button onClick={() => handleDelete(mix.id)} className="p-1.5 rounded-md hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                  <span>${mix.selling_price_per_oz}/oz</span>
                  <span>${mix.selling_price_per_clamshell}/clam</span>
                </div>
                {mixIngs.length > 0 && (
                  <div className="space-y-1">
                    {mixIngs.map((ing) => {
                      const crop = crops.find((c) => c.id === ing.crop_id);
                      return (
                        <div key={ing.id} className="flex justify-between text-xs">
                          <span className="text-foreground">{crop?.name ?? "Unknown"}</span>
                          <span className="tabular-nums text-muted-foreground">{ing.percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Blend className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">No mixes created yet</p>
          <Button variant="outline" className="mt-4" onClick={openAdd}>Create Your First Mix</Button>
        </div>
      )}
    </div>
  );
};

export default MixesPage;
