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
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
