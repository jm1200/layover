export type LikeTarget =
  | { kind: "place"; id: string }
  | { kind: "playbook"; id: string };

export type CommentRow = {
  id: string;
  playbook_id: string;
  author_id: string;
  body: string;
  created_at: string;
  byline: string;
};
