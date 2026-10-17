export type MusicReleaseRow = {
  id: string;
  title: string;
  slug: string;
  kind: string;
  phase_label: string;
  note: string | null;
  cover_image_url: string | null;
  listen_url: string | null;
  display_order: number;
  status: string;
  release_date: string | null;
  created_at: string;
};
