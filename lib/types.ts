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
      cafe_settings: {
        Row: {
          id: string;
          cafe_name: string;
          tagline: string | null;
          about: string | null;
          logo_url: string | null;
          gcash_qr_url: string | null;
          maya_qr_url: string | null;
          bank_name: string | null;
          bank_account_name: string | null;
          bank_account_number: string | null;
          ewallet_name: string | null;
          ewallet_number: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cafe_name: string;
          tagline?: string | null;
          about?: string | null;
          logo_url?: string | null;
          gcash_qr_url?: string | null;
          maya_qr_url?: string | null;
          bank_name?: string | null;
          bank_account_name?: string | null;
          bank_account_number?: string | null;
          ewallet_name?: string | null;
          ewallet_number?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cafe_settings"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: Database["public"]["Enums"]["user_role"];
          display_name?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          event_date: string;
          start_time: string;
          end_time: string;
          banner_url: string | null;
          max_slots: number;
          ticket_price: number;
          is_cafe_hosted: boolean;
          category: Database["public"]["Enums"]["event_category"];
          custom_category: string | null;
          is_published: boolean;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          venue_request_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          event_date: string;
          start_time: string;
          end_time: string;
          banner_url?: string | null;
          max_slots: number;
          ticket_price?: number;
          is_cafe_hosted?: boolean;
          category?: Database["public"]["Enums"]["event_category"];
          custom_category?: string | null;
          is_published?: boolean;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          venue_request_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "events_venue_request_id_fkey";
            columns: ["venue_request_id"];
            isOneToOne: true;
            referencedRelation: "venue_requests";
            referencedColumns: ["id"];
          },
        ];
      };
      consumable_options: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          category: Database["public"]["Enums"]["consumable_category"];
          extra_price: number;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          category?: Database["public"]["Enums"]["consumable_category"];
          extra_price?: number;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["consumable_options"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "consumable_options_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      freebie_kits: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          description: string | null;
          price: number;
          items: Json;
          is_default: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          description?: string | null;
          price?: number;
          items?: Json;
          is_default?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["freebie_kits"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "freebie_kits_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      registrations: {
        Row: {
          id: string;
          event_id: string;
          kit_id: string | null;
          attendee_name: string;
          email: string;
          phone: string | null;
          total_amount: number;
          payment_proof_url: string | null;
          status: Database["public"]["Enums"]["registration_status"];
          reference_code: string;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          kit_id?: string | null;
          attendee_name: string;
          email: string;
          phone?: string | null;
          total_amount: number;
          payment_proof_url?: string | null;
          status?: Database["public"]["Enums"]["registration_status"];
          reference_code: string;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["registrations"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "registrations_kit_id_fkey";
            columns: ["kit_id"];
            isOneToOne: false;
            referencedRelation: "freebie_kits";
            referencedColumns: ["id"];
          },
        ];
      };
      registration_consumables: {
        Row: {
          registration_id: string;
          consumable_option_id: string;
        };
        Insert: {
          registration_id: string;
          consumable_option_id: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["registration_consumables"]["Insert"]
        >;
        Relationships: [];
      };
      venue_requests: {
        Row: {
          id: string;
          organizer_name: string;
          contact_email: string;
          contact_phone: string | null;
          proposed_date: string;
          expected_attendance: number | null;
          event_description: string;
          status: Database["public"]["Enums"]["venue_request_status"];
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_name: string;
          contact_email: string;
          contact_phone?: string | null;
          proposed_date: string;
          expected_attendance?: number | null;
          event_description: string;
          status?: Database["public"]["Enums"]["venue_request_status"];
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["venue_requests"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      event_listings: {
        Row: Database["public"]["Tables"]["events"]["Row"] & {
          remaining_slots: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      remaining_slots: {
        Args: { p_event_id: string };
        Returns: number;
      };
      generate_reference_code: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      create_registration: {
        Args: {
          p_event_id: string;
          p_kit_id: string | null;
          p_attendee_name: string;
          p_email: string;
          p_phone: string | null;
          p_consumable_ids: string[];
          p_payment_proof_path: string | null;
          p_total_amount: number;
        };
        Returns: Json;
      };
      lookup_registrations: {
        Args: { p_query: string };
        Returns: Database["public"]["CompositeTypes"]["lookup_result"][];
      };
      reset_operational_data: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      user_role: "admin";
      event_category: "cse" | "acoustic" | "workshop" | "other";
      consumable_category: "drink" | "food";
      registration_status: "PENDING" | "APPROVED" | "REJECTED";
      venue_request_status: "PENDING" | "APPROVED" | "DECLINED" | "CANCELLED";
    };
    CompositeTypes: {
      lookup_result: {
        id: string;
        reference_code: string;
        attendee_name: string;
        email: string;
        status: Database["public"]["Enums"]["registration_status"];
        total_amount: number;
        created_at: string;
        event_title: string;
        event_date: string;
        kit_name: string | null;
      };
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type EventCategory = Database["public"]["Enums"]["event_category"];
export type ConsumableCategory =
  Database["public"]["Enums"]["consumable_category"];
export type RegistrationStatus =
  Database["public"]["Enums"]["registration_status"];
export type VenueRequestStatus =
  Database["public"]["Enums"]["venue_request_status"];

export type CafeSettings = Tables<"cafe_settings">;
export type Event = Tables<"events">;
export type ConsumableOption = Tables<"consumable_options">;
export type FreebieKit = Tables<"freebie_kits">;
export type Registration = Tables<"registrations">;
export type VenueRequest = Tables<"venue_requests">;

export type EventListing = Database["public"]["Views"]["event_listings"]["Row"];

export type LookupResult =
  Database["public"]["CompositeTypes"]["lookup_result"];

export type EventDetail = EventListing & {
  consumable_options: ConsumableOption[];
  freebie_kits: FreebieKit[];
};
