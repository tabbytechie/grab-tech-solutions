import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageNav } from "./method";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Initialize Contact — Grab Tech Advisory" },
      {
        name: "description",
        content:
          "Open a mandate with Grab. Selective entry, principal advisors, fixed engagement windows.",
      },
      { property: "og:title", content: "Initialize Contact — Grab" },
      {
        property: "og:description",
        content: "Selective entry. Limited operators per quarter.",
      },
    ],
  }),
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PageNav />

      <section className="px-6 md:px-10 py-20 md:py-28 border-b border-border">
        <span className="font-mono text-xs uppercase tracking-widest text-accent">
          /Initialize_Contact
        </span>
        <h1 className="mt-6 text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.9]">
          Open a
          <br />
          <span className="text-accent">mandate.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
          Four slots remain for Q2. Send the brief below — a principal advisor responds within
          48 hours, or not at all.
        </p>
      </section>

      <section className="px-6 md:px-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="border border-accent/40 bg-accent/5 p-10 font-mono">
                <p className="text-accent text-xs uppercase tracking-widest">
                  /Transmission_Received
                </p>
                <p className="mt-4 text-2xl font-bold tracking-tight">
                  Brief queued. Expect a principal reply within 48h.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-8 font-mono"
              >
                <Field label="01_Name" name="name" placeholder="Operator name" required />
                <Field
                  label="02_Email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                />
                <Field
                  label="03_Company / Stage"
                  name="company"
                  placeholder="Acme · Series B"
                  required
                />
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                    04_Mandate_Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border border border-border">
                    {["Fractional CTO", "Tech Audit", "Talent OS"].map((opt) => (
                      <label
                        key={opt}
                        className="bg-background p-4 cursor-pointer hover:bg-surface transition flex items-center gap-3 text-sm"
                      >
                        <input
                          type="radio"
                          name="mandate"
                          value={opt}
                          className="accent-[var(--accent)]"
                          required
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                    05_Brief
                  </label>
                  <textarea
                    name="brief"
                    rows={6}
                    required
                    placeholder="> describe the constraint, the timeline, and what success looks like..."
                    className="w-full bg-surface/50 border border-border p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-10 py-5 bg-accent text-accent-foreground font-bold text-xs uppercase tracking-widest hover:brightness-110 transition"
                >
                  Transmit_Brief →
                </button>
              </form>
            )}
          </div>

          <aside className="lg:col-span-5 space-y-8">
            <div className="border border-border bg-surface/60 p-8 font-mono text-sm">
              <p className="text-accent text-[10px] uppercase tracking-widest">/Direct_Channels</p>
              <ul className="mt-6 space-y-4">
                <li>
                  <span className="text-muted-foreground text-[10px] uppercase tracking-widest block">Signal</span>
                  <span className="text-foreground">@grab.advisory</span>
                </li>
                <li>
                  <span className="text-muted-foreground text-[10px] uppercase tracking-widest block">Email</span>
                  <span className="text-foreground">mandate@grab.advisory</span>
                </li>
                <li>
                  <span className="text-muted-foreground text-[10px] uppercase tracking-widest block">Timezone</span>
                  <span className="text-foreground">UTC ±3 · async-first</span>
                </li>
              </ul>
            </div>
            <div className="border border-border p-8 font-mono text-xs leading-relaxed">
              <p className="text-accent">{"> grab --status"}</p>
              <p className="text-muted-foreground mt-2">[INFO] Q2 slots remaining: 4</p>
              <p className="text-muted-foreground">[INFO] Avg. response: 31h</p>
              <p className="text-muted-foreground">[INFO] Renewal rate: 98%</p>
              <p className="mt-2">
                Status: <span className="text-green-400">Accepting briefs</span>
              </p>
              <p className="mt-3 text-accent cursor-blink">{"> _"}</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full bg-surface/50 border border-border p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition"
      />
    </div>
  );
}
