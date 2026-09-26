import { Hono } from "hono";
import { promises as fs } from "fs";
import type { Property } from "../property.js";

const propertyApp = new Hono();

// GET /properties
propertyApp.get("/", async (c) => {
  try {
    const data = await fs.readFile("src/data/properties.json", "utf8");
    const properties: Property[] = JSON.parse(data);
    return c.json(properties);
  } catch (error) {
    return c.json([]);
  }
});

// GET /properties/:id
propertyApp.get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const data = await fs.readFile("src/data/properties.json", "utf8");
    const properties: Property[] = JSON.parse(data);
    const property = properties.find((p) => p.property_id === id);

    if (!property) {
      return c.json({ error: `Ingen property med id ${id}` }, 404);
    }

    return c.json(property);
  } catch (error) {
    return c.json({ error: "Kunde inte läsa properties" }, 500);
  }
});

export default propertyApp;