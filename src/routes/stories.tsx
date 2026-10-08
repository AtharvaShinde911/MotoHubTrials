import { createFileRoute } from "@tanstack/react-router";

import { ArrowButton, Icon, PageBody, PageHero, SiteShell, Tile } from "@/components/site";
import { stories } from "@/lib/mock-data";

export const Route = createFileRoute("/stories")({
  head: () => ({ meta: [{ title: "Garage Stories — MOTOHUB" }] }),
  component: StoriesPage,
});

function StoriesPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Garage Stories"
        title={
          <>
            Builds, road trips and <span className="text-primary">late nights</span> in the garage.
          </>
        }
        intro="Stories from the community, ranked by upvotes. Posting opens once accounts are live."
      />
      <PageBody>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          <ul className="lg:col-span-2 flex flex-col gap-3">
            {stories.map((s) => (
              <li
                key={s.title}
                className="flex gap-4 rounded-2xl border border-border/60 bg-white/[0.02] p-4"
              >
                <div className="flex h-fit flex-col items-center gap-0.5 rounded-lg bg-primary/10 px-2.5 py-2 text-primary">
                  <Icon.Up className="h-4 w-4" />
                  <span className="text-xs font-bold leading-none">{s.up}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/40 text-[10px] font-black">
                      {s.initials}
                    </span>
                    <span className="text-xs text-foreground/50">u/{s.user}</span>
                  </div>
                  <h2 className="mt-2 font-semibold leading-snug">{s.title}</h2>
                  <p className="mt-1 text-sm text-foreground/60">{s.excerpt}</p>
                </div>
              </li>
            ))}
          </ul>

          <Tile className="h-fit">
            <h2 className="text-lg font-bold">Got a story?</h2>
            <p className="mt-2 text-sm text-foreground/60">
              Restorations, road trips, track days, first rides. Share yours with the hub.
            </p>
            <div className="mt-5">
              <ArrowButton variant="outline">Share Your Story</ArrowButton>
            </div>
            <p className="mt-3 text-[11px] text-foreground/40">Submissions open soon.</p>
          </Tile>
        </div>
      </PageBody>
    </SiteShell>
  );
}
