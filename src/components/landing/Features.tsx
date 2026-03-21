import {
  TrendingUp,
  Leaf,
  Calculator,
  BarChart3,
  LineChart,
  Target,
  type LucideIcon,
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
  <ScrollReveal delay={delay}>
    <div className="group bg-card rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-border/60 h-full">
      <div className="w-12 h-12 rounded-xl bg-surface-green flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
    </div>
  </ScrollReveal>
);

const features = [
  {
    icon: TrendingUp,
    title: "Profit Engine",
    description:
      "Instantly see which crops and mixes are profitable. Real-time clarity so every growing decision is backed by data, not hunches.",
  },
  {
    icon: Leaf,
    title: "Crop & Mix Builder",
    description:
      "Add crops, build custom mixes, adjust ratios. A flexible system that mirrors how your farm actually operates.",
  },
  {
    icon: Calculator,
    title: "Real Farm Inputs",
    description:
      "Plug in your actual costs — soil, seeds, electricity, labor, packaging, trays, fertilizer — and see true margins, not estimates.",
  },
  {
    icon: BarChart3,
    title: "Profit Overview",
    description:
      "Cost per tray. Revenue per tray. Profit per tray. Margin. Cost and profit per clamshell. All in one view.",
  },
  {
    icon: LineChart,
    title: "Financial Projections",
    description:
      "Forecast monthly profit, estimate racks needed, and break it down by crop. Plan quarters ahead, not days.",
  },
  {
    icon: Target,
    title: "Performance Insights",
    description:
      "Identify your top performers and underperformers at a glance. Double down on what works, cut what doesn't.",
  },
];

const Features = () => (
  <section id="features" className="py-24 md:py-32 section-padding bg-surface-warm">
    <div className="container-wide">
      <ScrollReveal>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-3 block text-body">
            Core Capabilities
          </span>
          <h2 className="text-3xl md:text-4xl tracking-tight text-foreground mb-4">
            Everything You Need to Grow Profitably
          </h2>
          <p className="text-muted-foreground text-lg">
            Six integrated modules that replace scattered spreadsheets with one clear system of record.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <FeatureCard key={f.title} {...f} delay={i * 0.08} />
        ))}
      </div>
    </div>
  </section>
);

export default Features;
