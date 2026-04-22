export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'admin' | 'operator'
export type SlideType = 'song' | 'verse' | 'announcement' | 'blank'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; role: UserRole; display_name: string | null; created_at: string }
        Insert: { id: string; role?: UserRole; display_name?: string | null; created_at?: string }
        Update: { id?: string; role?: UserRole; display_name?: string | null; created_at?: string }
        Relationships: []
      }
      songs: {
        Row: { id: string; title: string; lyrics: string; artist: string | null; created_at: string }
        Insert: { id?: string; title: string; lyrics: string; artist?: string | null; created_at?: string }
        Update: { id?: string; title?: string; lyrics?: string; artist?: string | null; created_at?: string }
        Relationships: []
      }
      verses: {
        Row: { id: string; reference: string; text: string; created_at: string }
        Insert: { id?: string; reference: string; text: string; created_at?: string }
        Update: { id?: string; reference?: string; text?: string; created_at?: string }
        Relationships: []
      }
      announcements: {
        Row: { id: string; title: string; content: string; start_date: string; end_date: string; created_at: string }
        Insert: { id?: string; title: string; content: string; start_date: string; end_date: string; created_at?: string }
        Update: { id?: string; title?: string; content?: string; start_date?: string; end_date?: string; created_at?: string }
        Relationships: []
      }
      presentations: {
        Row: { id: string; name: string; created_at: string; created_by: string | null }
        Insert: { id?: string; name: string; created_at?: string; created_by?: string | null }
        Update: { id?: string; name?: string; created_at?: string; created_by?: string | null }
        Relationships: []
      }
      presentation_items: {
        Row: { id: string; presentation_id: string; type: SlideType; content_id: string | null; order_index: number; custom_content: string | null; created_at: string }
        Insert: { id?: string; presentation_id: string; type: SlideType; content_id?: string | null; order_index: number; custom_content?: string | null; created_at?: string }
        Update: { id?: string; presentation_id?: string; type?: SlideType; content_id?: string | null; order_index?: number; custom_content?: string | null; created_at?: string }
        Relationships: []
      }
      live_state: {
        Row: { id: string; presentation_id: string | null; current_item_index: number; is_active: boolean; updated_at: string }
        Insert: { id?: string; presentation_id?: string | null; current_item_index?: number; is_active?: boolean; updated_at?: string }
        Update: { id?: string; presentation_id?: string | null; current_item_index?: number; is_active?: boolean; updated_at?: string }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      slide_type: SlideType
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Song = Database['public']['Tables']['songs']['Row']
export type Verse = Database['public']['Tables']['verses']['Row']
export type Announcement = Database['public']['Tables']['announcements']['Row']
export type Presentation = Database['public']['Tables']['presentations']['Row']
export type PresentationItem = Database['public']['Tables']['presentation_items']['Row']
export type LiveState = Database['public']['Tables']['live_state']['Row']

export interface PresentationItemWithContent extends PresentationItem {
  song?: Song
  verse?: Verse
  announcement?: Announcement
}
