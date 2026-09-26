import { Hono } from "hono";
import { promises as fs } from "fs";
import * as z from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Booking, NewBooking } from "../booking.js";

const bookingApp = new Hono();

// ─────────── Zod-schema ───────────
const schema = z.object({
  property_id: z.string().min(1, "Property ID is required"),
  guest_name: z.string().min(1, "Guest name is required"),
  guest_email: z.string().email("Valid email is required"),
  check_in: z.string().min(1, "Check-in date is required"),
  check_out: z.string().min(1, "Check-out date is required"),
  guests: z.number().int().positive("Guests must be greater than 0"),
  booking_id: z.string().optional(),
  status: z.enum(["pending", "confirmed", "cancelled"]).optional()
});

// ─────────── Validator ───────────
const bookingValidator = zValidator("json", schema, (result, c) => {
  if (!result.success) {
    return c.json({ errors: result.error.issues }, 400);
  }

  if (!result.data.booking_id) {
    result.data.booking_id = `booking_${Math.floor(1000 + Math.random() * 9000)}`;
  }

  if (!result.data.status) {
    result.data.status = "pending";
  }
});

// ─────────── GET /bookings ───────────
bookingApp.get("/", async (c) => {
  try {
    const data = await fs.readFile("src/data/bookings.json", "utf8");
    const bookings: Booking[] = JSON.parse(data);
    return c.json(bookings);
  } catch (error) {
    return c.json([]);
  }
});

// ─────────── GET /bookings/:id ───────────
bookingApp.get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const data = await fs.readFile("src/data/bookings.json", "utf8");
    const bookings: Booking[] = JSON.parse(data);
    const booking = bookings.find((b) => b.booking_id === id);

    if (!booking) {
      return c.json({ error: `Ingen booking med id ${id}` }, 404);
    }

    return c.json(booking);
  } catch (error) {
    return c.json({ error: "Kunde inte läsa bookings" }, 500);
  }
});

// ─────────── POST /bookings ───────────
bookingApp.post("/", bookingValidator, async (c) => {
  try {
    const booking: NewBooking = c.req.valid("json");

    return c.json(booking, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to create booking" }, 400);
  }
});

// ─────────── PUT /bookings/:id ───────────
bookingApp.put("/:id", bookingValidator, async (c) => {
  const id = c.req.param("id");

  try {
    const data = await fs.readFile("src/data/bookings.json", "utf8");
    const bookings: Booking[] = JSON.parse(data);

    const index = bookings.findIndex((b) => b.booking_id === id);

    if (index === -1) {
      return c.json({ error: `Ingen booking med id ${id}` }, 404);
    }

    const body: NewBooking = c.req.valid("json");
    const updatedBooking: Booking = {
      ...body,
      booking_id: id,
      status: body.status ?? "pending"
    };

    bookings[index] = updatedBooking;
    await fs.writeFile("src/data/bookings.json", JSON.stringify(bookings, null, 2));

    return c.json(updatedBooking);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to update booking" }, 400);
  }
});

// ─────────── DELETE /bookings/:id ───────────
bookingApp.delete("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const data = await fs.readFile("src/data/bookings.json", "utf8");
    const bookings: Booking[] = JSON.parse(data);

    const index = bookings.findIndex((b) => b.booking_id === id);

    if (index === -1) {
      return c.json({ error: `Ingen booking med id ${id}` }, 404);
    }

    const removed = bookings.splice(index, 1)[0];
    await fs.writeFile("src/data/bookings.json", JSON.stringify(bookings, null, 2));

    return c.json({ message: "Borttagen", booking: removed });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to delete booking" }, 500);
  }
});

export default bookingApp;