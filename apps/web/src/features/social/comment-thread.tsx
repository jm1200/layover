"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  addComment,
  deleteComment,
  editComment,
  type SocialState,
} from "@/features/social/actions";
import {
  CommentPhotoGrid,
  DraftCommentPhotos,
  OwnCommentPhotos,
} from "@/features/social/comment-photos";
import type { CommentRow, SocialKind } from "@/features/social/types";

const initial: SocialState = {};

export function CommentThread({
  kind,
  id,
  comments,
  loggedIn,
  userId,
  nextPath,
}: {
  kind: SocialKind;
  id: string;
  comments: CommentRow[];
  loggedIn: boolean;
  userId: string | null;
  nextPath: string;
}) {
  const bound = addComment.bind(null, kind, id);
  const [state, action, pending] = useActionState(bound, initial);
  const [delPending, startDel] = useTransition();
  const [editPending, startEdit] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [photoKey, setPhotoKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!state.success || pending) return;
    formRef.current?.reset();
    setPhotoKey((n) => n + 1);
  }, [state.success, pending]);

  return (
    <section className="mt-14 border-t border-zinc-200 pt-10">
      <h2 className="font-mono text-sm uppercase tracking-[0.28em] text-zinc-400">
        Comments
      </h2>
      {comments.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">None yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {comments.map((c) => {
            const mine = userId === c.author_id;
            const editing = editingId === c.id;
            return (
              <li key={c.id}>
                <p className="text-sm font-medium text-zinc-800">{c.byline}</p>
                {editing ? (
                  <div className="mt-1 max-w-lg">
                    <label className="sr-only" htmlFor={`edit-note-${c.id}`}>
                      Edit note
                    </label>
                    <textarea
                      id={`edit-note-${c.id}`}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      required
                      maxLength={500}
                      rows={3}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                    />
                    {editError ? (
                      <p className="mt-2 text-sm text-red-700" role="alert">
                        {editError}
                      </p>
                    ) : null}
                    <div className="mt-2 flex gap-3">
                      <button
                        type="button"
                        aria-label="Save note"
                        disabled={editPending}
                        className="text-xs text-zinc-800 underline disabled:opacity-60"
                        onClick={() =>
                          startEdit(async () => {
                            setEditError(null);
                            const r = await editComment(c.id, kind, id, draft);
                            if (r.error) {
                              setEditError(r.error);
                              return;
                            }
                            setEditingId(null);
                            router.refresh();
                          })
                        }
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        disabled={editPending}
                        className="text-xs text-zinc-500 underline disabled:opacity-60"
                        onClick={() => {
                          setEditingId(null);
                          setEditError(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-0.5 whitespace-pre-wrap text-zinc-700">
                    {c.body}
                  </p>
                )}
                {mine && userId ? (
                  <OwnCommentPhotos
                    commentId={c.id}
                    kind={kind}
                    targetId={id}
                    photos={c.photos}
                    userId={userId}
                  />
                ) : (
                  <CommentPhotoGrid photos={c.photos} />
                )}
                {mine ? (
                  <div className="mt-1 flex gap-3">
                    {!editing ? (
                      <button
                        type="button"
                        aria-label="Edit note"
                        className="text-xs text-zinc-500 underline"
                        onClick={() => {
                          setEditingId(c.id);
                          setDraft(c.body);
                          setEditError(null);
                        }}
                      >
                        Edit
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={delPending}
                      className="text-xs text-zinc-500 underline disabled:opacity-60"
                      onClick={() =>
                        startDel(async () => {
                          await deleteComment(c.id, kind, id);
                          router.refresh();
                        })
                      }
                    >
                      Take off
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {loggedIn && userId ? (
        <form ref={formRef} action={action} className="mt-6 max-w-lg">
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
          <DraftCommentPhotos key={photoKey} userId={userId} />
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
