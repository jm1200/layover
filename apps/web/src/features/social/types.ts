export type LikeTarget =
  | { kind: "place"; id: string }
  | { kind: "playbook"; id: string };

export type SocialKind = "place" | "playbook";

export const MAX_COMMENT_PHOTOS = 3;

export type CommentPhoto = { id: string; src: string };

export type CommentRow = {
  id: string;
  place_id: string | null;
  playbook_id: string | null;
  author_id: string;
  body: string;
  created_at: string;
  byline: string;
  photos: CommentPhoto[];
};
