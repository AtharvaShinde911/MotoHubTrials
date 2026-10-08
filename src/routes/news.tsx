import { createFileRoute } from "@tanstack/react-router";

import { PageBody, PageHero, SiteShell, Tile } from "@/components/site";
import { news } from "@/lib/mock-data";

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [{ title: "Auto News — MOTOHUB" }] }),
  component: NewsPage,
});

function NewsPage() {
  const [lead, ...rest] = news;
  return (
    <SiteShell>
      <PageHero
        eyebrow="Auto News"
        title={
          <>
            The latest from the <span className="text-primary">fast lane</span>.
          </>
        }
        intro="Launches, reviews and scoops from across the car and bike world. Placeholder stories for now; a live feed comes later."
      />
      <PageBody>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          <Tile className="lg:col-span-2">
            <div
              className={`relative h-56 sm:h-72 overflow-hidden rounded-2xl bg-gradient-to-br ${lead.grad}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
              <span className="absolute bottom-3 left-3 rounded-md bg-background/70 px-2 py-1 text-[10px] font-bold tracking-wider">
                {lead.tag}
              </span>
            </div>
            <span className="mt-4 inline-block w-fit rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {lead.source}
            </span>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold leading-snug">{lead.title}</h2>
            <p className="mt-2 text-xs text-foreground/50">{lead.meta}</p>
          </Tile>

          <div className="flex flex-col gap-4 sm:gap-5">
            {rest.slice(0, 2).map((n) => (
              <Tile key={n.title}>
                <span className="inline-block w-fit rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {n.source}
                </span>
                <h3 className="mt-2 font-semibold leading-snug">{n.title}</h3>
                <p className="mt-2 text-[11px] text-foreground/50">{n.meta}</p>
              </Tile>
            ))}
          </div>
        </div>

        <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {rest.slice(2).map((n) => (
            <li
              key={n.title}
              className="flex gap-4 rounded-2xl border border-border/60 bg-white/[0.02] p-3"
            >
              <div
                className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${n.grad}`}
              >
                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-background/70 px-1.5 py-0.5 text-[9px] font-bold tracking-wider">
                  {n.tag}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold leading-snug line-clamp-2">{n.title}</h3>
                <p className="mt-1 text-[11px] text-foreground/50">
                  {n.source} · {n.meta}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </PageBody>
    </SiteShell>
  );
}
