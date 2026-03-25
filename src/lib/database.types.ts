export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          is_superadmin: boolean
          is_matrix_admin: boolean
          is_in_study: boolean
          created_by_user_id: string
          modified_by_user_id: string
          created_datetime_utc: string
          modified_datetime_utc: string
        }
        Insert: { id: string; email?: string | null; is_superadmin?: boolean; is_matrix_admin?: boolean }
        Update: { email?: string | null; is_superadmin?: boolean; is_matrix_admin?: boolean }
      }
      humor_flavors: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: { id?: string; name: string; description?: string | null; created_by?: string | null }
        Update: { name?: string; description?: string | null; updated_at?: string }
      }
      humor_flavor_steps: {
        Row: {
          id: string
          flavor_id: string
          step_order: number
          prompt: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: { id?: string; flavor_id: string; step_order: number; prompt: string; description?: string | null }
        Update: { step_order?: number; prompt?: string; description?: string | null; updated_at?: string }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Profile        = Database['public']['Tables']['profiles']['Row']
export type HumorFlavor    = Database['public']['Tables']['humor_flavors']['Row']
export type HumorFlavorStep = Database['public']['Tables']['humor_flavor_steps']['Row']
