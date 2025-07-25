export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      match_insights: {
        Row: {
          compatibility_score: number
          created_at: string
          family_compatibility_score: number | null
          id: string
          insights_data: Json | null
          lifestyle_compatibility_score: number | null
          personality_match_score: number | null
          religious_compatibility_score: number | null
          updated_at: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          compatibility_score: number
          created_at?: string
          family_compatibility_score?: number | null
          id?: string
          insights_data?: Json | null
          lifestyle_compatibility_score?: number | null
          personality_match_score?: number | null
          religious_compatibility_score?: number | null
          updated_at?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          compatibility_score?: number
          created_at?: string
          family_compatibility_score?: number | null
          id?: string
          insights_data?: Json | null
          lifestyle_compatibility_score?: number | null
          personality_match_score?: number | null
          religious_compatibility_score?: number | null
          updated_at?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_trending: boolean | null
          likes_count: number | null
          location: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_trending?: boolean | null
          likes_count?: number | null
          location?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_trending?: boolean | null
          likes_count?: number | null
          location?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      premium_feature_usage: {
        Row: {
          feature_type: string
          id: string
          last_used: string
          reset_date: string
          usage_count: number
          user_id: string
        }
        Insert: {
          feature_type: string
          id?: string
          last_used?: string
          reset_date?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          feature_type?: string
          id?: string
          last_used?: string
          reset_date?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      premium_subscriptions: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          plan_type: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          plan_type: string
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          plan_type?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          career_field: string | null
          community_involvement_level: string | null
          created_at: string
          display_name: string | null
          education_level: string | null
          family_size_preference: string | null
          financial_readiness: string | null
          first_name: string | null
          hajj_umrah_experience: boolean | null
          hijab_status: string | null
          id: string
          income_range: string | null
          is_verified: boolean | null
          islamic_knowledge_level: string | null
          languages_spoken: string[] | null
          last_active: string | null
          last_name: string | null
          location: string | null
          madhab: string | null
          marriage_timeline: string | null
          number_of_children_wanted: number | null
          prayer_frequency: string | null
          previous_marriage: boolean | null
          profile_boost_expires: string | null
          religion_level: string | null
          updated_at: string
          user_id: string
          verification_level: string | null
          wali_contact_info: Json | null
          wants_children: boolean | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          career_field?: string | null
          community_involvement_level?: string | null
          created_at?: string
          display_name?: string | null
          education_level?: string | null
          family_size_preference?: string | null
          financial_readiness?: string | null
          first_name?: string | null
          hajj_umrah_experience?: boolean | null
          hijab_status?: string | null
          id?: string
          income_range?: string | null
          is_verified?: boolean | null
          islamic_knowledge_level?: string | null
          languages_spoken?: string[] | null
          last_active?: string | null
          last_name?: string | null
          location?: string | null
          madhab?: string | null
          marriage_timeline?: string | null
          number_of_children_wanted?: number | null
          prayer_frequency?: string | null
          previous_marriage?: boolean | null
          profile_boost_expires?: string | null
          religion_level?: string | null
          updated_at?: string
          user_id: string
          verification_level?: string | null
          wali_contact_info?: Json | null
          wants_children?: boolean | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          career_field?: string | null
          community_involvement_level?: string | null
          created_at?: string
          display_name?: string | null
          education_level?: string | null
          family_size_preference?: string | null
          financial_readiness?: string | null
          first_name?: string | null
          hajj_umrah_experience?: boolean | null
          hijab_status?: string | null
          id?: string
          income_range?: string | null
          is_verified?: boolean | null
          islamic_knowledge_level?: string | null
          languages_spoken?: string[] | null
          last_active?: string | null
          last_name?: string | null
          location?: string | null
          madhab?: string | null
          marriage_timeline?: string | null
          number_of_children_wanted?: number | null
          prayer_frequency?: string | null
          previous_marriage?: boolean | null
          profile_boost_expires?: string | null
          religion_level?: string | null
          updated_at?: string
          user_id?: string
          verification_level?: string | null
          wali_contact_info?: Json | null
          wants_children?: boolean | null
        }
        Relationships: []
      }
      user_likes: {
        Row: {
          created_at: string
          id: string
          liked_id: string
          liker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          liked_id: string
          liker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          liked_id?: string
          liker_id?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          created_at: string
          documents: Json | null
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
          verification_type: string
        }
        Insert: {
          created_at?: string
          documents?: Json | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verification_type: string
        }
        Update: {
          created_at?: string
          documents?: Json | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verification_type?: string
        }
        Relationships: []
      }
      video_call_sessions: {
        Row: {
          caller_id: string
          created_at: string
          ended_at: string | null
          id: string
          receiver_id: string
          session_data: Json | null
          started_at: string | null
          status: string
        }
        Insert: {
          caller_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          receiver_id: string
          session_data?: Json | null
          started_at?: string | null
          status?: string
        }
        Update: {
          caller_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          receiver_id?: string
          session_data?: Json | null
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_match_score: {
        Args: { user1_id: string; user2_id: string }
        Returns: number
      }
      get_match_recommendations: {
        Args: { target_user_id: string; limit_count?: number }
        Returns: {
          user_id: string
          first_name: string
          last_name: string
          display_name: string
          age: number
          location: string
          bio: string
          avatar_url: string
          religion_level: string
          prayer_frequency: string
          hijab_status: string
          match_score: number
        }[]
      }
      get_mutual_matches: {
        Args: { target_user_id: string }
        Returns: {
          match_id: string
          matched_user_id: string
          first_name: string
          last_name: string
          display_name: string
          age: number
          location: string
          bio: string
          avatar_url: string
          religion_level: string
          prayer_frequency: string
          hijab_status: string
          match_score: number
          matched_at: string
        }[]
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
