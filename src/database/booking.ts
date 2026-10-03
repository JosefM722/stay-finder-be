import { supabase } from "../lib/supabase.js";
import type { Booking, BookingListQuery, NewBooking } from "../types/booking.js";

export async function getBookings(query: BookingListQuery): Promise<Booking[]> {
  let supabaseQuery = supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (query.from) {
    supabaseQuery = supabaseQuery.gte("check_in", query.from);
  }

  if (query.to) {
    supabaseQuery = supabaseQuery.lte("check_in", query.to);
  }

  const { data, error } = await supabaseQuery;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getBookingById(id: string): Promise<Booking | null> {
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

export async function createBooking(booking: NewBooking): Promise<Booking> {
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