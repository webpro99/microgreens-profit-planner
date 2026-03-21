import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const CTA = () => (
  <section id="cta" className="py-24 md:py-32 section-padding">
    <div className="container-narrow">
      <ScrollReveal>
        <div className="bg-surface-green rounded-3xl p-10 md:p-16 text-center border border-border/40">
          <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-3 block text-body">
            Ready to Grow Smarter?
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-tight text-foreground mb-6">
            Start Making Data-Driven Growing Decisions Today
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Join microgreens growers who replaced spreadsheets and guesswork with a profit engine
            that tells them exactly what to grow, how much to charge, and when to scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl">
              Start Your 14-Day Free Trial
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Book a Demo
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            No credit card required · Set up in under 5 minutes · Cancel anytime
          </p>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default CTA;
