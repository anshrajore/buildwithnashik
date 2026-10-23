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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          actor_role: string | null
          correlation_id: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          new_value: Json | null
          previous_value: Json | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          actor_role?: string | null
          correlation_id: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          new_value?: Json | null
          previous_value?: Json | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          actor_role?: string | null
          correlation_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          new_value?: Json | null
          previous_value?: Json | null
        }
        Relationships: []
      }
      community_events: {
        Row: {
          banner_url: string | null
          category: string
          city: string | null
          created_at: string
          description: string
          end_date: string | null
          event_name: string
          id: string
          maps_url: string | null
          mode: string
          notified_at: string | null
          organisation: string | null
          organiser_email: string
          organiser_name: string
          organiser_phone: string
          register_url: string | null
          review_note: string | null
          reviewed_at: string | null
          socials: Json
          start_date: string | null
          status: string
          submitted_by: string | null
          tagline: string | null
          team_max: number
          team_min: number
          venue: string | null
          website_url: string | null
        }
        Insert: {
          banner_url?: string | null
          category: string
          city?: string | null
          created_at?: string
          description: string
          end_date?: string | null
          event_name: string
          id?: string
          maps_url?: string | null
          mode?: string
          notified_at?: string | null
          organisation?: string | null
          organiser_email: string
          organiser_name: string
          organiser_phone: string
          register_url?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          socials?: Json
          start_date?: string | null
          status?: string
          submitted_by?: string | null
          tagline?: string | null
          team_max?: number
          team_min?: number
          venue?: string | null
          website_url?: string | null
        }
        Update: {
          banner_url?: string | null
          category?: string
          city?: string | null
          created_at?: string
          description?: string
          end_date?: string | null
          event_name?: string
          id?: string
          maps_url?: string | null
          mode?: string
          notified_at?: string | null
          organisation?: string | null
          organiser_email?: string
          organiser_name?: string
          organiser_phone?: string
          register_url?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          socials?: Json
          start_date?: string | null
          status?: string
          submitted_by?: string | null
          tagline?: string | null
          team_max?: number
          team_min?: number
          venue?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      event_email_log: {
        Row: {
          body: string
          created_at: string
          error_message: string | null
          event_id: string
          id: string
          recipient_email: string
          registration_id: string | null
          sent_by: string | null
          status: string
          subject: string
          template: string
        }
        Insert: {
          body: string
          created_at?: string
          error_message?: string | null
          event_id: string
          id?: string
          recipient_email: string
          registration_id?: string | null
          sent_by?: string | null
          status?: string
          subject: string
          template: string
        }
        Update: {
          body?: string
          created_at?: string
          error_message?: string | null
          event_id?: string
          id?: string
          recipient_email?: string
          registration_id?: string | null
          sent_by?: string | null
          status?: string
          subject?: string
          template?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_email_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_email_log_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_organizers: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          event_id: string
          id: string
          permissions: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          event_id: string
          id?: string
          permissions?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          event_id?: string
          id?: string
          permissions?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_organizers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          answers: Json
          city: string | null
          college: string | null
          created_at: string
          current_round_id: string | null
          documents: Json
          event_id: string
          id: string
          lead_email: string
          lead_name: string
          lead_phone: string
          member_count: number
          organizer_notes: string | null
          participation_type: string
          registration_code: string
          status: string
          team_name: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          answers?: Json
          city?: string | null
          college?: string | null
          created_at?: string
          current_round_id?: string | null
          documents?: Json
          event_id: string
          id?: string
          lead_email: string
          lead_name: string
          lead_phone: string
          member_count?: number
          organizer_notes?: string | null
          participation_type?: string
          registration_code: string
          status?: string
          team_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          city?: string | null
          college?: string | null
          created_at?: string
          current_round_id?: string | null
          documents?: Json
          event_id?: string
          id?: string
          lead_email?: string
          lead_name?: string
          lead_phone?: string
          member_count?: number
          organizer_notes?: string | null
          participation_type?: string
          registration_code?: string
          status?: string
          team_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_current_round_id_fkey"
            columns: ["current_round_id"]
            isOneToOne: false
            referencedRelation: "event_rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rounds: {
        Row: {
          allow_file: boolean
          allow_link: boolean
          allow_text: boolean
          created_at: string
          description: string | null
          ends_at: string | null
          event_id: string
          id: string
          is_enabled: boolean
          name: string
          position: number
          round_type: string
          starts_at: string | null
          submission_deadline: string | null
          submission_requirements: Json
          submissions_open: boolean
          updated_at: string
        }
        Insert: {
          allow_file?: boolean
          allow_link?: boolean
          allow_text?: boolean
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_id: string
          id?: string
          is_enabled?: boolean
          name: string
          position?: number
          round_type?: string
          starts_at?: string | null
          submission_deadline?: string | null
          submission_requirements?: Json
          submissions_open?: boolean
          updated_at?: string
        }
        Update: {
          allow_file?: boolean
          allow_link?: boolean
          allow_text?: boolean
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_id?: string
          id?: string
          is_enabled?: boolean
          name?: string
          position?: number
          round_type?: string
          starts_at?: string | null
          submission_deadline?: string | null
          submission_requirements?: Json
          submissions_open?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rounds_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          banner_url: string | null
          capacity: number | null
          category: string
          city: string | null
          code: string
          college_restriction: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          custom_questions: Json
          description: string
          eligibility: string | null
          end_at: string | null
          event_type: string
          faqs: Json
          highlights: Json
          id: string
          links: Json
          maps_url: string | null
          mode: string
          name: string
          online_url: string | null
          owner_id: string
          participation_type: string
          published_at: string | null
          register_url: string | null
          registration_closes_at: string | null
          registration_opens_at: string | null
          required_documents: Json
          required_participant_fields: Json
          slug: string
          start_at: string | null
          stats: Json
          status: string
          tagline: string | null
          team_max: number
          team_min: number
          team_name_required: boolean
          updated_at: string
          venue: string | null
          website_url: string | null
        }
        Insert: {
          banner_url?: string | null
          capacity?: number | null
          category?: string
          city?: string | null
          code: string
          college_restriction?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          custom_questions?: Json
          description?: string
          eligibility?: string | null
          end_at?: string | null
          event_type?: string
          faqs?: Json
          highlights?: Json
          id?: string
          links?: Json
          maps_url?: string | null
          mode?: string
          name: string
          online_url?: string | null
          owner_id: string
          participation_type?: string
          published_at?: string | null
          register_url?: string | null
          registration_closes_at?: string | null
          registration_opens_at?: string | null
          required_documents?: Json
          required_participant_fields?: Json
          slug: string
          start_at?: string | null
          stats?: Json
          status?: string
          tagline?: string | null
          team_max?: number
          team_min?: number
          team_name_required?: boolean
          updated_at?: string
          venue?: string | null
          website_url?: string | null
        }
        Update: {
          banner_url?: string | null
          capacity?: number | null
          category?: string
          city?: string | null
          code?: string
          college_restriction?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          custom_questions?: Json
          description?: string
          eligibility?: string | null
          end_at?: string | null
          event_type?: string
          faqs?: Json
          highlights?: Json
          id?: string
          links?: Json
          maps_url?: string | null
          mode?: string
          name?: string
          online_url?: string | null
          owner_id?: string
          participation_type?: string
          published_at?: string | null
          register_url?: string | null
          registration_closes_at?: string | null
          registration_opens_at?: string | null
          required_documents?: Json
          required_participant_fields?: Json
          slug?: string
          start_at?: string | null
          stats?: Json
          status?: string
          tagline?: string | null
          team_max?: number
          team_min?: number
          team_name_required?: boolean
          updated_at?: string
          venue?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      mentor_judge_applications: {
        Row: {
          application_type: string
          availability: string | null
          bio: string
          city: string | null
          created_at: string
          current_title: string
          email: string
          experience_years: number
          expertise: string
          full_name: string
          id: string
          linkedin_url: string | null
          motivation: string | null
          organization: string
          phone: string
          reviewed_at: string | null
          status: string
        }
        Insert: {
          application_type: string
          availability?: string | null
          bio: string
          city?: string | null
          created_at?: string
          current_title: string
          email: string
          experience_years: number
          expertise: string
          full_name: string
          id?: string
          linkedin_url?: string | null
          motivation?: string | null
          organization: string
          phone: string
          reviewed_at?: string | null
          status?: string
        }
        Update: {
          application_type?: string
          availability?: string | null
          bio?: string
          city?: string | null
          created_at?: string
          current_title?: string
          email?: string
          experience_years?: number
          expertise?: string
          full_name?: string
          id?: string
          linkedin_url?: string | null
          motivation?: string | null
          organization?: string
          phone?: string
          reviewed_at?: string | null
          status?: string
        }
        Relationships: []
      }
      nest_members: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          joined_at: string
          notes: string | null
          status: string
          title: string | null
          track: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          joined_at?: string
          notes?: string | null
          status?: string
          title?: string | null
          track: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          joined_at?: string
          notes?: string | null
          status?: string
          title?: string | null
          track?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nest_membership_applications: {
        Row: {
          city: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          motivation: string
          organisation: string | null
          phone: string
          portfolio_url: string | null
          review_note: string | null
          reviewed_at: string | null
          skills: string | null
          status: string
          submitted_by: string | null
          track: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          motivation: string
          organisation?: string | null
          phone: string
          portfolio_url?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          skills?: string | null
          status?: string
          submitted_by?: string | null
          track: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          motivation?: string
          organisation?: string | null
          phone?: string
          portfolio_url?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          skills?: string | null
          status?: string
          submitted_by?: string | null
          track?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_seen_at: string
          phone: string | null
          provider: string | null
          signup_source: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          last_seen_at?: string
          phone?: string | null
          provider?: string | null
          signup_source?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_seen_at?: string
          phone?: string | null
          provider?: string | null
          signup_source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      registration_members: {
        Row: {
          college: string | null
          created_at: string
          details: Json
          email: string | null
          full_name: string
          id: string
          is_lead: boolean
          phone: string | null
          registration_id: string
          role: string | null
        }
        Insert: {
          college?: string | null
          created_at?: string
          details?: Json
          email?: string | null
          full_name: string
          id?: string
          is_lead?: boolean
          phone?: string | null
          registration_id: string
          role?: string | null
        }
        Update: {
          college?: string | null
          created_at?: string
          details?: Json
          email?: string | null
          full_name?: string
          id?: string
          is_lead?: boolean
          phone?: string | null
          registration_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registration_members_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      round_submissions: {
        Row: {
          answers: Json
          created_at: string
          event_id: string
          files: Json
          id: string
          link_url: string | null
          registration_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          round_id: string
          score: number | null
          status: string
          text_response: string | null
          updated_at: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          event_id: string
          files?: Json
          id?: string
          link_url?: string | null
          registration_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          round_id: string
          score?: number | null
          status?: string
          text_response?: string | null
          updated_at?: string
        }
        Update: {
          answers?: Json
          created_at?: string
          event_id?: string
          files?: Json
          id?: string
          link_url?: string | null
          registration_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          round_id?: string
          score?: number | null
          status?: string
          text_response?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "round_submissions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_submissions_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_submissions_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "event_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      site_visits: {
        Row: {
          created_at: string
          id: string
          path: string
          referrer: string | null
          session_id: string | null
          site: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          referrer?: string | null
          session_id?: string | null
          site?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          referrer?: string | null
          session_id?: string | null
          site?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sponsor_inquiries: {
        Row: {
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          id: string
          message: string | null
          status: string
          tier: string
          website: string | null
        }
        Insert: {
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          message?: string | null
          status?: string
          tier: string
          website?: string | null
        }
        Update: {
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          message?: string | null
          status?: string
          tier?: string
          website?: string | null
        }
        Relationships: []
      }
      swag_designs: {
        Row: {
          avatar_emoji: string | null
          created_at: string
          display_name: string
          format_id: string
          id: string
          label: string
          role: string
          theme_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_emoji?: string | null
          created_at?: string
          display_name: string
          format_id?: string
          id?: string
          label?: string
          role: string
          theme_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_emoji?: string | null
          created_at?: string
          display_name?: string
          format_id?: string
          id?: string
          label?: string
          role?: string
          theme_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_submissions: {
        Row: {
          created_at: string
          feedback: string | null
          files: Json
          id: string
          link_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_by: string
          task_id: string
          text_response: string | null
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          files?: Json
          id?: string
          link_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by: string
          task_id: string
          text_response?: string | null
        }
        Update: {
          created_at?: string
          feedback?: string | null
          files?: Json
          id?: string
          link_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by?: string
          task_id?: string
          text_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          activity: Json
          assigned_by: string
          assigned_to: string
          assignee_email: string | null
          assignee_name: string | null
          attachments: Json
          created_at: string
          description: string | null
          due_at: string | null
          event_id: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          activity?: Json
          assigned_by: string
          assigned_to: string
          assignee_email?: string | null
          assignee_name?: string | null
          attachments?: Json
          created_at?: string
          description?: string | null
          due_at?: string | null
          event_id?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          activity?: Json
          assigned_by?: string
          assigned_to?: string
          assignee_email?: string | null
          assignee_name?: string | null
          attachments?: Json
          created_at?: string
          description?: string | null
          due_at?: string | null
          event_id?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          city: string | null
          created_at: string
          id: string
          lead_email: string
          lead_name: string
          lead_phone: string
          member_count: number
          members: Json
          members_changed_at: string | null
          ppt_url: string | null
          project_idea: string | null
          status: string
          submission_notes: string | null
          team_name: string
          track: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          lead_email: string
          lead_name: string
          lead_phone: string
          member_count?: number
          members?: Json
          members_changed_at?: string | null
          ppt_url?: string | null
          project_idea?: string | null
          status?: string
          submission_notes?: string | null
          team_name: string
          track: string
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          lead_email?: string
          lead_name?: string
          lead_phone?: string
          member_count?: number
          members?: Json
          members_changed_at?: string | null
          ppt_url?: string | null
          project_idea?: string | null
          status?: string
          submission_notes?: string | null
          team_name?: string
          track?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteer_signups: {
        Row: {
          availability: string | null
          city: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string | null
          role_interest: string
          skills: string | null
        }
        Insert: {
          availability?: string | null
          city?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          role_interest: string
          skills?: string | null
        }
        Update: {
          availability?: string | null
          city?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          role_interest?: string
          skills?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      request_member_change: {
        Args: {
          p_lead_email: string
          p_lead_phone: string
          p_member_count: number
          p_members: Json
          p_team_name: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "builder"
        | "campus_lead"
        | "volunteer"
        | "mentor"
        | "founder"
        | "team_member"
        | "organizer"
        | "participant"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "builder",
        "campus_lead",
        "volunteer",
        "mentor",
        "founder",
        "team_member",
        "organizer",
        "participant",
      ],
    },
  },
} as const
