import { Clock, PiggyBank, Scaling, ShieldCheck, Zap, Users } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const benefits = [
  {
    icon: PiggyBank,
    title: "Increase Profitability",
    description: "Stop guessing which crops pay off. See real margins and double down on winners.",
  },
  {
    icon: Clock,
    title: "Save Hours Every Week",
    description: "No more spreadsheets. Your data lives in one place, always up to date.",
  },
  {
    icon: Scaling,
    title: "Scale with Confidence",
    description: "Know exactly how many racks, trays, and crops you need to hit your revenue targets.",
  },
  {
    icon: ShieldCheck,
    title: "Data You Can Trust",
    description: "Built on your actual farm inputs — not generic industry averages or templates.",
  },
  {
    icon: Zap,
    title: "Faster Decisions",
    description: "Cut underperforming crops, optimize mixes, and adjust pricing in minutes.",
  },
  {
    icon: Users,
    title: "Built for Growers",
    description: "Designed by people who understand microgreens operations, not generic SaaS.",
  },
];

const Benefits = () => (
  <section className="py-24 md:py-32 section-padding bg-primary text-primary-foreground">
    <div className="container-wide">
      <ScrollReveal>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-3 block text-body">
            Why Growers Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl tracking-tight mb-4">
            Turn Guesswork Into a Business Plan
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            Casa Grows IQ gives you the clarity to run your microgreens farm like a real business.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {benefits.map((b, i) => (
          <ScrollReveal key={b.title} delay={i * 0.08}>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center shrink-0">
                <b.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-lg mb-1 text-primary-foreground">{b.title}</h3>
                <p className="text-sm text-primary-foreground/65 leading-relaxed">{b.description}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default Benefits;
