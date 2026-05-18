import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/method")({
  component: MethodPage,
  head: () => ({
    meta: [
      { title: "The Method — Grab Tech Advisory" },
      {
        name: "description",
        content:
          "Discovery, Mandate, Execution, Handoff. The deliberate cadence Grab uses to deliver high-signal engineering advisory.",
      },
      { property: "og:title", content: "The Method — Grab" },
      {
        property: "og:description",
        content: "A four-phase operating system for senior tech mandates.",
      },
    ],
  }),
});

const phases = [
  {
    k: "/01",
    t: "Discovery",
    d: "A 60-minute diagnostic call. We map current state, constraints, leverage points, and the operator-shaped gaps that compound over the next 12 months.",
    out: ["Diagnostic memo", "Constraint map", "Leverage index"],
  },
  {
    k: "/02",
    t: "Mandate",
    d: "A written engagement scope — deliverables, cadence, success criteria, and exit conditions. No retainers without clarity. No clarity without a mandate.",
    out: ["Engagement scope", "Success criteria", "Cadence contract"],
  },
  {
    k: "/03",
    t: "Execution",
    d: "Direct work with a principal advisor. Weekly artifacts, async-first messaging, no theater. Every meeting produces a decision, every week produces a deliverable.",
    out: ["Weekly artifacts", "Decision log", "Async review loop"],
  },
  {
    k: "/04",
    t: "Handoff",
    d: "Documented playbooks, decision logs, and a runway for you to operate independently. The mandate ends; the operating muscle stays.",
    out: ["Playbook bundle", "Runway brief", "30/60/90 plan"],
  },
];

function MethodPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PageNav />
      <section className="px-6 md:px-10 py-20 md:py-28 border-b border-border">
        <span className="font-mono text-xs uppercase tracking-widest text-accent">
          /The_Method
        </span>
        <h1 className="mt-6 text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.9]">
          Diagnose.
          <br />
          Mandate.
          <br />
          <span className="text-accent">Execute.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
          A deliberate cadence built around the time-on-task realities of senior operators. No fluff,
          no rituals — only artifacts and decisions.
        </p>
      </section>

      <section className="px-6 md:px-10 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
          {phases.map((p) => (
            <div key={p.k} className="bg-background p-8 md:p-12 hover:bg-surface transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-accent">{p.k}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Phase
                </span>
              </div>
              <h2 className="mt-6 text-3xl md:text-4xl font-bold tracking-tight">{p.t}</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">{p.d}</p>
              <div className="mt-8 pt-6 border-t border-border">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Artifacts
                </span>
                <ul className="mt-3 space-y-1 font-mono text-xs">
                  {p.out.map((o) => (
                    <li key={o} className="text-foreground">
                      <span className="text-accent">→</span> {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <PageFooterCTA />
    </div>
  );
}

function PageNav() {
  return (
    <nav className="flex items-center justify-between px-6 md:px-10 py-6 border-b border-border">
      <Link to="/" className="flex items-center gap-2">
        <div className="size-3 bg-accent" />
        <span className="font-mono text-sm tracking-tighter font-bold uppercase">
          Grab / Tech.Advisory
        </span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
        <Link to="/method" activeProps={{ className: "text-accent" }} className="hover:text-accent transition-colors">The Method</Link>
        <Link to="/network" activeProps={{ className: "text-accent" }} className="hover:text-accent transition-colors">Network</Link>
        <Link to="/services" activeProps={{ className: "text-accent" }} className="hover:text-accent transition-colors">Services</Link>
        <ThemeToggle />
        <Link to="/contact" className="px-5 py-2 border border-border text-foreground hover:border-accent hover:text-accent transition-all">
          Initialize_Contact
        </Link>
      </div>
    </nav>
  );
}

function PageFooterCTA() {
  return (
    <section className="px-6 md:px-10 py-24 border-t border-border text-center">
      <span className="font-mono text-xs text-accent uppercase tracking-widest">
        /Ready_To_Deploy
      </span>
      <h2 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tighter">
        Open a mandate.
      </h2>
      <Link
        to="/contact"
        className="inline-block mt-10 px-10 py-5 bg-accent text-accent-foreground font-bold text-xs uppercase tracking-widest hover:brightness-110 transition"
      >
        Initialize_Contact →
      </Link>
    </section>
  );
}

export { PageNav, PageFooterCTA };
