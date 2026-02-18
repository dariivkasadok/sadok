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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          color: string
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      child_group_history: {
        Row: {
          child_id: string
          created_at: string
          group_id: string
          id: string
          is_current: boolean | null
        }
        Insert: {
          child_id: string
          created_at?: string
          group_id: string
          id?: string
          is_current?: boolean | null
        }
        Update: {
          child_id?: string
          created_at?: string
          group_id?: string
          id?: string
          is_current?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "child_group_history_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children_with_group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_group_history_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "childrens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_group_history_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      childrens: {
        Row: {
          apartment: string | null
          ato: boolean | null
          birth_certificate: string | null
          birth_date: string | null
          child_notes: string | null
          chornobyl: boolean | null
          created_at: string
          deprived_parental_care: boolean | null
          enrolled: string | null
          first_name: string
          gender: string
          guardian: string | null
          house: string | null
          household_book_number: string | null
          id: string
          idp: boolean | null
          inclusion: boolean | null
          last_name: string
          location_status: string | null
          low_income: boolean | null
          many_children_family: boolean | null
          middle_name: string | null
          missing_parents: boolean | null
          orphan: boolean | null
          parents_full_name: string | null
          parents_military: boolean | null
          parents_note: string | null
          parents_ubd: boolean | null
          phone: string | null
          settlement: string | null
          street: string | null
          updated_at: string
          war_child: boolean | null
          withdrawn: string | null
          workplace: string | null
        }
        Insert: {
          apartment?: string | null
          ato?: boolean | null
          birth_certificate?: string | null
          birth_date?: string | null
          child_notes?: string | null
          chornobyl?: boolean | null
          created_at?: string
          deprived_parental_care?: boolean | null
          enrolled?: string | null
          first_name: string
          gender?: string
          guardian?: string | null
          house?: string | null
          household_book_number?: string | null
          id?: string
          idp?: boolean | null
          inclusion?: boolean | null
          last_name: string
          location_status?: string | null
          low_income?: boolean | null
          many_children_family?: boolean | null
          middle_name?: string | null
          missing_parents?: boolean | null
          orphan?: boolean | null
          parents_full_name?: string | null
          parents_military?: boolean | null
          parents_note?: string | null
          parents_ubd?: boolean | null
          phone?: string | null
          settlement?: string | null
          street?: string | null
          updated_at?: string
          war_child?: boolean | null
          withdrawn?: string | null
          workplace?: string | null
        }
        Update: {
          apartment?: string | null
          ato?: boolean | null
          birth_certificate?: string | null
          birth_date?: string | null
          child_notes?: string | null
          chornobyl?: boolean | null
          created_at?: string
          deprived_parental_care?: boolean | null
          enrolled?: string | null
          first_name?: string
          gender?: string
          guardian?: string | null
          house?: string | null
          household_book_number?: string | null
          id?: string
          idp?: boolean | null
          inclusion?: boolean | null
          last_name?: string
          location_status?: string | null
          low_income?: boolean | null
          many_children_family?: boolean | null
          middle_name?: string | null
          missing_parents?: boolean | null
          orphan?: boolean | null
          parents_full_name?: string | null
          parents_military?: boolean | null
          parents_note?: string | null
          parents_ubd?: boolean | null
          phone?: string | null
          settlement?: string | null
          street?: string | null
          updated_at?: string
          war_child?: boolean | null
          withdrawn?: string | null
          workplace?: string | null
        }
        Relationships: []
      }
      groups: {
        Row: {
          created_at: string
          id: string
          name: string
          study_end_date: string | null
          study_start_date: string | null
          study_year: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          study_end_date?: string | null
          study_start_date?: string | null
          study_year: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          study_end_date?: string | null
          study_start_date?: string | null
          study_year?: string
        }
        Relationships: []
      }
      teacher_group_history: {
        Row: {
          created_at: string
          group_id: string
          id: string
          is_current: boolean | null
          teacher_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          is_current?: boolean | null
          teacher_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          is_current?: boolean | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_group_history_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_group_history_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_group_history_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_with_group"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          category: string | null
          created_at: string
          education: string | null
          email: string | null
          experience: number | null
          full_name: string
          id: string
          pedagogical_title: string | null
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          education?: string | null
          email?: string | null
          experience?: number | null
          full_name: string
          id?: string
          pedagogical_title?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          education?: string | null
          email?: string | null
          experience?: number | null
          full_name?: string
          id?: string
          pedagogical_title?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      children_with_group: {
        Row: {
          apartment: string | null
          ato: boolean | null
          birth_certificate: string | null
          birth_date: string | null
          child_notes: string | null
          chornobyl: boolean | null
          created_at: string | null
          current_group_name: string | null
          current_study_year: string | null
          deprived_parental_care: boolean | null
          enrolled: string | null
          first_name: string | null
          gender: string | null
          guardian: string | null
          house: string | null
          household_book_number: string | null
          id: string | null
          idp: boolean | null
          inclusion: boolean | null
          last_name: string | null
          location_status: string | null
          low_income: boolean | null
          many_children_family: boolean | null
          middle_name: string | null
          missing_parents: boolean | null
          orphan: boolean | null
          parents_full_name: string | null
          parents_military: boolean | null
          parents_note: string | null
          parents_ubd: boolean | null
          phone: string | null
          settlement: string | null
          status: string | null
          street: string | null
          updated_at: string | null
          war_child: boolean | null
          withdrawn: string | null
          workplace: string | null
        }
        Relationships: []
      }
      teachers_with_group: {
        Row: {
          category: string | null
          created_at: string | null
          current_group_name: string | null
          current_study_year: string | null
          education: string | null
          email: string | null
          experience: number | null
          full_name: string | null
          id: string | null
          pedagogical_title: string | null
          phone: string | null
          position: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
