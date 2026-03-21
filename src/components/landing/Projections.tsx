import { TrendingUp, TrendingDown, DollarSign, Layers } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const projections = [
  { label: "Monthly Revenue", value: "$8,420", icon: DollarSign, trend: "+12.4%" },
  { label: "Monthly Profit", value: "$5,840", icon: TrendingUp, trend: "+18.2%" },
  { label: "Racks Needed", value: "6", icon: Layers, trend: "optimal" },
  { label: "Top Crop Margin", value: "82%", icon: TrendingUp, trend: "Sunflower" },
];

const cropBreakdown = [
  { name: "Sunflower", revenue: 2840, profit: 2330, margin: 82, bar: "w-[82%]" },
  { name: "Pea Shoots", revenue: 2100, profit: 1580, margin: 75, bar: "w-[75%]" },
  { name: "Radish", revenue: 1680, profit: 1180, margin: 70, bar: "w-[70%]" },
  { name: "Broccoli", revenue: 1200, profit: 540, margin: 45, bar: "w-[45%]" },
  { name: "Wheatgrass", revenue: 600, profit: 210, margin: 35, bar: "w-[35%]" },
];

const Projections = () => (
  <section id="projections" className="py-24 md:py-32 section-padding">
    <div className="container-wide">
      <ScrollReveal>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-3 block text-body">
            Financial Projections
          </span>
          <h2 className="text-3xl md:text-4xl tracking-tight text-foreground mb-4">
            Plan Months Ahead, Not Days
          </h2>
          <p className="text-muted-foreground text-lg">
            Forecast revenue, estimate rack capacity, and see exactly which crops drive your bottom line.
          </p>
        </div>
      </ScrollReveal>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {projections.map((p, i) => (
          <ScrollReveal key={p.label} delay={i * 0.08}>
            <div className="bg-card rounded-xl p-6 border border-border/60 shadow-sm text-center">
              <div className="w-10 h-10 rounded-lg bg-surface-green flex items-center justify-center mx-auto mb-3">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-2xl font-bold text-foreground text-body tabular-nums block">{p.value}</span>
              <span className="text-xs text-muted-foreground block mt-1">{p.label}</span>
              <span className="inline-block text-xs font-medium text-primary bg-surface-green rounded-full px-2 py-0.5 mt-2">
                {p.trend}
              </span>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Crop breakdown table */}
      <ScrollReveal delay={0.15}>
        <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/60">
            <h3 className="text-lg text-foreground">Profit Breakdown by Crop</h3>
            <p className="text-sm text-muted-foreground mt-1">Monthly projection based on current production</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground text-left">
                  <th className="px-6 py-3 font-medium">Crop</th>
                  <th className="px-6 py-3 font-medium text-right">Revenue</th>
                  <th className="px-6 py-3 font-medium text-right">Profit</th>
                  <th className="px-6 py-3 font-medium text-right">Margin</th>
                  <th className="px-6 py-3 font-medium hidden md:table-cell">Performance</th>
                </tr>
              </thead>
              <tbody>
                {cropBreakdown.map((c) => (
                  <tr key={c.name} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{c.name}</td>
                    <td className="px-6 py-4 text-right tabular-nums">${c.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right tabular-nums text-primary font-medium">${c.profit.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right tabular-nums">{c.margin}%</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className={`h-full bg-primary rounded-full ${c.bar}`} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default Projections;
