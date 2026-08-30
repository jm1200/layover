"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useTransition } from "react";
import {
  addComment,
  deleteComment,
  type SocialState,
} from "@/features/social/actions";
import type { CommentRow } from "@/features/social/types";

const initial: SocialState = {};

export function CommentThread({
  playbookId,
  comments,
  loggedIn,
  userId,
  nextPath,
}: {
  playbookId: string;
  comments: CommentRow[];
  loggedIn: boolean;
  userId: string | null;
  nextPath: string;
}) {
  const bound = addComment.bind(null, playbookId);
  const [state, action, pending] = useActionState(bound, initial);
  const [delPending, startDel] = useTransition();
  const router = useRouter();

  return (
    <section className="mt-14 border-t border-zinc-200 pt-10">
      <h2 className="font-mono text-sm uppercase tracking-[0.28em] text-zinc-400">
        Comments
      </h2>
      {comments.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">None yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {comments.map((c) => (
            <li key={c.id}>
              <p className="text-sm font-medium text-zinc-800">{c.byline}</p>
              <p className="mt-0.5 whitespace-pre-wrap text-zinc-700">{c.body}</p>
              {userId === c.author_id ? (
                <button
                  type="button"
                  disabled={delPending}
                  className="mt-1 text-xs text-zinc-500 underline disabled:opacity-60"
                  onClick={() =>
                    startDel(async () => {
                      await deleteComment(c.id, playbookId);
                      router.refresh();
                    })
                  }
                >
                  Take off
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {loggedIn ? (
        <form action={action} className="mt-6 max-w-lg">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Leave a note</span>
            <textarea
              name="body"
              required
              maxLength={500}
              rows={3}
              placeholder="Been? Add a line."
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          {state.error ? (
            <p className="mt-2 text-sm text-red-700" role="alert">
              {state.error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-3 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Adding…" : "Add"}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">
          <Link
            href={`/login?next=${encodeURIComponent(nextPath)}`}
            className="underline"
          >
            Log in
          </Link>{" "}
          to leave a note.
        </p>
      )}
    </section>
  );
}
