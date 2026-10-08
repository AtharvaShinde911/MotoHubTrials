import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";

import { Avatar, Icon } from "@/components/site";
import { toggleVote } from "@/lib/stories";

export const timeAgo = (ms: number) => {
  const mins = Math.round((Date.now() - ms) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function Byline({
  author,
  createdAt,
}: {
  author: { handle: string; name: string | null; avatarUrl: string | null };
  createdAt: number;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-foreground/50">
      <Avatar
        name={author.name ?? author.handle}
        src={author.avatarUrl}
        className="h-7 w-7 text-[10px]"
      />
      <span>u/{author.handle}</span>
      <span>·</span>
      <span>{timeAgo(createdAt)}</span>
    </div>
  );
}

/** Upvote toggle; sends signed-out visitors to sign in first. */
export function VoteButton({
  id,
  upvotes,
  voted,
}: {
  id: string;
  upvotes: number;
  voted: boolean;
}) {
  const { user } = useRouteContext({ from: "__root__" });
  const navigate = useNavigate();
  const [state, setState] = useState({ upvotes, voted });
  const [busy, setBusy] = useState(false);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.handle) {
      return navigate({ to: "/signin", search: { next: `/stories/${id}` } });
    }
    setBusy(true);
    try {
      const res = await toggleVote({ data: { id } });
      if (res.ok) setState({ upvotes: res.upvotes, voted: res.voted });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={state.voted}
      aria-label={state.voted ? "Remove upvote" : "Upvote"}
      className={
        "flex h-fit flex-col items-center gap-0.5 rounded-lg px-2.5 py-2 transition-colors " +
        (state.voted
          ? "bg-primary text-primary-foreground"
          : "bg-primary/10 text-primary hover:bg-primary/20")
      }
    >
      <Icon.Up className="h-4 w-4" />
      <span className="text-xs font-bold leading-none">{state.upvotes}</span>
    </button>
  );
}

export const StoryLink = ({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <Link to="/stories/$id" params={{ id }} className={className}>
    {children}
  </Link>
);
