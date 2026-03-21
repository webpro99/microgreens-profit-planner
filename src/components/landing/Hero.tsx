import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import heroImg from "@/assets/hero-microgreens.jpg";

const Hero = () => (
  <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 section-padding overflow-hidden">
    {/* Background image with overlay */}
    <div className="absolute inset-0 z-0">
      <img src={heroImg} alt="Microgreens growing in trays" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/50" />
    </div>

    <div className="container-wide relative z-10">
      <div className="max-w-2xl">
        <ScrollReveal>
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-accent mb-4 text-body">
            Smart Profit Engine for Microgreens
          </span>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl leading-[1.08] tracking-tight text-foreground mb-6">
            Know Exactly Which Crops Make You Money
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.16}>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8 leading-relaxed">
            Casa Grows IQ replaces spreadsheets and guesswork with a real-time profit engine
            built for microgreens growers. See your margins, plan production, and scale with confidence.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.24}>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="xl">
              Start Your Free Trial
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button variant="heroOutline" size="xl">
              See How It Works
            </Button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.35}>
          <div className="flex items-center gap-8 mt-10 text-sm text-muted-foreground">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground text-body tabular-nums">14-day</span>
              <span>free trial</span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground text-body tabular-nums">Real</span>
              <span>farm data</span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground text-body tabular-nums">Zero</span>
              <span>guesswork</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  </section>
);

export default Hero;
