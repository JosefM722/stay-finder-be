import { Hono } from "hono";
import * as db from "../database/booking.js";
import bookingValidator from "../validators/bookingValidator.js";
import bookingParamValidator from "../validators/bookingParamValidator.js";
import bookingQueryValidator from "../validators/bookingQueryValidator.js";
import type { NewBooking } from "../types/booking.js";
import { requireAuth } from "../middleware/auth.js";

const bookingApp = new Hono();

// GET /bookings
bookingApp.get("/", requireAuth, bookingQueryValidator, async (c) => {
  try {
    const supabase = c.get("supabase");
    const query = c.req.valid("query");
    const bookings = await db.getBookings(supabase, query);
    return c.json(bookings);
  } catch (error) {
    return c.json({ error: "Failed to fetch bookings" }, 500);
  }
});

// GET /bookings/:id
bookingApp.get("/:id", requireAuth, bookingParamValidator, async (c) => {
  try {
    const supabase = c.get("supabase");
    const { id } = c.req.valid("param");
    const booking = await db.getBookingById(supabase, id);

    if (!booking) {
      return c.json({ error: "Booking not found" }, 404);
    }

    return c.json(booking);
  } catch (error) {
    return c.json({ error: "Failed to fetch booking" }, 500);
  }
});

// POST /bookings
bookingApp.post("/", requireAuth, bookingValidator, async (c) => {
  try {
    const supabase = c.get("supabase");
    const body: NewBooking = c.req.valid("json");

    if (new Date(body.check_out) <= new Date(body.check_in)) {
      return c.json({ error: "Check-out must be after check-in" }, 400);
    }

    const booking = await db.createBooking(supabase, body);
    return c.json(booking, 201);
  } catch (error) {
    return c.json({ error: "Failed to create booking" }, 400);
  }
});

export default bookingApp;