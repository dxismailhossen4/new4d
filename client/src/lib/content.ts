/** Midnight Ledger system: data is read from Supabase; no fabricated tips, results, or payments exist in UI state. */
export type MembershipStatus = "inactive" | "pending" | "active" | "expired";
export type PaymentStatus = "pending" | "approved" | "rejected" | "more_info";
export type ContentStatus = "draft" | "published" | "archived";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "user" | "admin";
  created_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  status: MembershipStatus;
  expires_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  membership_id: string | null;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id: string;
  screenshot_url: string | null;
  status: PaymentStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: string;
  game_name: string;
  draw_date: string;
  tip_numbers: string[] | string | null;
  analysis: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  confidence_label: string | null;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
}

export interface ResultRecord {
  id: string;
  game_name: string;
  result_date: string;
  result_number: string;
  category: string;
  source_url: string | null;
  status: ContentStatus;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  status: ContentStatus;
}

export const disclaimer =
  "Predictions and tips are for informational and entertainment purposes only. No prediction can guarantee a winning result. Users should participate responsibly and comply with applicable laws and age requirements.";

export const formatDate = (value?: string | null) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? "Not available"
    : new Intl.DateTimeFormat("en-MY", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

export const formatNumbers = (value: Prediction["tip_numbers"]) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return value.split(/[\s,|]+/).filter(Boolean);
  return [];
};

export const membershipLabel = (status?: MembershipStatus | null) =>
  (status || "inactive").replace(/_/g, " ");
