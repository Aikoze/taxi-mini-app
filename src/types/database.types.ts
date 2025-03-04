export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      acceptations: {
        Row: {
          accepted_at: string | null
          demande_id: number
          id: number
          latitude: number | null
          longitude: number | null
          user_id: number
        }
        Insert: {
          accepted_at?: string | null
          demande_id: number
          id?: number
          latitude?: number | null
          longitude?: number | null
          user_id: number
        }
        Update: {
          accepted_at?: string | null
          demande_id?: number
          id?: number
          latitude?: number | null
          longitude?: number | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "acceptations_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "demandes"
            referencedColumns: ["message_id"]
          },
        ]
      }
      config: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      demandes: {
        Row: {
          assigned: boolean | null
          chat_id: string
          created_at: string | null
          demande: Json
          id: number
          message_id: number | null
          parent_id: number | null
        }
        Insert: {
          assigned?: boolean | null
          chat_id: string
          created_at?: string | null
          demande: Json
          id?: number
          message_id?: number | null
          parent_id?: number | null
        }
        Update: {
          assigned?: boolean | null
          chat_id?: string
          created_at?: string | null
          demande?: Json
          id?: number
          message_id?: number | null
          parent_id?: number | null
        }
        Relationships: []
      }
      ride_interests: {
        Row: {
          created_at: string | null
          driver_id: string
          id: number
          latitude: number
          longitude: number
          ride_id: number
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          id?: number
          latitude: number
          longitude: number
          ride_id: number
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          id?: number
          latitude?: number
          longitude?: number
          ride_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ride_interests_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "ride_interests_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_messages: {
        Row: {
          created_at: string | null
          group_id: string
          id: number
          is_parent: boolean | null
          message_id: number
          parent_message_id: number | null
          ride_id: number | null
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: number
          is_parent?: boolean | null
          message_id: number
          parent_message_id?: number | null
          ride_id?: number | null
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: number
          is_parent?: boolean | null
          message_id?: number
          parent_message_id?: number | null
          ride_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_messages_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          assigned_to: string | null
          client_phone: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string
          current_group_id: string | null
          dropoff_address: string
          dropoff_location_id: number | null
          id: number
          is_immediate: boolean
          payment_method: string
          pickup_address: string
          pickup_datetime: string
          pickup_lat: number | null
          pickup_lng: number | null
          pickup_location_id: number | null
          status: string
        }
        Insert: {
          assigned_to?: string | null
          client_phone?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          current_group_id?: string | null
          dropoff_address: string
          dropoff_location_id?: number | null
          id?: number
          is_immediate: boolean
          payment_method: string
          pickup_address: string
          pickup_datetime: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_location_id?: number | null
          status: string
        }
        Update: {
          assigned_to?: string | null
          client_phone?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          current_group_id?: string | null
          dropoff_address?: string
          dropoff_location_id?: number | null
          id?: number
          is_immediate?: boolean
          payment_method?: string
          pickup_address?: string
          pickup_datetime?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_location_id?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rides_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "rides_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "rides_dropoff_location_id_fkey"
            columns: ["dropoff_location_id"]
            isOneToOne: false
            referencedRelation: "saved_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_pickup_location_id_fkey"
            columns: ["pickup_location_id"]
            isOneToOne: false
            referencedRelation: "saved_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_locations: {
        Row: {
          address: string
          category: string | null
          created_at: string | null
          id: number
          is_active: boolean | null
          latitude: number
          longitude: number
          name: string
          short_name: string
        }
        Insert: {
          address: string
          category?: string | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          latitude: number
          longitude: number
          name: string
          short_name: string
        }
        Update: {
          address?: string
          category?: string | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          short_name?: string
        }
        Relationships: []
      }
      telegram_groups: {
        Row: {
          created_at: string | null
          description: string | null
          group_id: string
          id: number
          is_main: boolean | null
          name: string
          priority: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          group_id: string
          id?: number
          is_main?: boolean | null
          name: string
          priority: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          group_id?: string
          id?: number
          is_main?: boolean | null
          name?: string
          priority?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string
          created_at: string | null
          email: string
          first_name: string | null
          id: number
          last_name: string | null
          phone_number: string
          telegram_id: string
          username: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: number
          last_name?: string | null
          phone_number: string
          telegram_id: string
          username?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: number
          last_name?: string | null
          phone_number?: string
          telegram_id?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      ride_statistics: {
        Row: {
          active_drivers: number | null
          assigned_rides: number | null
          cancelled_rides: number | null
          completed_rides: number | null
          immediate_rides: number | null
          pending_rides: number | null
          planned_rides: number | null
          total_rides: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_distance: {
        Args: {
          lat1: number
          lon1: number
          lat2: number
          lon2: number
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
