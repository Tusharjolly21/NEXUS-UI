export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      api_tokens: {
        Row: {
          id: string;
          user_id: string;
          token_hash: string;
          token_hint: string;
          created_at: string;
          last_used_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_hash: string;
          token_hint: string;
          created_at?: string;
          last_used_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          token_hash?: string;
          token_hint?: string;
          created_at?: string;
          last_used_at?: string | null;
        };
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          company: string | null;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          company?: string | null;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          company?: string | null;
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          kind: "component" | "template" | "block";
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: "component" | "template" | "block";
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kind?: "component" | "template" | "block";
          slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          provider_order_id: string;
          provider_product_id: string;
          provider_variant_id: string | null;
          product_type: "component" | "template" | "lifetime";
          product_slug: string | null;
          status: "paid" | "refunded";
          amount_cents: number;
          currency: string;
          created_at: string;
          provider: string;
          customer_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider_order_id: string;
          provider_product_id: string;
          provider_variant_id?: string | null;
          product_type: "component" | "template" | "lifetime";
          product_slug?: string | null;
          status?: "paid" | "refunded";
          amount_cents: number;
          currency?: string;
          created_at?: string;
          provider?: string;
          customer_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider_order_id?: string;
          provider_product_id?: string;
          provider_variant_id?: string | null;
          product_type?: "component" | "template" | "lifetime";
          product_slug?: string | null;
          status?: "paid" | "refunded";
          amount_cents?: number;
          currency?: string;
          created_at?: string;
          provider?: string;
          customer_id?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          provider_subscription_id: string;
          provider_product_id: string;
          provider_variant_id: string | null;
          status: "active" | "paused" | "cancelled" | "expired" | "past_due" | "unpaid" | "pending" | "on_hold" | "failed";
          renews_at: string | null;
          ends_at: string | null;
          created_at: string;
          updated_at: string;
          provider: string;
          customer_id: string | null;
          cancel_at_period_end: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider_subscription_id: string;
          provider_product_id: string;
          provider_variant_id?: string | null;
          status: "active" | "paused" | "cancelled" | "expired" | "past_due" | "unpaid" | "pending" | "on_hold" | "failed";
          renews_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
          provider?: string;
          customer_id?: string | null;
          cancel_at_period_end?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider_subscription_id?: string;
          provider_product_id?: string;
          provider_variant_id?: string | null;
          status?: "active" | "paused" | "cancelled" | "expired" | "past_due" | "unpaid" | "pending" | "on_hold" | "failed";
          renews_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
          provider?: string;
          customer_id?: string | null;
          cancel_at_period_end?: boolean;
        };
        Relationships: [];
      };
      webhook_events: {
        Row: {
          id: string;
          event_name: string;
          processed_at: string;
        };
        Insert: {
          id: string;
          event_name: string;
          processed_at?: string;
        };
        Update: {
          id?: string;
          event_name?: string;
          processed_at?: string;
        };
        Relationships: [];
      };
      login_handoffs: {
        Row: {
          id: string;
          secret_hash: string;
          status: "pending" | "approved" | "claimed";
          device: string | null;
          location: string | null;
          hashed_token: string | null;
          user_id: string | null;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          secret_hash: string;
          status?: "pending" | "approved" | "claimed";
          device?: string | null;
          location?: string | null;
          hashed_token?: string | null;
          user_id?: string | null;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          secret_hash?: string;
          status?: "pending" | "approved" | "claimed";
          device?: string | null;
          location?: string | null;
          hashed_token?: string | null;
          user_id?: string | null;
          created_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
