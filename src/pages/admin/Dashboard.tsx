import { useAuth } from "@/contexts/AuthContext";
import { useFarmData, useFarmSettings } from "@/hooks/useFarmData";
import { calculateCropProfit, calculateMonthlyProjection } from "@/lib/profitCalculations";
import { money, usdToMadNum } from "@/lib/displayUnits";
import { DollarSign, TrendingUp, Leaf, Package, ShoppingCart, ListChecks, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Database } from "@/integrations/supabase/types";

type Crop = Database["public"]["Tables"]["crops"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Inventory = Database["public"]["Tables"]["inventory"]["Row"];

const CHART_COLORS = ["hsl(152,38%,28%)", "hsl(38,85%,52%)", "hsl(200,18%,46%)", "hsl(0,72%,51%)", "hsl(152,25%,50%)"];

const AdminDashboard = () => {
  const { data: crops = [], isLoading: cropsLoading } = useFarmData<Crop>("crops");
  const { data: orders = [] } = useFarmData<Order>("orders", { orderBy: "order_date" });
  const { data: tasks = [] } = useFarmData<Task>("tasks");
  const { data: inventory = [] } = useFarmData<Inventory>("inventory");
  const { data: settings, isLoading: settingsLoading } = useFarmSettings();

  const activeCrops = crops.filter((c) => c.is_active);
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed");
  const openTasks = tasks.filter((t) => t.status !== "done");
  const growingInventory = inventory.filter((i) => i.status === "growing");

  const profits = settings ? activeCrops.map((c) => calculateCropProfit(c, settings)) : [];
  const projection = settings && profits.length > 0
    ? calculateMonthlyProjection(profits, 4, settings)
    : null;

  const topProfits = [...profits].sort((a, b) => b.marginPercent - a.marginPercent).slice(0, 5);
  const chartData = topProfits.map((p) => ({
    name: p.cropName,
    cost: usdToMadNum(p.costPerTray),
    revenue: usdToMadNum(p.revenuePerTray),
    profit: usdToMadNum(p.profitPerTray),
    margin: p.marginPercent,
  }));

  const marginData = topProfits.map((p) => ({ name: p.cropName, value: p.marginPercent }));

  if (cropsLoading || settingsLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your farm at a glance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={DollarSign} label="Projected Monthly" value={projection ? `$${projection.totalProfit.toLocaleString()}` : "—"} sub="profit" color="text-primary" />
        <KPICard icon={Leaf} label="Active Crops" value={String(activeCrops.length)} sub="varieties" color="text-primary" />
        <KPICard icon={ShoppingCart} label="Pending Orders" value={String(pendingOrders.length)} sub="to fulfill" color="text-accent" />
        <KPICard icon={ListChecks} label="Open Tasks" value={String(openTasks.length)} sub="remaining" color="text-muted-foreground" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cost vs Revenue */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 text-body">Cost vs Revenue per Tray</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                <Bar dataKey="cost" fill="hsl(200,18%,76%)" radius={[4, 4, 0, 0]} name="Cost" />
                <Bar dataKey="revenue" fill="hsl(152,38%,28%)" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Add crops to see cost vs revenue" />
          )}
        </div>

        {/* Margin Pie */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 text-body">Profit Margin by Crop</h3>
          {marginData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={marginData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {marginData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Add crops to see margin analysis" />
          )}
        </div>
      </div>

      {/* Crop Leaderboard */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground text-body">Crop Profitability Leaderboard</h3>
        </div>
        {profits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="px-6 py-3 font-medium">Crop</th>
                  <th className="px-6 py-3 font-medium text-right">Cost/Tray</th>
                  <th className="px-6 py-3 font-medium text-right">Revenue/Tray</th>
                  <th className="px-6 py-3 font-medium text-right">Profit/Tray</th>
                  <th className="px-6 py-3 font-medium text-right">Margin</th>
                  <th className="px-6 py-3 font-medium text-right hidden md:table-cell">$/Clamshell</th>
                </tr>
              </thead>
              <tbody>
                {[...profits].sort((a, b) => b.profitPerTray - a.profitPerTray).map((p) => (
                  <tr key={p.cropId} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 font-medium text-foreground">
                      {p.cropName}
                      {p.variety && <span className="text-muted-foreground ml-1 text-xs">({p.variety})</span>}
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums">${p.costPerTray.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right tabular-nums">${p.revenuePerTray.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right tabular-nums font-medium text-primary">${p.profitPerTray.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right tabular-nums">
                      <span className={p.marginPercent >= 50 ? "text-primary" : p.marginPercent >= 20 ? "text-accent" : "text-destructive"}>
                        {p.marginPercent}%
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums hidden md:table-cell">${p.profitPerClamshell.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <Leaf className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>No crops added yet. Add crops to see profitability data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

function KPICard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-surface-green flex items-center justify-center">
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-2xl font-bold text-foreground text-body tabular-nums block">{value}</span>
      <span className="text-xs text-muted-foreground">{sub}</span>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
      <div className="text-center">
        <AlertTriangle className="w-6 h-6 mx-auto mb-2 opacity-40" />
        {message}
      </div>
    </div>
  );
}

export default AdminDashboard;
