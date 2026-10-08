import { createFileRoute } from "@tanstack/react-router";

import { Icon, PageBody, PageHero, SiteShell } from "@/components/site";
import { events } from "@/lib/mock-data";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events — MOTOHUB" }] }),
  component: EventsPage,
});

function EventsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Events"
        title={
          <>
            Meets, rallies and <span className="text-primary">track days</span>.
          </>
        }
        intro="Upcoming events across India. Dates and venues are placeholders until listings are confirmed."
      />
      <PageBody>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {events.map((e) => (
            <li
              key={e.name}
              className="flex gap-4 rounded-3xl border border-border bg-white/[0.03] p-5"
            >
              <div className="flex h-fit flex-col items-center justify-center rounded-xl bg-primary px-4 py-2 text-primary-foreground leading-tight">
                <span className="text-2xl font-black">{e.d}</span>
                <span className="text-[10px] font-bold tracking-widest">{e.m}</span>
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold">{e.name}</h2>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-foreground/60">
                  <Icon.Pin className="h-3 w-3" /> {e.city}
                </p>
                <p className="mt-2 text-sm text-foreground/60">{e.blurb}</p>
              </div>
            </li>
          ))}
        </ul>
      </PageBody>
    </SiteShell>
  );
}
