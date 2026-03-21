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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          farm_id: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          farm_id: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          farm_id?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      crops: {
        Row: {
          blackout_days: number | null
          clamshell_size_oz: number | null
          created_at: string
          expected_yield_oz_per_tray: number | null
          farm_id: string
          grow_days: number | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          seed_cost_per_tray: number | null
          seed_weight_per_tray_grams: number | null
          selling_price_per_clamshell: number | null
          selling_price_per_oz: number | null
          shelf_life_days: number | null
          soak_hours: number | null
          updated_at: string
          variety: string | null
        }
        Insert: {
          blackout_days?: number | null
          clamshell_size_oz?: number | null
          created_at?: string
          expected_yield_oz_per_tray?: number | null
          farm_id: string
          grow_days?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          seed_cost_per_tray?: number | null
          seed_weight_per_tray_grams?: number | null
          selling_price_per_clamshell?: number | null
          selling_price_per_oz?: number | null
          shelf_life_days?: number | null
          soak_hours?: number | null
          updated_at?: string
          variety?: string | null
        }
        Update: {
          blackout_days?: number | null
          clamshell_size_oz?: number | null
          created_at?: string
          expected_yield_oz_per_tray?: number | null
          farm_id?: string
          grow_days?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          seed_cost_per_tray?: number | null
          seed_weight_per_tray_grams?: number | null
          selling_price_per_clamshell?: number | null
          selling_price_per_oz?: number | null
          shelf_life_days?: number | null
          soak_hours?: number | null
          updated_at?: string
          variety?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crops_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          delivery_notes: string | null
          email: string | null
          farm_id: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          type: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          delivery_notes?: string | null
          email?: string | null
          farm_id: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          type?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          delivery_notes?: string | null
          email?: string | null
          farm_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_members: {
        Row: {
          accepted_at: string | null
          farm_id: string
          id: string
          invited_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          farm_id: string
          id?: string
          invited_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          farm_id?: string
          id?: string
          invited_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_members_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_settings: {
        Row: {
          clamshell_cost: number | null
          electricity_cost_per_kwh: number | null
          electricity_hours_per_day: number | null
          farm_id: string
          fertilizer_cost_per_tray: number | null
          id: string
          insurance_per_month: number | null
          labor_minutes_per_tray: number | null
          labor_rate_per_hour: number | null
          light_cost_per_day: number | null
          misc_overhead_per_month: number | null
          packaging_cost_per_unit: number | null
          racks_available: number | null
          rent_per_month: number | null
          seed_cost_default: number | null
          soil_cost_per_tray: number | null
          target_monthly_revenue: number | null
          tray_cost: number | null
          trays_per_rack: number | null
          updated_at: string
          water_cost_per_tray: number | null
        }
        Insert: {
          clamshell_cost?: number | null
          electricity_cost_per_kwh?: number | null
          electricity_hours_per_day?: number | null
          farm_id: string
          fertilizer_cost_per_tray?: number | null
          id?: string
          insurance_per_month?: number | null
          labor_minutes_per_tray?: number | null
          labor_rate_per_hour?: number | null
          light_cost_per_day?: number | null
          misc_overhead_per_month?: number | null
          packaging_cost_per_unit?: number | null
          racks_available?: number | null
          rent_per_month?: number | null
          seed_cost_default?: number | null
          soil_cost_per_tray?: number | null
          target_monthly_revenue?: number | null
          tray_cost?: number | null
          trays_per_rack?: number | null
          updated_at?: string
          water_cost_per_tray?: number | null
        }
        Update: {
          clamshell_cost?: number | null
          electricity_cost_per_kwh?: number | null
          electricity_hours_per_day?: number | null
          farm_id?: string
          fertilizer_cost_per_tray?: number | null
          id?: string
          insurance_per_month?: number | null
          labor_minutes_per_tray?: number | null
          labor_rate_per_hour?: number | null
          light_cost_per_day?: number | null
          misc_overhead_per_month?: number | null
          packaging_cost_per_unit?: number | null
          racks_available?: number | null
          rent_per_month?: number | null
          seed_cost_default?: number | null
          soil_cost_per_tray?: number | null
          target_monthly_revenue?: number | null
          tray_cost?: number | null
          trays_per_rack?: number | null
          updated_at?: string
          water_cost_per_tray?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "farm_settings_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: true
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          created_at: string
          currency: string | null
          id: string
          location: string | null
          name: string
          owner_id: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          id?: string
          location?: string | null
          name: string
          owner_id: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          id?: string
          location?: string | null
          name?: string
          owner_id?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          crop_id: string | null
          expires_date: string | null
          farm_id: string
          harvested_date: string | null
          id: string
          mix_id: string | null
          quantity_oz: number | null
          quantity_trays: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          crop_id?: string | null
          expires_date?: string | null
          farm_id: string
          harvested_date?: string | null
          id?: string
          mix_id?: string | null
          quantity_oz?: number | null
          quantity_trays?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          crop_id?: string | null
          expires_date?: string | null
          farm_id?: string
          harvested_date?: string | null
          id?: string
          mix_id?: string | null
          quantity_oz?: number | null
          quantity_trays?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_mix_id_fkey"
            columns: ["mix_id"]
            isOneToOne: false
            referencedRelation: "mixes"
            referencedColumns: ["id"]
          },
        ]
      }
      mix_ingredients: {
        Row: {
          crop_id: string
          id: string
          mix_id: string
          percentage: number
          sort_order: number | null
        }
        Insert: {
          crop_id: string
          id?: string
          mix_id: string
          percentage: number
          sort_order?: number | null
        }
        Update: {
          crop_id?: string
          id?: string
          mix_id?: string
          percentage?: number
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mix_ingredients_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mix_ingredients_mix_id_fkey"
            columns: ["mix_id"]
            isOneToOne: false
            referencedRelation: "mixes"
            referencedColumns: ["id"]
          },
        ]
      }
      mixes: {
        Row: {
          clamshell_size_oz: number | null
          created_at: string
          description: string | null
          farm_id: string
          id: string
          is_active: boolean | null
          name: string
          selling_price_per_clamshell: number | null
          selling_price_per_oz: number | null
          updated_at: string
        }
        Insert: {
          clamshell_size_oz?: number | null
          created_at?: string
          description?: string | null
          farm_id: string
          id?: string
          is_active?: boolean | null
          name: string
          selling_price_per_clamshell?: number | null
          selling_price_per_oz?: number | null
          updated_at?: string
        }
        Update: {
          clamshell_size_oz?: number | null
          created_at?: string
          description?: string | null
          farm_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          selling_price_per_clamshell?: number | null
          selling_price_per_oz?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mixes_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          crop_id: string | null
          id: string
          line_total: number | null
          mix_id: string | null
          order_id: string
          quantity_clamshells: number | null
          quantity_oz: number | null
          unit_price: number | null
        }
        Insert: {
          crop_id?: string | null
          id?: string
          line_total?: number | null
          mix_id?: string | null
          order_id: string
          quantity_clamshells?: number | null
          quantity_oz?: number | null
          unit_price?: number | null
        }
        Update: {
          crop_id?: string | null
          id?: string
          line_total?: number | null
          mix_id?: string | null
          order_id?: string
          quantity_clamshells?: number | null
          quantity_oz?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_mix_id_fkey"
            columns: ["mix_id"]
            isOneToOne: false
            referencedRelation: "mixes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string | null
          delivery_date: string | null
          discount: number | null
          farm_id: string
          id: string
          notes: string | null
          order_date: string | null
          order_number: string | null
          status: string | null
          subtotal: number | null
          tax: number | null
          total: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          delivery_date?: string | null
          discount?: number | null
          farm_id: string
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number?: string | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          delivery_date?: string | null
          discount?: number | null
          farm_id?: string
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number?: string | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      production_plan_items: {
        Row: {
          actual_harvest_date: string | null
          actual_yield_oz: number | null
          crop_id: string | null
          expected_harvest_date: string | null
          id: string
          mix_id: string | null
          notes: string | null
          plan_id: string
          plant_date: string | null
          status: string | null
          trays_planned: number | null
        }
        Insert: {
          actual_harvest_date?: string | null
          actual_yield_oz?: number | null
          crop_id?: string | null
          expected_harvest_date?: string | null
          id?: string
          mix_id?: string | null
          notes?: string | null
          plan_id: string
          plant_date?: string | null
          status?: string | null
          trays_planned?: number | null
        }
        Update: {
          actual_harvest_date?: string | null
          actual_yield_oz?: number | null
          crop_id?: string | null
          expected_harvest_date?: string | null
          id?: string
          mix_id?: string | null
          notes?: string | null
          plan_id?: string
          plant_date?: string | null
          status?: string | null
          trays_planned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "production_plan_items_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_plan_items_mix_id_fkey"
            columns: ["mix_id"]
            isOneToOne: false
            referencedRelation: "mixes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_plan_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "production_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      production_plans: {
        Row: {
          created_at: string
          end_date: string | null
          farm_id: string
          id: string
          name: string
          notes: string | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          farm_id: string
          id?: string
          name: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          farm_id?: string
          id?: string
          name?: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_plans_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supplies: {
        Row: {
          category: string | null
          cost_per_unit: number | null
          farm_id: string
          id: string
          name: string
          quantity_on_hand: number | null
          reorder_point: number | null
          supplier: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          cost_per_unit?: number | null
          farm_id: string
          id?: string
          name: string
          quantity_on_hand?: number | null
          reorder_point?: number | null
          supplier?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          cost_per_unit?: number | null
          farm_id?: string
          id?: string
          name?: string
          quantity_on_hand?: number | null
          reorder_point?: number | null
          supplier?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplies_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          category: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          farm_id: string
          id: string
          priority: string | null
          status: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          farm_id: string
          id?: string
          priority?: string | null
          status?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          farm_id?: string
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "owner" | "manager" | "grower" | "viewer"
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
      app_role: ["admin", "owner", "manager", "grower", "viewer"],
    },
  },
} as const
