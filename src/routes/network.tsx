import { createFileRoute } from "@tanstack/react-router";
import heroData from "@/assets/hero-data.jpg";
import { PageNav, PageFooterCTA } from "./method";

export const Route = createFileRoute("/network")({
  component: NetworkPage,
  head: () => ({
    meta: [
      { title: "Network — Grab Tech Advisory" },
      {
        name: "description",
        content:
          "Principal advisors from Stripe, Linear, Vercel, OpenAI, and Mercury. The Grab network in operator detail.",
      },
      { property: "og:title", content: "Network — Grab" },
      {
        property: "og:description",
        content: "Battle-tested operators. No theater, no panels, no proxies.",
      },
      { property: "og:image", content: heroData },
    ],
  }),
});

const advisors = [
  { name: "M. Kovač", from: "Ex-Stripe", role: "Payments & latency", tag: "FIN" },
  { name: "A. Rhodes", from: "Ex-Linear", role: "Product velocity", tag: "PRD" },
  { name: "S. Okonkwo", from: "Ex-Vercel", role: "Edge & infra", tag: "INF" },
  { name: "J. Reyes", from: "Ex-OpenAI", role: "Applied research", tag: "ML" },
  { name: "T. Lindqvist", from: "Ex-Mercury", role: "Compliance ops", tag: "OPS" },
  { name: "K. Park", from: "Ex-Datadog", role: "Observability", tag: "OBS" },
];

function NetworkPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PageNav />

      <section className="relative px-6 md:px-10 py-20 md:py-28 border-b border-border overflow-hidden">
        <div className="absolute inset-0 grid-noise opacity-50 pointer-events-none" />
        <div className="relative">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            /Network_Density
          </span>
          <h1 className="mt-6 text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.9]">
            Operators,
            <br />
            <span className="text-accent">not panels.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            A closed bench of principals who have already shipped what you are trying to build. Every mandate
            is matched to a single named advisor — never a pod, never a proxy.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-10 py-20">
        <div className="mb-12 flex items-end justify-between">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            /Principal_Bench
          </h2>
          <span className="font-mono text-xs text-muted-foreground hidden md:block">
            n = 14 active · vetted quarterly
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
          {advisors.map((a) => (
            <article
              key={a.name}
              className="bg-background p-8 hover:bg-surface transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-accent">[{a.tag}]</span>
                <span className="size-2 rounded-full bg-accent animate-pulse" />
              </div>
              <h3 className="mt-6 text-2xl font-bold tracking-tight">{a.name}</h3>
              <p className="mt-1 font-mono text-xs text-muted-foreground uppercase tracking-widest">
                {a.from}
              </p>
              <p className="mt-4 text-muted-foreground">{a.role}</p>
              <div className="mt-6 h-px w-0 group-hover:w-full bg-accent transition-all duration-500" />
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-10 pb-20">
        <div className="relative w-full aspect-[2.4/1] border border-border overflow-hidden">
          <img
            src={heroData}
            alt="Glowing network of advisor nodes"
            width={1440}
            height={600}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 flex flex-wrap items-end justify-between gap-6">
            <p className="text-2xl md:text-4xl font-extrabold tracking-tighter max-w-xl">
              Stripe · Linear · Vercel · OpenAI · Mercury.
            </p>
            <span className="font-mono text-[10px] text-muted-foreground">GRB-NET-04</span>
          </div>
        </div>
      </section>

      <PageFooterCTA />
    </div>
  );
}
