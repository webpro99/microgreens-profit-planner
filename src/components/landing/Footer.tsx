import { Sprout } from "lucide-react";

const footerLinks = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Roadmap", "Changelog"],
  },
  {
    title: "Resources",
    links: ["Documentation", "Blog", "Community", "Support"],
  },
  {
    title: "Company",
    links: ["About", "Contact", "Privacy", "Terms"],
  },
];

const Footer = () => (
  <footer className="border-t border-border py-16 section-padding">
    <div className="container-wide">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <a href="#" className="flex items-center gap-2 text-primary font-semibold text-lg mb-4">
            <Sprout className="w-5 h-5" />
            <span className="text-body tracking-tight">Casa Grows IQ</span>
          </a>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The smart profit engine for microgreens farms. Built by growers, for growers.
          </p>
        </div>
        {footerLinks.map((col) => (
          <div key={col.title}>
            <span className="text-sm font-semibold text-foreground block mb-4 text-body">{col.title}</span>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border mt-12 pt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Casa Grows IQ. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
