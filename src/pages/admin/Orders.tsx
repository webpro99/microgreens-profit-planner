import { useState } from "react";
import { useFarmData, useFarmMutation } from "@/hooks/useFarmData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  packed: "bg-purple-100 text-purple-700",
  delivered: "bg-surface-green text-primary",
  cancelled: "bg-red-100 text-red-700",
};

const OrdersPage = () => {
  const { data: orders = [], isLoading } = useFarmData<Order>("orders", { orderBy: "order_date" });
  const { data: customers = [] } = useFarmData<Customer>("customers");
  const { insert, update, remove } = useFarmMutation("orders");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState({ customer_id: "", delivery_date: "", status: "pending", subtotal: 0, tax: 0, discount: 0, total: 0, notes: "" });

  const openAdd = () => { setEditing(null); setForm({ customer_id: customers[0]?.id ?? "", delivery_date: "", status: "pending", subtotal: 0, tax: 0, discount: 0, total: 0, notes: "" }); setDialogOpen(true); };
  const openEdit = (order: Order) => {
    setEditing(order);
    setForm({ customer_id: order.customer_id ?? "", delivery_date: order.delivery_date ?? "", status: order.status ?? "pending", subtotal: order.subtotal ?? 0, tax: order.tax ?? 0, discount: order.discount ?? 0, total: order.total ?? 0, notes: order.notes ?? "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const total = form.subtotal + form.tax - form.discount;
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...form, total });
        toast.success("Order updated");
      } else {
        await insert.mutateAsync({ ...form, total });
        toast.success("Order created");
      }
      setDialogOpen(false);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    try { await remove.mutateAsync(id); toast.success("Order deleted"); } catch (e: any) { toast.error(e.message); }
  };

  if (isLoading) return <div className="animate-pulse"><div className="h-8 bg-muted rounded w-32 mb-6" /><div className="h-64 bg-muted rounded-xl" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl text-foreground">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">{orders.length} orders</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" onClick={openAdd}><Plus className="w-4 h-4" /> New Order</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editing ? "Edit Order" : "New Order"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div>
                <Label className="text-xs">Customer</Label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.customer_id} onChange={(e) => setForm((f) => ({ ...f, customer_id: e.target.value }))}>
                  <option value="">Select customer</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><Label className="text-xs">Delivery Date</Label><Input type="date" value={form.delivery_date} onChange={(e) => setForm((f) => ({ ...f, delivery_date: e.target.value }))} /></div>
              <div>
                <Label className="text-xs">Status</Label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {["pending", "confirmed", "packed", "delivered", "cancelled"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label className="text-xs">Subtotal</Label><Input type="number" step="0.01" value={form.subtotal} onChange={(e) => setForm((f) => ({ ...f, subtotal: Number(e.target.value) }))} /></div>
                <div><Label className="text-xs">Tax</Label><Input type="number" step="0.01" value={form.tax} onChange={(e) => setForm((f) => ({ ...f, tax: Number(e.target.value) }))} /></div>
                <div><Label className="text-xs">Discount</Label><Input type="number" step="0.01" value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: Number(e.target.value) }))} /></div>
              </div>
              <div><Label className="text-xs">Notes</Label><Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
              <Button onClick={handleSave}>{editing ? "Save" : "Create Order"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {orders.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-muted-foreground text-left">
                <th className="px-6 py-3 font-medium">Order #</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">Date</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr></thead>
              <tbody>
                {orders.map((o) => {
                  const cust = customers.find((c) => c.id === o.customer_id);
                  return (
                    <tr key={o.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3 font-mono text-xs">{o.order_number}</td>
                      <td className="px-6 py-3 text-foreground">{cust?.name ?? "—"}</td>
                      <td className="px-6 py-3 tabular-nums hidden md:table-cell">{o.order_date}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[o.status ?? "pending"]}`}>{o.status}</span>
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums font-medium">${(o.total ?? 0).toFixed(2)}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => openEdit(o)} className="p-1.5 rounded-md hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                          <button onClick={() => handleDelete(o.id)} className="p-1.5 rounded-md hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <ShoppingCart className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">No orders yet</p>
          <Button variant="outline" className="mt-4" onClick={openAdd}>Create First Order</Button>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
