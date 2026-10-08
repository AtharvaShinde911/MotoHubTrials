import { createFileRoute } from "@tanstack/react-router";

import { PageBody, PageHero, SiteShell } from "@/components/site";
import { products } from "@/lib/mock-data";

export const Route = createFileRoute("/merch")({
  head: () => ({ meta: [{ title: "Merch Store — MOTOHUB" }] }),
  component: MerchPage,
});

function MerchPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Merch Store"
        title={
          <>
            Wear the <span className="text-accent">hub</span>.
          </>
        }
        intro="Official MOTOHUB tees. Checkout isn't live yet, so this is a preview of the range."
      />
      <PageBody>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
          {products.map((p) => (
            <div
              key={p.name}
              className="group rounded-2xl border border-border/60 bg-white/[0.02] p-3 transition-colors hover:border-accent/60"
            >
              <div
                className={`relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br ${p.grad}`}
              >
                {/* tee silhouette */}
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 h-full w-full p-6 text-white/85"
                  fill="currentColor"
                >
                  <path d="M20 25 L35 15 Q50 25 65 15 L80 25 L72 38 L65 33 L65 85 L35 85 L35 33 L28 38 Z" />
                </svg>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold truncate">{p.name}</p>
                <span className="rounded-md bg-accent px-1.5 py-0.5 text-xs font-black text-accent-foreground">
                  {p.price}
                </span>
              </div>
              <button
                type="button"
                disabled
                className="mt-3 w-full rounded-full border border-border py-2 text-xs font-semibold text-foreground/50"
              >
                Coming soon
              </button>
            </div>
          ))}
        </div>
      </PageBody>
    </SiteShell>
  );
}
