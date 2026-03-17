// lib/types.ts
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
      category_translations: {
        Row: CategoryTranslation
        Insert: Omit<CategoryTranslation, 'id' | 'created_at'>
        Update: Partial<Omit<CategoryTranslation, 'id' | 'created_at'>>
      }
      drinks: {
        Row: Drink
        Insert: Omit<Drink, 'id' | 'created_at'>
        Update: Partial<Omit<Drink, 'id' | 'created_at'>>
      }
      drink_translations: {
        Row: DrinkTranslation
        Insert: Omit<DrinkTranslation, 'id' | 'created_at'>
        Update: Partial<Omit<DrinkTranslation, 'id' | 'created_at'>>
      }
      restaurants: {
        Row: Restaurant
        Insert: Omit<Restaurant, 'id' | 'created_at'>
        Update: Partial<Omit<Restaurant, 'id' | 'created_at'>>
      }
      restaurant_translations: {
        Row: RestaurantTranslation
        Insert: Omit<RestaurantTranslation, 'id' | 'created_at'>
        Update: Partial<Omit<RestaurantTranslation, 'id' | 'created_at'>>
      }
      wine_list_entries: {
        Row: WineListEntry
        Insert: Omit<WineListEntry, 'id' | 'created_at'>
        Update: Partial<Omit<WineListEntry, 'id' | 'created_at'>>
      }
      redirects: {
        Row: Redirect
        Insert: Omit<Redirect, 'id' | 'created_at'>
        Update: Partial<Omit<Redirect, 'id' | 'created_at'>>
      }
    }
  }
}

export interface Category {
  id: number
  slug: string
  parent_id: number | null
  sort_order: number
  created_at: string
}

export interface CategoryTranslation {
  id: number
  category_id: number
  locale: string
  name: string
  description: string | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
}

export interface Drink {
  id: number
  category_id: number
  name: string
  producer: string | null
  vintage: number | null
  country: string | null
  region: string | null
  appellation: string | null
  slug: string
  created_at: string
}

export interface DrinkTranslation {
  id: number
  drink_id: number
  locale: string
  description: string | null
  tasting_notes: string | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
}

export interface Restaurant {
  id: number
  name: string
  slug: string
  country: string | null
  city: string | null
  michelin_stars: number
  created_at: string
}

export interface RestaurantTranslation {
  id: number
  restaurant_id: number
  locale: string
  description: string | null
  wine_list_critique: string | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
}

export interface WineListEntry {
  id: number
  restaurant_id: number
  drink_id: number
  price: number | null
  price_currency: string | null
  year_on_list: number | null
  created_at: string
}

export interface Redirect {
  id: number
  from_path: string
  to_path: string
  status_code: number
  created_at: string
}
