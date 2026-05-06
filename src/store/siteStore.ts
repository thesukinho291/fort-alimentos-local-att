import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";

import bebidasImg from "@/assets/bebidas.webp";
import condimentosImg from "@/assets/condimentos.webp";
import congeladosImg from "@/assets/congelados.webp";
import friosImg from "@/assets/frios.webp";
import laticiniosImg from "@/assets/laticinios.webp";

const categoryImages: Record<string, string> = {
  Frios: friosImg,
  Laticinios: laticiniosImg,
  "Laticínios": laticiniosImg,
  Bebidas: bebidasImg,
  Condimentos: condimentosImg,
  Congelados: congeladosImg,
};

export interface Feature {
  icon: string;
  title: string;
  desc: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  is_promotion: boolean;
  price: number | null;
  promo_price: number | null;
  is_new_release: boolean;
  is_unavailable: boolean;
}

export interface SiteContent {
  id: string;
  company_name: string;
  banner_title: string;
  banner_subtitle: string;
  about_text: string;
  phone: string;
  address: string;
  logo_url: string;
  banner_image_url: string;
  whatsapp_link: string;
  instagram_link: string;
  location_link: string;
  email: string;
  categories: string[];
  features: Feature[];
  business_hours: string;
  promo_banner_text: string;
}

export const defaultCategories = ["Frios", "Laticínios", "Bebidas", "Condimentos", "Congelados"];

export function getFallbackImage(category: string): string {
  const normalized = category.normalize("NFD").toLowerCase();
  if (normalized.includes("latic")) return laticiniosImg;
  return categoryImages[category] || friosImg;
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, image, category, is_promotion, price, promo_price, is_new_release, is_unavailable")
    .order("sort_order");

  if (error) throw error;

  return (data || []).map((product) => ({
    ...product,
    image: product.image || getFallbackImage(product.category),
    is_new_release: product.is_new_release ?? false,
    is_unavailable: product.is_unavailable ?? false,
  }));
}

export async function fetchSiteContent(): Promise<SiteContent> {
  const { data, error } = await supabase.from("site_content").select("*").limit(1).single();
  if (error) throw error;

  return {
    ...data,
    categories: (data.categories as unknown as string[]) || defaultCategories,
    features: (data.features as unknown as Feature[]) || [],
    business_hours: data.business_hours || "Seg-Sex: 08:00 - 18:00",
    promo_banner_text: data.promo_banner_text || "",
  };
}

export async function saveSiteContent(content: Partial<SiteContent> & { id: string }) {
  const { id, ...updates } = content;
  const siteContentUpdates: Database["public"]["Tables"]["site_content"]["Update"] = {
    ...updates,
    categories: updates.categories as Json | undefined,
    features: updates.features as unknown as Json | undefined,
  };
  const { error } = await supabase.from("site_content").update(siteContentUpdates).eq("id", id);
  if (error) throw error;
}

export async function upsertProduct(product: Omit<Product, "id"> & { id?: string }) {
  const payload = {
    name: product.name,
    description: product.description,
    image: product.image,
    category: product.category,
    is_promotion: product.is_promotion,
    price: product.price,
    promo_price: product.promo_price,
    is_new_release: product.is_new_release ?? false,
    is_unavailable: product.is_unavailable ?? false,
  };

  if (product.id) {
    const { error } = await supabase.from("products").update(payload).eq("id", product.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("products").insert(payload);
    if (error) throw error;
  }
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("images").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("images").getPublicUrl(path);
  return data.publicUrl;
}
