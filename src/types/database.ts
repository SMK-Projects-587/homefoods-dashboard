export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          description: string;
          id: number;
          image_path: string;
          is_active: boolean;
          name: string;
          native_name: string | null;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          id?: never;
          image_path?: string;
          is_active?: boolean;
          name: string;
          native_name?: string | null;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: never;
          image_path?: string;
          is_active?: boolean;
          name?: string;
          native_name?: string | null;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoice_counters: {
        Row: {
          created_at: string;
          fy: string;
          last_value: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          fy: string;
          last_value: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          fy?: string;
          last_value?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          billing_address: Json;
          billing_name: string;
          created_at: string;
          discount: number;
          id: number;
          invoice_number: string;
          issued_at: string | null;
          line_items: Json;
          order_id: number;
          pdf_key: string;
          status: string;
          subtotal: number;
          tax: number;
          total: number;
          updated_at: string;
        };
        Insert: {
          billing_address?: Json;
          billing_name?: string;
          created_at?: string;
          discount?: number;
          id?: never;
          invoice_number: string;
          issued_at?: string | null;
          line_items?: Json;
          order_id: number;
          pdf_key?: string;
          status?: string;
          subtotal?: number;
          tax?: number;
          total?: number;
          updated_at?: string;
        };
        Update: {
          billing_address?: Json;
          billing_name?: string;
          created_at?: string;
          discount?: number;
          id?: never;
          invoice_number?: string;
          issued_at?: string | null;
          line_items?: Json;
          order_id?: number;
          pdf_key?: string;
          status?: string;
          subtotal?: number;
          tax?: number;
          total?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'invoices_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: true;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: number;
          line_total: number;
          order_id: number;
          product_name: string;
          quantity: number;
          sku: string;
          unit_price: number;
          updated_at: string;
          variant_id: number | null;
          variant_title: string;
        };
        Insert: {
          created_at?: string;
          id?: never;
          line_total: number;
          order_id: number;
          product_name: string;
          quantity: number;
          sku: string;
          unit_price: number;
          updated_at?: string;
          variant_id?: number | null;
          variant_title: string;
        };
        Update: {
          created_at?: string;
          id?: never;
          line_total?: number;
          order_id?: number;
          product_name?: string;
          quantity?: number;
          sku?: string;
          unit_price?: number;
          updated_at?: string;
          variant_id?: number | null;
          variant_title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_variant_id_fkey';
            columns: ['variant_id'];
            isOneToOne: false;
            referencedRelation: 'product_variants';
            referencedColumns: ['id'];
          },
        ];
      };
      order_status_history: {
        Row: {
          changed_by: string | null;
          created_at: string;
          from_status: string | null;
          id: number;
          order_id: number;
          reason: string | null;
          to_status: string;
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: string | null;
          id?: never;
          order_id: number;
          reason?: string | null;
          to_status: string;
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: string | null;
          id?: never;
          order_id?: number;
          reason?: string | null;
          to_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'order_status_history_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          created_at: string;
          created_by: string | null;
          customer_email: string;
          customer_name: string;
          customer_phone: string;
          discount: number;
          id: number;
          notes: string;
          order_number: string;
          payment_status: string | null;
          shipping_address: Json;
          shipping_fee: number;
          status: string;
          subtotal: number;
          tax: number;
          total: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          customer_email?: string;
          customer_name: string;
          customer_phone?: string;
          discount?: number;
          id?: never;
          notes?: string;
          order_number: string;
          payment_status?: string | null;
          shipping_address?: Json;
          shipping_fee?: number;
          status?: string;
          subtotal?: number;
          tax?: number;
          total?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          customer_email?: string;
          customer_name?: string;
          customer_phone?: string;
          discount?: number;
          id?: never;
          notes?: string;
          order_number?: string;
          payment_status?: string | null;
          shipping_address?: Json;
          shipping_fee?: number;
          status?: string;
          subtotal?: number;
          tax?: number;
          total?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          alt_text: string;
          created_at: string;
          id: number;
          image_path: string;
          is_primary: boolean;
          product_id: number;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          alt_text?: string;
          created_at?: string;
          id?: never;
          image_path: string;
          is_primary?: boolean;
          product_id: number;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          alt_text?: string;
          created_at?: string;
          id?: never;
          image_path?: string;
          is_primary?: boolean;
          product_id?: number;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'product_images_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      product_variants: {
        Row: {
          compare_at_price: number | null;
          created_at: string;
          id: number;
          in_stock: boolean;
          is_active: boolean;
          is_default: boolean;
          price: number;
          product_id: number;
          sku: string;
          stock: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          compare_at_price?: number | null;
          created_at?: string;
          id?: never;
          in_stock?: boolean;
          is_active?: boolean;
          is_default?: boolean;
          price: number;
          product_id: number;
          sku: string;
          stock?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          compare_at_price?: number | null;
          created_at?: string;
          id?: never;
          in_stock?: boolean;
          is_active?: boolean;
          is_default?: boolean;
          price?: number;
          product_id?: number;
          sku?: string;
          stock?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'product_variants_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      products: {
        Row: {
          category_id: number | null;
          created_at: string;
          description: string;
          id: number;
          is_active: boolean;
          keywords: string[];
          meta_description: string;
          meta_title: string;
          name: string;
          native_name: string | null;
          search_vector: unknown;
          slug: string;
          updated_at: string;
        };
        Insert: {
          category_id?: number | null;
          created_at?: string;
          description?: string;
          id?: never;
          is_active?: boolean;
          keywords?: string[];
          meta_description?: string;
          meta_title?: string;
          name: string;
          native_name?: string | null;
          search_vector?: unknown;
          slug: string;
          updated_at?: string;
        };
        Update: {
          category_id?: number | null;
          created_at?: string;
          description?: string;
          id?: never;
          is_active?: boolean;
          keywords?: string[];
          meta_description?: string;
          meta_title?: string;
          name?: string;
          native_name?: string | null;
          search_vector?: unknown;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_unique_slug: {
        Args: { source_name: string; tbl: unknown };
        Returns: string;
      };
      next_invoice_number: { Args: never; Returns: string };
      search_products: {
        Args: {
          category_slug?: string;
          in_stock_filter?: boolean;
          max_results?: number;
          offset_by?: number;
          require_variant?: boolean;
          term: string;
        };
        Returns: {
          category_id: number;
          category_slug_out: string;
          compare_at_price: number;
          created_at: string;
          description: string;
          id: number;
          in_stock: boolean;
          is_active: boolean;
          keywords: string[];
          name: string;
          price: number;
          primary_image_path: string;
          rank: number;
          slug: string;
        }[];
      };
      slugify: { Args: { input: string }; Returns: string };
      update_order_status: {
        Args: {
          p_from_status: string;
          p_order_id: number;
          p_reason?: string;
          p_to_status: string;
        };
        Returns: {
          created_at: string;
          created_by: string | null;
          customer_email: string;
          customer_name: string;
          customer_phone: string;
          discount: number;
          id: number;
          notes: string;
          order_number: string;
          payment_status: string | null;
          shipping_address: Json;
          shipping_fee: number;
          status: string;
          subtotal: number;
          tax: number;
          total: number;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'orders';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
