/**
 * Database shape, matching supabase/migrations/*_kiln_accounts.sql.
 *
 * Hand-written rather than generated: `supabase gen types` needs Docker and a
 * management-API session, neither of which is worth requiring just to type
 * seven tables. If the migration changes, change this with it — the two are
 * meant to be read side by side.
 */

type Timestamp = string;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string | null; display_name: string | null; created_at: Timestamp };
        Insert: { id: string; email?: string | null; display_name?: string | null };
        Update: { email?: string | null; display_name?: string | null };
        Relationships: [];
      };
      entitlements: {
        Row: {
          user_id: string;
          plan: "free" | "unlimited";
          status: "active" | "past_due" | "cancelled";
          current_period_end: Timestamp | null;
          source: string;
          updated_at: Timestamp;
        };
        Insert: {
          user_id: string;
          plan?: "free" | "unlimited";
          status?: "active" | "past_due" | "cancelled";
          current_period_end?: Timestamp | null;
          source?: string;
          updated_at?: Timestamp;
        };
        Update: {
          plan?: "free" | "unlimited";
          status?: "active" | "past_due" | "cancelled";
          current_period_end?: Timestamp | null;
          source?: string;
          updated_at?: Timestamp;
        };
        Relationships: [];
      };
      downloads: {
        Row: {
          id: number;
          user_id: string;
          asset_slug: string;
          asset_name: string | null;
          file_name: string | null;
          bytes: number | null;
          created_at: Timestamp;
        };
        Insert: {
          user_id: string;
          asset_slug: string;
          asset_name?: string | null;
          file_name?: string | null;
          bytes?: number | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      saved_collections: {
        Row: { user_id: string; collection_slug: string; created_at: Timestamp };
        Insert: { user_id: string; collection_slug: string };
        Update: Record<string, never>;
        Relationships: [];
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          key_hash: string;
          prefix: string;
          created_at: Timestamp;
          last_used: Timestamp | null;
          revoked_at: Timestamp | null;
        };
        Insert: { user_id: string; name?: string; key_hash: string; prefix: string };
        Update: { revoked_at?: Timestamp | null; last_used?: Timestamp | null; name?: string };
        Relationships: [];
      };
      usage: {
        Row: {
          id: number;
          subject: string;
          user_id: string | null;
          kind: "prompt" | "download";
          asset_slug: string;
          created_at: Timestamp;
        };
        Insert: {
          subject: string;
          user_id?: string | null;
          kind: "prompt" | "download";
          asset_slug: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      saved_assets: {
        Row: { user_id: string; asset_slug: string; created_at: Timestamp };
        Insert: { user_id: string; asset_slug: string };
        Update: Record<string, never>;
        Relationships: [];
      };
      /* Pre-existing, from the demand test. Server-only: RLS is on with no
         policies, so nothing but the service key can reach them. */
      invite_requests: {
        Row: {
          id: string;
          created_at: Timestamp;
          email: string;
          role: string | null;
          shipped: string | null;
          concept: string | null;
          blocker: string | null;
          interview: boolean;
          consent: boolean;
          variant: string;
          source: string;
          qualified: boolean;
          qa: boolean;
          visitor: string | null;
        };
        Insert: {
          email: string;
          role?: string | null;
          shipped?: string | null;
          concept?: string | null;
          blocker?: string | null;
          interview?: boolean;
          consent?: boolean;
          variant?: string;
          source?: string;
          qa?: boolean;
          visitor?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      events: {
        Row: {
          id: number;
          created_at: Timestamp;
          event: string;
          variant: string;
          source: string;
          qa: boolean;
          path: string | null;
          viewport: string | null;
          detail: string | null;
          visitor: string | null;
        };
        Insert: {
          event: string;
          variant?: string;
          source?: string;
          qa?: boolean;
          path?: string | null;
          viewport?: string | null;
          detail?: string | null;
          visitor?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      has_unlimited: { Args: { uid: string }; Returns: boolean };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
