import type { BasicSupabaseClient } from "../types/supabase.js";
import type { Booking, NewBooking } from "../types/booking.js";

export async function getBookings(
  supabase: BasicSupabaseClient
): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getBookingById(
  supabase: BasicSupabaseClient,
  id: string
): Promise<Booking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createBooking(
  supabase: BasicSupabaseClient,
  booking: NewBooking
): Promise<Booking> {
  const payload = {
    ...booking,
    status: booking.status ?? "pending"
  };

  const { data, error } = await supabase
    .from("bookings")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Booking could not be created");
  }

  return data;
}