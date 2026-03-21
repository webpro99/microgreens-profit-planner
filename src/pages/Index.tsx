import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Dashboard from "@/components/landing/Dashboard";
import Projections from "@/components/landing/Projections";
import Benefits from "@/components/landing/Benefits";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <Hero />
    <Features />
    <HowItWorks />
    <Dashboard />
    <Projections />
    <Benefits />
    <CTA />
    <Footer />
  </div>
);

export default Index;
