export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      collections: {
        Row: {
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      epsg: {
        Row: {
          code: number
          definition: string | null
        }
        Insert: {
          code: number
          definition?: string | null
        }
        Update: {
          code?: number
          definition?: string | null
        }
        Relationships: []
      }
      features: {
        Row: {
          collectionId: number | null
          created_at: string
          id: number
          meta: Json | null
          typeId: number | null
        }
        Insert: {
          collectionId?: number | null
          created_at?: string
          id?: number
          meta?: Json | null
          typeId?: number | null
        }
        Update: {
          collectionId?: number | null
          created_at?: string
          id?: number
          meta?: Json | null
          typeId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "features_collectionId_fkey"
            columns: ["collectionId"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "features_typeId_fkey"
            columns: ["typeId"]
            isOneToOne: false
            referencedRelation: "types"
            referencedColumns: ["id"]
          },
        ]
      }
      points: {
        Row: {
          created_at: string
          featureId: number | null
          groundZ: number | null
          id: number
          x: number | null
          y: number | null
          z: number | null
        }
        Insert: {
          created_at?: string
          featureId?: number | null
          groundZ?: number | null
          id?: number
          x?: number | null
          y?: number | null
          z?: number | null
        }
        Update: {
          created_at?: string
          featureId?: number | null
          groundZ?: number | null
          id?: number
          x?: number | null
          y?: number | null
          z?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "points_featureId_fkey"
            columns: ["featureId"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          centerX: number | null
          centerY: number | null
          epsg: number | null
          id: number
          zoom: number | null
        }
        Insert: {
          centerX?: number | null
          centerY?: number | null
          epsg?: number | null
          id?: number
          zoom?: number | null
        }
        Update: {
          centerX?: number | null
          centerY?: number | null
          epsg?: number | null
          id?: number
          zoom?: number | null
        }
        Relationships: []
      }
      types: {
        Row: {
          created_at: string
          geometry: Database["public"]["Enums"]["GeometryType"] | null
          id: number
          metaTemplate: Json | null
          name: string | null
        }
        Insert: {
          created_at?: string
          geometry?: Database["public"]["Enums"]["GeometryType"] | null
          id?: number
          metaTemplate?: Json | null
          name?: string | null
        }
        Update: {
          created_at?: string
          geometry?: Database["public"]["Enums"]["GeometryType"] | null
          id?: number
          metaTemplate?: Json | null
          name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      GeometryType:
        | "Point"
        | "LineString"
        | "Polygon"
        | "MultiPoint"
        | "MultiLineString"
        | "MultiPolygon"
        | "GeometryCollection"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
