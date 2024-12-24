export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      histoires: {
        Row: {
          id: string
          title: string
          audio_url: string
          duration: number | null
          created_at: string
          updated_at: string
          description: string | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          title: string
          audio_url: string
          duration?: number | null
          created_at?: string
          updated_at?: string
          description?: string | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          title?: string
          audio_url?: string
          duration?: number | null
          created_at?: string
          updated_at?: string
          description?: string | null
          tags?: string[] | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
