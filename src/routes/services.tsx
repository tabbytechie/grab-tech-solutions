import { createFileRoute } from "@tanstack/react-router";
import { PageNav, PageFooterCTA } from "./method";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "Services — Grab Tech Advisory" },
      {
        name: "description",
        content:
          "Fractional CTO, Tech Audit, and Talent OS. Three engagement shapes for senior tech operators.",
      },
      { property: "og:title", content: "Services — Grab" },
      {
        property: "og:description",
        content: "Three engagement shapes. Six to twelve weeks. Operator-grade output.",
      },
    ],
  }),
});

const services = [
  {
    n: "01. Fractional CTO",
    title: "Strategic Leadership",
    body: "High-level technical roadmap planning, hiring pipeline optimization, and executive alignment for Series A–C startups.",
    window: "12 weeks",
    fit: "Series A → C",
    incl: ["Roadmap synthesis", "Hiring loop design", "Board-ready memos", "Weekly office hours"],
  },
  {
    n: "02. Tech Audit",
    title: "Infrastructure Review",
    body: "Deep-dive analysis of cloud architecture, security posture, and CI/CD pipelines to ensure maximum operational efficiency.",
    window: "6 weeks",
    fit: "Pre-scale teams",
    incl: ["Architecture map", "Risk register", "Cost-to-serve model", "Remediation backlog"],
  },
  {
    n: "03. Talent OS",
    title: "IC Performance",
    body: "Designing individual contributor tracks that retain top engineering talent and foster a culture of technical mastery.",
    window: "8 weeks",
    fit: "30 – 200 engineers",
    incl: ["Career matrix", "Calibration playbook", "Comp bands", "Manager enablement"],
  },
];

function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PageNav />

      <section className="px-6 md:px-10 py-20 md:py-28 border-b border-border">
        <span className="font-mono text-xs uppercase tracking-widest text-accent">
          /Core_Services
        </span>
        <h1 className="mt-6 text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.9]">
          Three shapes.
          <br />
          <span className="text-accent">Zero retainers.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
          Each mandate is scoped to a fixed window with named deliverables. We don&apos;t bill for
          presence — we bill for the artifact.
        </p>
      </section>

      <section className="px-6 md:px-10 py-20">
        <div className="space-y-px bg-border border border-border">
          {services.map((s) => (
            <article
              key={s.n}
              className="bg-background p-8 md:p-12 hover:bg-surface transition-colors group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                  <span className="font-mono text-xs text-accent underline decoration-accent/30 underline-offset-4">
                    {s.n}
                  </span>
                  <h2 className="mt-6 text-3xl md:text-4xl font-bold tracking-tight">{s.title}</h2>
                  <p className="mt-4 text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
                <div className="lg:col-span-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Includes
                  </span>
                  <ul className="mt-4 space-y-2 font-mono text-sm">
                    {s.incl.map((i) => (
                      <li key={i}>
                        <span className="text-accent">→</span> {i}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Window
                    </span>
                    <p className="mt-2 text-2xl font-extrabold tracking-tighter">{s.window}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Best fit
                    </span>
                    <p className="mt-2 text-2xl font-extrabold tracking-tighter">{s.fit}</p>
                  </div>
                </div>
              </div>
              <div className="mt-10 h-px w-0 group-hover:w-full bg-accent transition-all duration-500" />
            </article>
          ))}
        </div>
      </section>

      <PageFooterCTA />
    </div>
  );
}
