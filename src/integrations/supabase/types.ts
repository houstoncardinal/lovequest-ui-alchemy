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
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          permissions: Json | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      match_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          last_message_id: string | null
          match_id: string
          unread_count_user1: number | null
          unread_count_user2: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
          match_id: string
          unread_count_user1?: number | null
          unread_count_user2?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
          match_id?: string
          unread_count_user1?: number | null
          unread_count_user2?: number | null
          updated_at?: string
        }
        Relationships: []
      }
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
      messages: {
        Row: {
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          is_read: boolean
          message_type: string
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_read?: boolean
          message_type?: string
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_read?: boolean
          message_type?: string
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean | null
          id: string
          marketing_emails: boolean | null
          new_matches: boolean | null
          new_messages: boolean | null
          profile_views: boolean | null
          push_enabled: boolean | null
          super_likes: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          new_matches?: boolean | null
          new_messages?: boolean | null
          profile_views?: boolean | null
          push_enabled?: boolean | null
          super_likes?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          new_matches?: boolean | null
          new_messages?: boolean | null
          profile_views?: boolean | null
          push_enabled?: boolean | null
          super_likes?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      photo_uploads: {
        Row: {
          created_at: string
          file_path: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_primary: boolean | null
          is_verified: boolean | null
          updated_at: string
          upload_status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          updated_at?: string
          upload_status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          updated_at?: string
          upload_status?: string | null
          user_id?: string
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
          hashtags: string[] | null
          id: string
          image_url: string | null
          is_trending: boolean | null
          likes_count: number | null
          location: string | null
          mood: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          is_trending?: boolean | null
          likes_count?: number | null
          location?: string | null
          mood?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          is_trending?: boolean | null
          likes_count?: number | null
          location?: string | null
          mood?: string | null
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
          body_type: string | null
          can_access_app: boolean | null
          career_field: string | null
          children_preference: string | null
          community_involvement_level: string | null
          created_at: string
          date_of_birth: string | null
          dietary_preferences: string[] | null
          display_name: string | null
          education_level: string | null
          exercise_frequency: string | null
          family_size_preference: string | null
          financial_readiness: string | null
          first_name: string | null
          gender: string | null
          hajj_umrah_experience: boolean | null
          has_children: boolean | null
          height_cm: number | null
          hijab_status: string | null
          hobbies_interests: string[] | null
          id: string
          income_range: string | null
          interests: string[] | null
          is_verified: boolean | null
          islamic_knowledge_level: string | null
          languages_spoken: string[] | null
          last_active: string | null
          last_name: string | null
          latitude: number | null
          location: string | null
          location_updated_at: string | null
          longitude: number | null
          madhab: string | null
          marital_status: string | null
          marriage_timeline: string | null
          number_of_children: number | null
          number_of_children_wanted: number | null
          personality_traits: string[] | null
          prayer_frequency: string | null
          previous_marriage: boolean | null
          profile_boost_expires: string | null
          relationship_goals: string[] | null
          religion_level: string | null
          smoking_status: string | null
          updated_at: string
          user_id: string
          verification_level: string | null
          verification_required: boolean | null
          wali_contact_info: Json | null
          wants_children: boolean | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          body_type?: string | null
          can_access_app?: boolean | null
          career_field?: string | null
          children_preference?: string | null
          community_involvement_level?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_preferences?: string[] | null
          display_name?: string | null
          education_level?: string | null
          exercise_frequency?: string | null
          family_size_preference?: string | null
          financial_readiness?: string | null
          first_name?: string | null
          gender?: string | null
          hajj_umrah_experience?: boolean | null
          has_children?: boolean | null
          height_cm?: number | null
          hijab_status?: string | null
          hobbies_interests?: string[] | null
          id?: string
          income_range?: string | null
          interests?: string[] | null
          is_verified?: boolean | null
          islamic_knowledge_level?: string | null
          languages_spoken?: string[] | null
          last_active?: string | null
          last_name?: string | null
          latitude?: number | null
          location?: string | null
          location_updated_at?: string | null
          longitude?: number | null
          madhab?: string | null
          marital_status?: string | null
          marriage_timeline?: string | null
          number_of_children?: number | null
          number_of_children_wanted?: number | null
          personality_traits?: string[] | null
          prayer_frequency?: string | null
          previous_marriage?: boolean | null
          profile_boost_expires?: string | null
          relationship_goals?: string[] | null
          religion_level?: string | null
          smoking_status?: string | null
          updated_at?: string
          user_id: string
          verification_level?: string | null
          verification_required?: boolean | null
          wali_contact_info?: Json | null
          wants_children?: boolean | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          body_type?: string | null
          can_access_app?: boolean | null
          career_field?: string | null
          children_preference?: string | null
          community_involvement_level?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_preferences?: string[] | null
          display_name?: string | null
          education_level?: string | null
          exercise_frequency?: string | null
          family_size_preference?: string | null
          financial_readiness?: string | null
          first_name?: string | null
          gender?: string | null
          hajj_umrah_experience?: boolean | null
          has_children?: boolean | null
          height_cm?: number | null
          hijab_status?: string | null
          hobbies_interests?: string[] | null
          id?: string
          income_range?: string | null
          interests?: string[] | null
          is_verified?: boolean | null
          islamic_knowledge_level?: string | null
          languages_spoken?: string[] | null
          last_active?: string | null
          last_name?: string | null
          latitude?: number | null
          location?: string | null
          location_updated_at?: string | null
          longitude?: number | null
          madhab?: string | null
          marital_status?: string | null
          marriage_timeline?: string | null
          number_of_children?: number | null
          number_of_children_wanted?: number | null
          personality_traits?: string[] | null
          prayer_frequency?: string | null
          previous_marriage?: boolean | null
          profile_boost_expires?: string | null
          relationship_goals?: string[] | null
          religion_level?: string | null
          smoking_status?: string | null
          updated_at?: string
          user_id?: string
          verification_level?: string | null
          verification_required?: boolean | null
          wali_contact_info?: Json | null
          wants_children?: boolean | null
        }
        Relationships: []
      }
      push_notification_tokens: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
          reason?: string | null
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
      user_preferences: {
        Row: {
          age_range_max: number | null
          age_range_min: number | null
          created_at: string | null
          deal_breakers: Json | null
          id: string
          looking_for: string | null
          max_distance_km: number | null
          show_me: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age_range_max?: number | null
          age_range_min?: number | null
          created_at?: string | null
          deal_breakers?: Json | null
          id?: string
          looking_for?: string | null
          max_distance_km?: number | null
          show_me?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age_range_max?: number | null
          age_range_min?: number | null
          created_at?: string | null
          deal_breakers?: Json | null
          id?: string
          looking_for?: string | null
          max_distance_km?: number | null
          show_me?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          reason: string | null
          report_type: string
          reported_message_id: string | null
          reported_post_id: string | null
          reported_user_id: string | null
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          report_type: string
          reported_message_id?: string | null
          reported_post_id?: string | null
          reported_user_id?: string | null
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          report_type?: string
          reported_message_id?: string | null
          reported_post_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          features_enabled: Json | null
          id: string
          is_active: boolean
          plan_type: Database["public"]["Enums"]["user_plan_type"]
          subscription_end: string | null
          subscription_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          features_enabled?: Json | null
          id?: string
          is_active?: boolean
          plan_type?: Database["public"]["Enums"]["user_plan_type"]
          subscription_end?: string | null
          subscription_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          features_enabled?: Json | null
          id?: string
          is_active?: boolean
          plan_type?: Database["public"]["Enums"]["user_plan_type"]
          subscription_end?: string | null
          subscription_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          allow_read_receipts: boolean | null
          block_contacts: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          incognito_mode: boolean | null
          marketing_emails: boolean | null
          profile_visibility: string | null
          push_notifications: boolean | null
          show_active_status: boolean | null
          show_age: boolean | null
          show_distance: boolean | null
          sound_enabled: boolean | null
          updated_at: string | null
          user_id: string
          vibration_enabled: boolean | null
        }
        Insert: {
          allow_read_receipts?: boolean | null
          block_contacts?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          incognito_mode?: boolean | null
          marketing_emails?: boolean | null
          profile_visibility?: string | null
          push_notifications?: boolean | null
          show_active_status?: boolean | null
          show_age?: boolean | null
          show_distance?: boolean | null
          sound_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          vibration_enabled?: boolean | null
        }
        Update: {
          allow_read_receipts?: boolean | null
          block_contacts?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          incognito_mode?: boolean | null
          marketing_emails?: boolean | null
          profile_visibility?: string | null
          push_notifications?: boolean | null
          show_active_status?: boolean | null
          show_age?: boolean | null
          show_distance?: boolean | null
          sound_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          vibration_enabled?: boolean | null
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          documents: Json | null
          face_photo_url: string | null
          id: string
          id_document_url: string | null
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
          verification_type: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          documents?: Json | null
          face_photo_url?: string | null
          id?: string
          id_document_url?: string | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verification_type: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          documents?: Json | null
          face_photo_url?: string | null
          id?: string
          id_document_url?: string | null
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
      are_users_matched: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
      }
      calculate_distance: {
        Args: { lat1: number; lon1: number; lat2: number; lon2: number }
        Returns: number
      }
      calculate_enhanced_match_score: {
        Args: { user1_id: string; user2_id: string }
        Returns: number
      }
      calculate_match_score: {
        Args: { user1_id: string; user2_id: string }
        Returns: number
      }
      get_compatibility_insights: {
        Args: { user1_id: string; user2_id: string }
        Returns: {
          category: string
          score: number
          insight: string
          compatibility_level: string
        }[]
      }
      get_enhanced_match_recommendations: {
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
          education_level: string
          career_field: string
          marital_status: string
          smoking_status: string
          has_children: boolean
          children_preference: string
          is_verified: boolean
          match_score: number
        }[]
      }
      get_enhanced_match_recommendations_with_gender: {
        Args: { target_user_id: string; limit_count?: number }
        Returns: {
          user_id: string
          first_name: string
          last_name: string
          display_name: string
          age: number
          gender: string
          location: string
          bio: string
          avatar_url: string
          religion_level: string
          prayer_frequency: string
          hijab_status: string
          education_level: string
          career_field: string
          marital_status: string
          smoking_status: string
          has_children: boolean
          children_preference: string
          is_verified: boolean
          interests: string[]
          match_score: number
        }[]
      }
      get_location_based_matches: {
        Args: {
          target_user_id: string
          max_distance_km?: number
          limit_count?: number
        }
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
          distance_km: number
        }[]
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
      get_or_create_conversation: {
        Args: { user1_id: string; user2_id: string }
        Returns: string
      }
      get_user_plan: {
        Args: { user_id_param?: string }
        Returns: Database["public"]["Enums"]["user_plan_type"]
      }
      grant_app_access_for_complete_profiles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_feature_access: {
        Args: { feature_name: string; user_id_param?: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_user_blocked: {
        Args: { blocker_id: string; blocked_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_plan_type: "free" | "premium" | "elite"
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
      user_plan_type: ["free", "premium", "elite"],
    },
  },
} as const
