import { createFileRoute, Link } from "@tanstack/react-router";
import heroData from "@/assets/hero-data.jpg";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  component: Index,
});

const services = [
  {
    n: "01. Fractional CTO",
    title: "Strategic Leadership",
    body: "High-level technical roadmap planning, hiring pipeline optimization, and executive alignment for Series A–C startups.",
  },
  {
    n: "02. Tech Audit",
    title: "Infrastructure Review",
    body: "Deep-dive analysis of cloud architecture, security posture, and CI/CD pipelines to ensure maximum operational efficiency.",
  },
  {
    n: "03. Talent OS",
    title: "IC Performance",
    body: "Designing individual contributor tracks that retain top engineering talent and foster a culture of technical mastery.",
  },
];

const methodSteps = [
  { k: "/01", t: "Discovery", d: "60-min diagnostic call. We map your current state, constraints, and the leverage points." },
  { k: "/02", t: "Mandate", d: "A written engagement scope — deliverables, cadence, and success criteria. No retainers without clarity." },
  { k: "/03", t: "Execution", d: "Direct work with a principal advisor. Weekly artifacts, async messaging, async-first cadence." },
  { k: "/04", t: "Handoff", d: "Documented playbooks, decision logs, and a runway for you to operate independently." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-3 bg-accent" />
          <span className="font-mono text-sm tracking-tighter font-bold uppercase">
            Grab / Tech.Advisory
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          <Link to="/method" className="hover:text-accent transition-colors">The Method</Link>
          <Link to="/network" className="hover:text-accent transition-colors">Network</Link>
          <Link to="/services" className="hover:text-accent transition-colors">Services</Link>
          <ThemeToggle />
          <Link to="/contact" className="px-5 py-2 border border-border text-foreground hover:border-accent hover:text-accent transition-all">
            Initialize_Contact
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative px-6 md:px-10 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 grid-noise opacity-50 pointer-events-none" />
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 mb-8 px-3 py-1 border border-accent/30 bg-accent/5">
              <span className="size-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent">
                Q2 mandates open · 4 slots
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-[120px] font-extrabold leading-[0.85] tracking-tighter">
              ENGINEERING
              <br />
              <span className="text-accent">EXCELLENCE</span>
            </h1>
            <p className="mt-10 text-lg md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
              Specialized consultancy for senior tech leadership. We optimize engineering cultures, scale distributed systems, and architect high-frequency growth engines.
            </p>
            <div className="mt-12 flex flex-wrap gap-4">
              <button className="px-7 py-4 bg-accent text-accent-foreground font-bold text-xs uppercase tracking-widest hover:brightness-110 transition">
                Request Audit
              </button>
              <button className="px-7 py-4 border border-border font-bold text-xs uppercase tracking-widest hover:bg-surface transition">
                View Portfolio
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-end">
            <div className="p-6 border border-border bg-surface/60 backdrop-blur-sm">
              <div className="flex gap-2 mb-4">
                <div className="size-2 rounded-full bg-red-500/60" />
                <div className="size-2 rounded-full bg-yellow-500/60" />
                <div className="size-2 rounded-full bg-green-500/60" />
              </div>
              <div className="font-mono text-[12px] leading-relaxed">
                <p className="text-accent">{"> grab --analyze system-architecture"}</p>
                <p className="text-muted-foreground mt-2">[INFO] Identifying bottlenecks…</p>
                <p className="text-muted-foreground">[INFO] Latency reduced by 40%</p>
                <p className="text-muted-foreground">[INFO] Scalability metrics: OPTIMAL</p>
                <p className="mt-2">
                  Status: <span className="text-green-400">Ready to deploy</span>
                </p>
                <p className="mt-3 text-accent cursor-blink">{"> _"}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Metrics strip */}
      <section className="px-6 md:px-10 py-10 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono">
          {[
            ["140+", "Mandates closed"],
            ["$18M+", "Incremental comp"],
            ["12yr", "Avg. advisor tenure"],
            ["98%", "Retainer renewal"],
          ].map(([v, l]) => (
            <div key={l} className="flex flex-col">
              <span className="text-3xl md:text-4xl font-extrabold tracking-tighter">{v}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="px-6 md:px-10 py-20 border-t border-border">
        <div className="mb-12 flex items-end justify-between">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            /Core_Services
          </h2>
          <span className="font-mono text-xs text-muted-foreground hidden md:block">
            Engagement window: 6–12 weeks
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
          {services.map((s) => (
            <div
              key={s.n}
              className="bg-background p-10 md:p-12 hover:bg-surface transition-colors group"
            >
              <span className="font-mono text-xs text-accent mb-8 block underline decoration-accent/30 underline-offset-4">
                {s.n}
              </span>
              <h3 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.body}</p>
              <div className="mt-12 h-px w-0 group-hover:w-full bg-accent transition-all duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* Method */}
      <section id="method" className="px-6 md:px-10 py-20 border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6">
              /The_Method
            </h2>
            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-[0.95]">
              Diagnose. Mandate. Execute.
            </h3>
            <p className="mt-6 text-muted-foreground leading-relaxed max-w-md">
              A deliberate cadence built around the time-on-task realities of senior operators. No fluff, no rituals — only artifacts.
            </p>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border border-border">
            {methodSteps.map((s) => (
              <div key={s.k} className="bg-background p-8">
                <span className="font-mono text-xs text-accent">{s.k}</span>
                <h4 className="text-xl font-bold mt-4 mb-3 tracking-tight">{s.t}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual */}
      <section id="network" className="px-6 md:px-10 pb-20">
        <div className="relative w-full aspect-[2.4/1] border border-border overflow-hidden">
          <img
            src={heroData}
            alt="Network of glowing data nodes"
            width={1440}
            height={600}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                /Network_Density
              </span>
              <p className="mt-3 text-2xl md:text-4xl font-extrabold tracking-tighter max-w-xl">
                Advisors from Stripe, Linear, Vercel, OpenAI &amp; Mercury.
              </p>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">GRB-NET-04</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-10 py-28 border-t border-border text-center">
        <span className="font-mono text-xs text-accent uppercase tracking-widest">
          /Ready_To_Deploy
        </span>
        <h2 className="mt-6 text-4xl md:text-7xl font-extrabold tracking-tighter">
          Initialize the next mandate.
        </h2>
        <p className="mt-6 max-w-xl mx-auto text-muted-foreground leading-relaxed">
          Selective entry. We work with a limited number of operators per quarter to keep the signal high.
        </p>
        <Link to="/contact" className="inline-block mt-10 px-10 py-5 bg-accent text-accent-foreground font-bold text-xs uppercase tracking-widest hover:brightness-110 transition">
          Apply for Engagement →
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-10 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-6 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
        <div>© 2026 Grab Advisory Group</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-foreground">Twitter</a>
          <a href="#" className="hover:text-foreground">Github</a>
          <a href="#" className="hover:text-foreground">LinkedIn</a>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-accent animate-pulse" />
          <span>System Status: Optimal</span>
        </div>
      </footer>
    </div>
  );
}
