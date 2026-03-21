import ScrollReveal from "./ScrollReveal";
import dashboardImg from "@/assets/dashboard-mockup.jpg";

const metrics = [
  { label: "Cost / Tray", value: "$4.32", sub: "all inputs included" },
  { label: "Revenue / Tray", value: "$18.50", sub: "based on your pricing" },
  { label: "Profit / Tray", value: "$14.18", sub: "net margin" },
  { label: "Margin", value: "76.6%", sub: "per crop average" },
];

const Dashboard = () => (
  <section id="dashboard" className="py-24 md:py-32 section-padding bg-surface-green">
    <div className="container-wide">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <ScrollReveal>
            <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-3 block text-body">
              Profit Dashboard
            </span>
            <h2 className="text-3xl md:text-4xl tracking-tight text-foreground mb-6">
              Your Entire Operation in One View
            </h2>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
              See cost, revenue, profit, and margin for every crop and mix — per tray and per clamshell.
              No more digging through spreadsheets. Just open the dashboard and know exactly where you stand.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-2 gap-4">
            {metrics.map((m, i) => (
              <ScrollReveal key={m.label} delay={i * 0.08}>
                <div className="bg-card rounded-xl p-5 border border-border/60 shadow-sm">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider text-body block mb-1">
                    {m.label}
                  </span>
                  <span className="text-2xl font-bold text-foreground text-body tabular-nums">{m.value}</span>
                  <span className="block text-xs text-muted-foreground mt-1">{m.sub}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal direction="right" delay={0.15}>
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/40">
            <img
              src={dashboardImg}
              alt="Casa Grows IQ profit dashboard showing crop performance analytics"
              className="w-full h-auto"
            />
          </div>
        </ScrollReveal>
      </div>
    </div>
  </section>
);

export default Dashboard;
