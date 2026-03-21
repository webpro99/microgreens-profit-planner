import { useFarmData, useFarmSettings } from "@/hooks/useFarmData";
import { calculateCropProfit, calculateMonthlyProjection } from "@/lib/profitCalculations";
import { DollarSign, TrendingUp, TrendingDown, Target } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import type { Database } from "@/integrations/supabase/types";

type Crop = Database["public"]["Tables"]["crops"]["Row"];

const FinancialsPage = () => {
  const { data: crops = [], isLoading } = useFarmData<Crop>("crops");
  const { data: settings } = useFarmSettings();

  const activeCrops = crops.filter((c) => c.is_active);
  const profits = settings ? activeCrops.map((c) => calculateCropProfit(c, settings)) : [];
  const sorted = [...profits].sort((a, b) => b.profitPerTray - a.profitPerTray);

  const traysPerMonth = [2, 4, 8, 12, 16];
  const projectionData = settings
    ? traysPerMonth.map((t) => {
        const proj = calculateMonthlyProjection(profits, t, settings);
        return { trays: `${t}/crop`, revenue: proj.totalRevenue, cost: proj.totalCost, profit: proj.totalProfit, racks: proj.racksNeeded };
      })
    : [];

  const projection4 = settings && profits.length > 0 ? calculateMonthlyProjection(profits, 4, settings) : null;

  if (isLoading) return <div className="animate-pulse"><div className="h-8 bg-muted rounded w-48 mb-6" /><div className="h-96 bg-muted rounded-xl" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl text-foreground">Financial Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Projections based on {activeCrops.length} active crops and your farm settings</p>
      </div>

      {/* Summary cards */}
      {projection4 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard icon={DollarSign} label="Monthly Revenue" value={`$${projection4.totalRevenue.toLocaleString()}`} color="text-primary" />
          <SummaryCard icon={TrendingUp} label="Monthly Profit" value={`$${projection4.totalProfit.toLocaleString()}`} color="text-primary" />
          <SummaryCard icon={Target} label="Overall Margin" value={`${projection4.margin}%`} color="text-accent" />
          <SummaryCard icon={TrendingDown} label="Racks Needed" value={String(projection4.racksNeeded)} color="text-muted-foreground" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profit by crop */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 text-body">Profit per Tray by Crop</h3>
          {sorted.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sorted} layout="vertical">
                <XAxis type="number" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="cropName" width={90} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                <Bar dataKey="profitPerTray" fill="hsl(152,38%,28%)" radius={[0, 4, 4, 0]} name="Profit/Tray" />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </div>

        {/* Scaling projection */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 text-body">Revenue vs Cost by Scale</h3>
          {projectionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(45,14%,88%)" />
                <XAxis dataKey="trays" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(152,38%,28%)" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="cost" stroke="hsl(200,18%,76%)" strokeWidth={2} name="Cost" />
                <Line type="monotone" dataKey="profit" stroke="hsl(38,85%,52%)" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </div>
      </div>

      {/* Detailed table */}
      {sorted.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground text-body">Detailed Crop Economics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-muted-foreground text-left">
                <th className="px-6 py-3 font-medium">Crop</th>
                <th className="px-6 py-3 font-medium text-right">Cost/Tray</th>
                <th className="px-6 py-3 font-medium text-right">Rev/Tray</th>
                <th className="px-6 py-3 font-medium text-right">Profit/Tray</th>
                <th className="px-6 py-3 font-medium text-right">Margin</th>
                <th className="px-6 py-3 font-medium text-right hidden md:table-cell">Cost/Clam</th>
                <th className="px-6 py-3 font-medium text-right hidden md:table-cell">Profit/Clam</th>
                <th className="px-6 py-3 font-medium text-right hidden lg:table-cell">Grow Days</th>
              </tr></thead>
              <tbody>
                {sorted.map((p) => (
                  <tr key={p.cropId} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 font-medium text-foreground">{p.cropName}</td>
                    <td className="px-6 py-3 text-right tabular-nums">${p.costPerTray.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right tabular-nums">${p.revenuePerTray.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right tabular-nums font-medium text-primary">${p.profitPerTray.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right tabular-nums">
                      <span className={p.marginPercent >= 50 ? "text-primary" : p.marginPercent >= 20 ? "text-accent" : "text-destructive"}>{p.marginPercent}%</span>
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums hidden md:table-cell">${p.costPerClamshell.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right tabular-nums hidden md:table-cell">${p.profitPerClamshell.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right tabular-nums hidden lg:table-cell">{p.totalGrowDays}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

function SummaryCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-surface-green flex items-center justify-center"><Icon className={`w-4 h-4 ${color}`} /></div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-2xl font-bold text-foreground text-body tabular-nums">{value}</span>
    </div>
  );
}

function EmptyState() {
  return <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">Add crops and settings to see projections</div>;
}

export default FinancialsPage;
