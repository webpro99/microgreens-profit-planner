import { ClipboardList, Sliders, BarChart3, Rocket } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Add Your Crops & Mixes",
    description: "Enter every crop you grow and build your custom mixes with exact ratios.",
  },
  {
    icon: Sliders,
    step: "02",
    title: "Input Your Real Costs",
    description: "Soil, seed, electricity, labor, trays, packaging — plug in what you actually spend.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "See Your Profit Instantly",
    description: "The engine calculates cost, revenue, profit, and margin per tray and per clamshell.",
  },
  {
    icon: Rocket,
    step: "04",
    title: "Plan & Scale",
    description: "Use projections to forecast monthly revenue, estimate racks, and grow with clarity.",
  },
];

const HowItWorks = () => (
  <section className="py-24 md:py-32 section-padding">
    <div className="container-wide">
      <ScrollReveal>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-3 block text-body">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl tracking-tight text-foreground mb-4">
            From Raw Data to a Clear Business Plan
          </h2>
          <p className="text-muted-foreground text-lg">
            Four steps. No learning curve. Just plug in your farm and start making better decisions.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((s, i) => (
          <ScrollReveal key={s.step} delay={i * 0.1}>
            <div className="relative">
              <div className="text-6xl font-bold text-primary/8 text-body absolute -top-2 -left-1 select-none">
                {s.step}
              </div>
              <div className="relative pt-10">
                <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg mb-2 text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
