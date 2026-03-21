import { useState } from "react";
import { useFarmData, useFarmMutation } from "@/hooks/useFarmData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];

const CustomersPage = () => {
  const { data: customers = [], isLoading } = useFarmData<Customer>("customers");
  const { insert, update, remove } = useFarmMutation("customers");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: "", type: "individual", email: "", phone: "", address: "", delivery_notes: "", is_active: true });

  const openAdd = () => { setEditing(null); setForm({ name: "", type: "individual", email: "", phone: "", address: "", delivery_notes: "", is_active: true }); setDialogOpen(true); };
  const openEdit = (c: Customer) => { setEditing(c); setForm({ name: c.name, type: c.type ?? "individual", email: c.email ?? "", phone: c.phone ?? "", address: c.address ?? "", delivery_notes: c.delivery_notes ?? "", is_active: c.is_active ?? true }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    try {
      if (editing) { await update.mutateAsync({ id: editing.id, ...form }); toast.success("Updated"); }
      else { await insert.mutateAsync(form); toast.success("Customer added"); }
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
        <div><h1 className="text-2xl md:text-3xl text-foreground">Customers</h1><p className="text-muted-foreground text-sm mt-1">{customers.length} customers</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button variant="hero" onClick={openAdd}><Plus className="w-4 h-4" /> Add Customer</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editing ? "Edit Customer" : "Add Customer"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div><Label className="text-xs">Type</Label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  {["individual", "restaurant", "retail", "wholesale"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">Email</Label><Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
                <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
              </div>
              <div><Label className="text-xs">Address</Label><Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
              <div><Label className="text-xs">Delivery Notes</Label><Input value={form.delivery_notes} onChange={(e) => setForm((f) => ({ ...f, delivery_notes: e.target.value }))} /></div>
              <Button onClick={handleSave}>{editing ? "Save" : "Add Customer"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {customers.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-muted-foreground text-left">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">Email</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">Phone</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr></thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 font-medium text-foreground">{c.name}</td>
                    <td className="px-6 py-3 capitalize text-muted-foreground">{c.type}</td>
                    <td className="px-6 py-3 hidden md:table-cell text-muted-foreground">{c.email || "—"}</td>
                    <td className="px-6 py-3 hidden md:table-cell text-muted-foreground">{c.phone || "—"}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-md hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-md hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
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
          <Users className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">No customers yet</p>
          <Button variant="outline" className="mt-4" onClick={openAdd}>Add First Customer</Button>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
