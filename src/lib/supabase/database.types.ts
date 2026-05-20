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
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          is_premium: boolean;
          role: "user" | "admin";
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          is_premium?: boolean;
          role?: "user" | "admin";
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          is_premium?: boolean;
          role?: "user" | "admin";
          updated_at?: string;
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
          ls_order_id: string;
          ls_product_id: string;
          ls_variant_id: string;
          product_type: "component" | "template" | "lifetime";
          product_slug: string | null;
          status: "paid" | "refunded";
          amount_cents: number;
          currency: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ls_order_id: string;
          ls_product_id: string;
          ls_variant_id: string;
          product_type: "component" | "template" | "lifetime";
          product_slug?: string | null;
          status?: "paid" | "refunded";
          amount_cents: number;
          currency?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ls_order_id?: string;
          ls_product_id?: string;
          ls_variant_id?: string;
          product_type?: "component" | "template" | "lifetime";
          product_slug?: string | null;
          status?: "paid" | "refunded";
          amount_cents?: number;
          currency?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          ls_subscription_id: string;
          ls_product_id: string;
          ls_variant_id: string;
          status: "active" | "paused" | "cancelled" | "expired" | "past_due" | "unpaid";
          renews_at: string | null;
          ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ls_subscription_id: string;
          ls_product_id: string;
          ls_variant_id: string;
          status: "active" | "paused" | "cancelled" | "expired" | "past_due" | "unpaid";
          renews_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ls_subscription_id?: string;
          ls_product_id?: string;
          ls_variant_id?: string;
          status?: "active" | "paused" | "cancelled" | "expired" | "past_due" | "unpaid";
          renews_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
