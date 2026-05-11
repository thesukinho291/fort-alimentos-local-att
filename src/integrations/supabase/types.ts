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
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          cidade: string
          cnpj: string
          created_at: string
          endereco: string
          id: string
          nome_fantasia: string
          razao_social: string
          senha_hash: string
          situacao_cadastral: string
          updated_at: string
          uf: string
          vendedor_id: string
        }
        Insert: {
          cidade?: string
          cnpj: string
          created_at?: string
          endereco?: string
          id?: string
          nome_fantasia?: string
          razao_social: string
          senha_hash: string
          situacao_cadastral?: string
          updated_at?: string
          uf?: string
          vendedor_id: string
        }
        Update: {
          cidade?: string
          cnpj?: string
          created_at?: string
          endereco?: string
          id?: string
          nome_fantasia?: string
          razao_social?: string
          senha_hash?: string
          situacao_cadastral?: string
          updated_at?: string
          uf?: string
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vendedores"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_sessoes: {
        Row: {
          cliente_id: string
          created_at: string
          expires_at: string
          id: string
          last_seen_at: string
          token_hash: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          expires_at: string
          id?: string
          last_seen_at?: string
          token_hash: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          last_seen_at?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_sessoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image: string
          is_new_release: boolean
          is_promotion: boolean
          is_unavailable: boolean
          name: string
          price: number | null
          promo_price: number | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string
          id?: string
          image?: string
          is_new_release?: boolean
          is_promotion?: boolean
          is_unavailable?: boolean
          name: string
          price?: number | null
          promo_price?: number | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image?: string
          is_new_release?: boolean
          is_promotion?: boolean
          is_unavailable?: boolean
          name?: string
          price?: number | null
          promo_price?: number | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          about_text: string
          address: string
          banner_image_url: string
          banner_subtitle: string
          banner_title: string
          business_hours: string
          categories: Json
          company_name: string
          created_at: string
          email: string
          features: Json
          id: string
          instagram_link: string
          location_link: string
          logo_url: string
          phone: string
          promo_banner_text: string
          updated_at: string
          whatsapp_link: string
        }
        Insert: {
          about_text?: string
          address?: string
          banner_image_url?: string
          banner_subtitle?: string
          banner_title?: string
          business_hours?: string
          categories?: Json
          company_name?: string
          created_at?: string
          email?: string
          features?: Json
          id?: string
          instagram_link?: string
          location_link?: string
          logo_url?: string
          phone?: string
          promo_banner_text?: string
          updated_at?: string
          whatsapp_link?: string
        }
        Update: {
          about_text?: string
          address?: string
          banner_image_url?: string
          banner_subtitle?: string
          banner_title?: string
          business_hours?: string
          categories?: Json
          company_name?: string
          created_at?: string
          email?: string
          features?: Json
          id?: string
          instagram_link?: string
          location_link?: string
          logo_url?: string
          phone?: string
          promo_banner_text?: string
          updated_at?: string
          whatsapp_link?: string
        }
        Relationships: []
      }
      vendedores: {
        Row: {
          created_at: string
          id: string
          nome: string
          telefone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          telefone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          telefone?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_upsert_cliente: {
        Args: {
          p_cidade?: string
          p_cnpj: string
          p_endereco?: string
          p_id: string | null
          p_nome_fantasia?: string
          p_razao_social: string
          p_senha: string | null
          p_situacao_cadastral?: string
          p_uf?: string
          p_vendedor_id: string
        }
        Returns: string
      }
      is_valid_cnpj: {
        Args: {
          p_cnpj: string
        }
        Returns: boolean
      }
      login_cliente: {
        Args: {
          p_cnpj: string
          p_senha: string
        }
        Returns: {
          cnpj: string
          expires_at: string
          id: string
          razao_social: string
          session_token: string
          vendedor_id: string
          vendedor_nome: string
          vendedor_telefone: string
        }[]
      }
      logout_cliente: {
        Args: {
          p_session_token: string
        }
        Returns: undefined
      }
      normalize_digits: {
        Args: {
          value: string
        }
        Returns: string
      }
      registrar_cliente_empresa: {
        Args: {
          p_cidade: string
          p_cnpj: string
          p_endereco: string
          p_nome_fantasia: string
          p_razao_social: string
          p_senha: string
          p_situacao_cadastral: string
          p_uf: string
        }
        Returns: string
      }
      validar_sessao_cliente: {
        Args: {
          p_session_token: string
        }
        Returns: {
          cnpj: string
          expires_at: string
          id: string
          razao_social: string
          session_token: string
          vendedor_id: string
          vendedor_nome: string
          vendedor_telefone: string
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
