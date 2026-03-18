export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean
          last_used_at: string | null
          name: string
          permissions: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name: string
          permissions?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name?: string
          permissions?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          image_url: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      category_images: {
        Row: {
          category: string
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_ai_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          response: string
          store_owner_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          response: string
          store_owner_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          response?: string
          store_owner_id?: string
        }
        Relationships: []
      }
      detective_players: {
        Row: {
          device_id: string
          has_voted: boolean | null
          id: string
          joined_at: string | null
          player_index: number | null
          player_name: string
          room_id: string
          vote_target: string | null
        }
        Insert: {
          device_id: string
          has_voted?: boolean | null
          id?: string
          joined_at?: string | null
          player_index?: number | null
          player_name: string
          room_id: string
          vote_target?: string | null
        }
        Update: {
          device_id?: string
          has_voted?: boolean | null
          id?: string
          joined_at?: string | null
          player_index?: number | null
          player_name?: string
          room_id?: string
          vote_target?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "detective_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "detective_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      detective_rooms: {
        Row: {
          created_at: string | null
          difficulty: string | null
          expires_at: string | null
          game_data: Json | null
          host_device_id: string
          id: string
          phase: string | null
          room_code: string
          store_owner_id: string | null
          theme: string | null
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          expires_at?: string | null
          game_data?: Json | null
          host_device_id: string
          id?: string
          phase?: string | null
          room_code: string
          store_owner_id?: string | null
          theme?: string | null
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          expires_at?: string | null
          game_data?: Json | null
          host_device_id?: string
          id?: string
          phase?: string | null
          room_code?: string
          store_owner_id?: string | null
          theme?: string | null
        }
        Relationships: []
      }
      employee_daily_sales: {
        Row: {
          created_at: string
          employee_id: string
          employee_name: string
          id: string
          sale_date: string
          store_owner_id: string
          total_orders: number
          total_sales: number
        }
        Insert: {
          created_at?: string
          employee_id: string
          employee_name: string
          id?: string
          sale_date: string
          store_owner_id: string
          total_orders?: number
          total_sales?: number
        }
        Update: {
          created_at?: string
          employee_id?: string
          employee_name?: string
          id?: string
          sale_date?: string
          store_owner_id?: string
          total_orders?: number
          total_sales?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_daily_sales_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          can_add_products: boolean | null
          can_delete_products: boolean | null
          can_edit_products: boolean | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          store_owner_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          can_add_products?: boolean | null
          can_delete_products?: boolean | null
          can_edit_products?: boolean | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          store_owner_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          can_add_products?: boolean | null
          can_delete_products?: boolean | null
          can_edit_products?: boolean | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          store_owner_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          description: string
          id: string
          resolved_at: string | null
          status: string | null
          store_owner_id: string
          type: string
          visitor_name: string
          visitor_phone: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          resolved_at?: string | null
          status?: string | null
          store_owner_id: string
          type: string
          visitor_name: string
          visitor_phone?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          resolved_at?: string | null
          status?: string | null
          store_owner_id?: string
          type?: string
          visitor_name?: string
          visitor_phone?: string | null
        }
        Relationships: []
      }
      game_scores: {
        Row: {
          created_at: string
          details: Json | null
          game_type: string
          id: string
          phone_number: string | null
          player_name: string
          score: number
          store_owner_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          game_type: string
          id?: string
          phone_number?: string | null
          player_name: string
          score?: number
          store_owner_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          game_type?: string
          id?: string
          phone_number?: string | null
          player_name?: string
          score?: number
          store_owner_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          completed_at: string | null
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_amount: number | null
          employee_id: string | null
          final_amount: number | null
          id: string
          notes: string | null
          store_owner_id: string
          table_id: string | null
          table_number: string | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          employee_id?: string | null
          final_amount?: number | null
          id?: string
          notes?: string | null
          store_owner_id: string
          table_id?: string | null
          table_number?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          employee_id?: string | null
          final_amount?: number | null
          id?: string
          notes?: string | null
          store_owner_id?: string
          table_id?: string | null
          table_number?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          last_viewed_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_viewed_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_viewed_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: []
      }
      password_reset_otps: {
        Row: {
          attempts: number
          created_at: string
          email: string
          expires_at: string
          id: string
          is_used: boolean
          otp_code: string
          user_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          is_used?: boolean
          otp_code: string
          user_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          otp_code?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          category_id: string | null
          created_at: string
          description: string | null
          discount_percentage: number | null
          display_order: number | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_new: boolean | null
          is_popular: boolean | null
          name: string
          original_price: number | null
          price: number
          user_id: string
        }
        Insert: {
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_new?: boolean | null
          is_popular?: boolean | null
          name: string
          original_price?: number | null
          price: number
          user_id: string
        }
        Update: {
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_new?: boolean | null
          is_popular?: boolean | null
          name?: string
          original_price?: number | null
          price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          callmebot_api_key: string | null
          created_at: string
          full_name: string | null
          id: string
          phone_number: string | null
          whatsapp_bot_enabled: boolean | null
          whatsapp_verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          callmebot_api_key?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone_number?: string | null
          whatsapp_bot_enabled?: boolean | null
          whatsapp_verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          callmebot_api_key?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          whatsapp_bot_enabled?: boolean | null
          whatsapp_verified?: boolean | null
        }
        Relationships: []
      }
      shared_images: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          name: string
          updated_at: string
          uploaded_by: string | null
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          name: string
          updated_at?: string
          uploaded_by?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          name?: string
          updated_at?: string
          uploaded_by?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      storage_cleanup_logs: {
        Row: {
          bucket_name: string
          created_at: string
          errors: Json | null
          files_deleted: number
          id: string
          space_freed: number
        }
        Insert: {
          bucket_name: string
          created_at?: string
          errors?: Json | null
          files_deleted?: number
          id?: string
          space_freed?: number
        }
        Update: {
          bucket_name?: string
          created_at?: string
          errors?: Json | null
          files_deleted?: number
          id?: string
          space_freed?: number
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          ads_enabled: boolean | null
          ads_type: string | null
          ai_assistant_name: string | null
          banner_url: string | null
          color_theme: string | null
          contact_info: Json | null
          created_at: string
          custom_ads: Json | null
          custom_domain: string | null
          dark_mode: boolean | null
          delivery_fee: number | null
          employee_system_enabled: boolean | null
          external_orders_enabled: boolean | null
          font_settings: Json | null
          is_suspended: boolean | null
          loading_tips: Json | null
          logo_url: string | null
          n8n_webhook_url: string | null
          slug: string | null
          social_links: Json | null
          store_name: string | null
          template: string | null
          theme_mode: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ads_enabled?: boolean | null
          ads_type?: string | null
          ai_assistant_name?: string | null
          banner_url?: string | null
          color_theme?: string | null
          contact_info?: Json | null
          created_at?: string
          custom_ads?: Json | null
          custom_domain?: string | null
          dark_mode?: boolean | null
          delivery_fee?: number | null
          employee_system_enabled?: boolean | null
          external_orders_enabled?: boolean | null
          font_settings?: Json | null
          is_suspended?: boolean | null
          loading_tips?: Json | null
          logo_url?: string | null
          n8n_webhook_url?: string | null
          slug?: string | null
          social_links?: Json | null
          store_name?: string | null
          template?: string | null
          theme_mode?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ads_enabled?: boolean | null
          ads_type?: string | null
          ai_assistant_name?: string | null
          banner_url?: string | null
          color_theme?: string | null
          contact_info?: Json | null
          created_at?: string
          custom_ads?: Json | null
          custom_domain?: string | null
          dark_mode?: boolean | null
          delivery_fee?: number | null
          employee_system_enabled?: boolean | null
          external_orders_enabled?: boolean | null
          font_settings?: Json | null
          is_suspended?: boolean | null
          loading_tips?: Json | null
          logo_url?: string | null
          n8n_webhook_url?: string | null
          slug?: string | null
          social_links?: Json | null
          store_name?: string | null
          template?: string | null
          theme_mode?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_stats: {
        Row: {
          id: string
          last_updated: string | null
          total_active_stores: number | null
          total_page_views: number | null
          total_users: number | null
        }
        Insert: {
          id?: string
          last_updated?: string | null
          total_active_stores?: number | null
          total_page_views?: number | null
          total_users?: number | null
        }
        Update: {
          id?: string
          last_updated?: string | null
          total_active_stores?: number | null
          total_page_views?: number | null
          total_users?: number | null
        }
        Relationships: []
      }
      tables: {
        Row: {
          capacity: number | null
          created_at: string | null
          current_order_id: string | null
          id: string
          is_occupied: boolean | null
          store_owner_id: string
          table_number: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          current_order_id?: string | null
          id?: string
          is_occupied?: boolean | null
          store_owner_id: string
          table_number: string
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          current_order_id?: string | null
          id?: string
          is_occupied?: boolean | null
          store_owner_id?: string
          table_number?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          action_category: string
          action_type: string
          created_at: string | null
          details: Json | null
          id: string
          user_id: string
        }
        Insert: {
          action_category: string
          action_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id: string
        }
        Update: {
          action_category?: string
          action_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitor_analytics: {
        Row: {
          action_data: Json | null
          action_type: string
          created_at: string | null
          id: string
          session_id: string
          store_owner_id: string
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          created_at?: string | null
          id?: string
          session_id: string
          store_owner_id: string
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          created_at?: string | null
          id?: string
          session_id?: string
          store_owner_id?: string
        }
        Relationships: []
      }
      whatsapp_sessions: {
        Row: {
          auth_attempts: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_authenticated: boolean | null
          last_activity_at: string | null
          phone_number: string
          session_token: string | null
          user_id: string
        }
        Insert: {
          auth_attempts?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_authenticated?: boolean | null
          last_activity_at?: string | null
          phone_number: string
          session_token?: string | null
          user_id: string
        }
        Update: {
          auth_attempts?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_authenticated?: boolean | null
          last_activity_at?: string | null
          phone_number?: string
          session_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_employee_daily_sales: {
        Args: { target_date?: string }
        Returns: {
          employee_id: string
          employee_name: string
          store_owner_id: string
          total_orders: number
          total_sales: number
        }[]
      }
      cleanup_expired_otps: { Args: never; Returns: undefined }
      cleanup_expired_whatsapp_sessions: { Args: never; Returns: number }
      cleanup_old_employee_sales: { Args: never; Returns: number }
      cleanup_old_resolved_feedback: { Args: never; Returns: number }
      create_notifications_table_if_not_exists: { Args: never; Returns: string }
      delete_resolved_feedback: { Args: { owner_id: string }; Returns: number }
      get_employee_store_owner: { Args: { user_uuid: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_image_usage: { Args: { image_id: string }; Returns: undefined }
      increment_page_view: {
        Args: { store_user_id: string }
        Returns: undefined
      }
      is_active_employee: {
        Args: { owner_uuid: string; user_uuid: string }
        Returns: boolean
      }
      update_system_stats: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user" | "employee"
      order_status:
        | "pending"
        | "preparing"
        | "ready"
        | "completed"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "employee"],
      order_status: ["pending", "preparing", "ready", "completed", "cancelled"],
    },
  },
} as const
