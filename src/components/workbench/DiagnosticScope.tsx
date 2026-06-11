import {
  DIAGNOSTIC_PILLARS,
  DIAGNOSTIC_POSITIONING,
  READINESS_AREAS,
} from "@/lib/diagnostic-positioning";

export function DiagnosticScope({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-accent/20 bg-accent-muted/30 p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-accent">
        RightSense diagnostic scope
      </div>
      <h2 className="mt-1 text-lg font-bold text-foreground">
        {DIAGNOSTIC_POSITIONING}
      </h2>
      <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {DIAGNOSTIC_PILLARS.map((pillar) => (
          <div
            key={pillar}
            className="rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm font-medium text-foreground"
          >
            {pillar}
          </div>
        ))}
      </div>
      {!compact && (
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {READINESS_AREAS.map((area) => (
            <div
              key={area.title}
              className="rounded-xl border border-border-subtle bg-white p-4"
            >
              <div className="text-sm font-semibold text-foreground">
                {area.title}
              </div>
              <ul className="mt-2 space-y-1.5 text-xs text-foreground-secondary">
                {area.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
