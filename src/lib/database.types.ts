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
        Insert: { id: string; email?: string | null }
        Update: { email?: string | null }
      }
      humor_flavors: {
        Row: {
          id: number
          slug: string
          description: string | null
          created_by_user_id: string
          modified_by_user_id: string
          created_datetime_utc: string
          modified_datetime_utc: string
        }
        Insert: {
          slug: string
          description?: string | null
          created_by_user_id: string
          modified_by_user_id: string
        }
        Update: {
          slug?: string
          description?: string | null
          modified_by_user_id?: string
          modified_datetime_utc?: string
        }
      }
      humor_flavor_steps: {
        Row: {
          id: number
          humor_flavor_id: number
          order_by: number
          llm_system_prompt: string | null
          llm_user_prompt: string | null
          description: string | null
          llm_temperature: number | null
          llm_model_id: number | null
          llm_input_type_id: number | null
          llm_output_type_id: number | null
          humor_flavor_step_type_id: number | null
          created_by_user_id: string
          modified_by_user_id: string
          created_datetime_utc: string
          modified_datetime_utc: string
        }
        Insert: {
          humor_flavor_id: number
          order_by: number
          llm_system_prompt?: string | null
          llm_user_prompt?: string | null
          description?: string | null
          llm_temperature?: number | null
          llm_model_id?: number | null
          llm_input_type_id?: number | null
          llm_output_type_id?: number | null
          humor_flavor_step_type_id?: number | null
          created_by_user_id: string
          modified_by_user_id: string
        }
        Update: {
          order_by?: number
          llm_system_prompt?: string | null
          llm_user_prompt?: string | null
          description?: string | null
          llm_temperature?: number | null
          llm_model_id?: number | null
          llm_input_type_id?: number | null
          llm_output_type_id?: number | null
          humor_flavor_step_type_id?: number | null
          modified_by_user_id?: string
          modified_datetime_utc?: string
        }
      }
      llm_models: {
        Row: { id: number; name: string }
        Insert: { name: string }
        Update: { name?: string }
      }
      llm_input_types: {
        Row: { id: number; description: string; slug: string }
        Insert: { description: string; slug: string }
        Update: { description?: string; slug?: string }
      }
      llm_output_types: {
        Row: { id: number; description: string; slug: string }
        Insert: { description: string; slug: string }
        Update: { description?: string; slug?: string }
      }
      humor_flavor_step_types: {
        Row: { id: number; slug: string; description: string }
        Insert: { slug: string; description: string }
        Update: { slug?: string; description?: string }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Profile             = Database['public']['Tables']['profiles']['Row']
export type HumorFlavor         = Database['public']['Tables']['humor_flavors']['Row']
export type HumorFlavorStep     = Database['public']['Tables']['humor_flavor_steps']['Row']
export type LlmModel            = Database['public']['Tables']['llm_models']['Row']
export type LlmInputType        = Database['public']['Tables']['llm_input_types']['Row']
export type LlmOutputType       = Database['public']['Tables']['llm_output_types']['Row']
export type HumorFlavorStepType = Database['public']['Tables']['humor_flavor_step_types']['Row']

export const LLM_MODELS = [
  { id: 1,  name: 'GPT-4.1' },
  { id: 2,  name: 'GPT-4.1-mini' },
  { id: 3,  name: 'GPT-4.1-nano' },
  { id: 5,  name: 'GPT-4o' },
  { id: 6,  name: 'GPT-4o-mini' },
  { id: 13, name: 'Gemini 2.5 Pro' },
  { id: 14, name: 'Gemini 2.5 Flash' },
]

export const LLM_INPUT_TYPES = [
  { id: 1, description: 'Image and text input', slug: 'image-and-text' },
  { id: 2, description: 'Text only input',       slug: 'text-only' },
]

export const LLM_OUTPUT_TYPES = [
  { id: 1, description: 'String', slug: 'string' },
  { id: 2, description: 'Array',  slug: 'array'  },
]

export const STEP_TYPES = [
  { id: 1, slug: 'celebrity-recognition', description: 'Celebrity recognition' },
  { id: 2, slug: 'image-description',     description: 'Image description'     },
  { id: 3, slug: 'general',               description: 'General'               },
]