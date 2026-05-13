export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      pins: {
        Row: {
          id: string;
          user_id: string;
          pin_type: string;
          display_name: string;
          description: string | null;
          place_id: string;
          place_resource_name: string;
          formatted_address: string | null;
          short_formatted_address: string | null;
          city: string;
          region: string | null;
          country: string;
          country_code: string | null;
          lat: number;
          lng: number;
          google_types: string[];
          status: string;
          is_active: boolean;
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          place_refreshed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pin_type: string;
          display_name: string;
          description?: string | null;
          place_id: string;
          place_resource_name: string;
          formatted_address?: string | null;
          short_formatted_address?: string | null;
          city: string;
          region?: string | null;
          country: string;
          country_code?: string | null;
          lat: number;
          lng: number;
          google_types?: string[];
          status?: string;
          is_active?: boolean;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          place_refreshed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pin_type?: string;
          display_name?: string;
          description?: string | null;
          place_id?: string;
          place_resource_name?: string;
          formatted_address?: string | null;
          short_formatted_address?: string | null;
          city?: string;
          region?: string | null;
          country?: string;
          country_code?: string | null;
          lat?: number;
          lng?: number;
          google_types?: string[];
          status?: string;
          is_active?: boolean;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          place_refreshed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      pin_moderation_events: {
        Row: {
          id: string;
          pin_id: string;
          actor_user_id: string | null;
          event_type: string;
          reason: string | null;
          meta: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          pin_id: string;
          actor_user_id?: string | null;
          event_type: string;
          reason?: string | null;
          meta?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          pin_id?: string;
          actor_user_id?: string | null;
          event_type?: string;
          reason?: string | null;
          meta?: Json;
          created_at?: string;
        };
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
  };
};

export type PinsRow = Database['public']['Tables']['pins']['Row'];
export type PinsInsert = Database['public']['Tables']['pins']['Insert'];
export type PinModerationEventsRow = Database['public']['Tables']['pin_moderation_events']['Row'];
