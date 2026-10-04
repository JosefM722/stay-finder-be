import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewProperty, Property } from "../types/property.js";

export async function getProperties(
  supabase: SupabaseClient
): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getPropertyById(
  supabase: SupabaseClient,
  id: string
): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("property_id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createProperty(
  supabase: SupabaseClient,
  property: NewProperty
): Promise<Property> {
  const { data, error } = await supabase
    .from("properties")
    .insert(property)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Property could not be created");
  }

  return data;
}

export async function updateProperty(
  supabase: SupabaseClient,
  id: string,
  property: NewProperty
): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .update(property)
    .eq("property_id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteProperty(
  supabase: SupabaseClient,
  id: string
): Promise<Property | null> {
  const existingProperty = await getPropertyById(supabase, id);

  if (!existingProperty) {
    return null;
  }

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("property_id", id);

  if (error) {
    throw new Error(error.message);
  }

  return existingProperty;
}