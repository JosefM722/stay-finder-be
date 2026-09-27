import { Hono } from "hono";
import { promises as fs } from "fs";
import type { Property } from "../types/property.js";
import propertyValidator from "../validators/propertyValidator.js";
import propertyParamValidator from "../validators/propertyParamValidator.js";

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
    const property = properties.find((p) => p.id === id);

    if (!property) {
      return c.json({ error: "Property not found" }, 404);
    }

    return c.json(property);
  } catch (error) {
    return c.json({ error: "Kunde inte läsa properties" }, 500);
  }
});

// POST /properties
propertyApp.post("/", propertyValidator, async (c) => {
  try {
    const body = c.req.valid("json");

    const newProperty: Property = {
      id: `property_${Math.floor(1000 + Math.random() * 9000)}`,
      ...body
    };

    const data = await fs.readFile("src/data/properties.json", "utf8");
    const properties: Property[] = JSON.parse(data);
    properties.push(newProperty);

    await fs.writeFile("src/data/properties.json", JSON.stringify(properties, null, 2));

    return c.json(newProperty, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to create property" }, 400);
  }
});

// PUT /properties/:id
propertyApp.put(
  "/:id",
  propertyParamValidator,
  propertyValidator,
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");

      const data = await fs.readFile("src/data/properties.json", "utf8");
      const properties: Property[] = JSON.parse(data);

      const index = properties.findIndex((p) => p.id === id);

      if (index === -1) {
        return c.json({ error: "Property not found" }, 404);
      }

      const updatedProperty: Property = {
        id,
        ...body
      };

      properties[index] = updatedProperty;
      await fs.writeFile("src/data/properties.json", JSON.stringify(properties, null, 2));

      return c.json(updatedProperty);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to update property" }, 400);
    }
  }
);

// DELETE /properties/:id
propertyApp.delete("/:id", propertyParamValidator, async (c) => {
  try {
    const { id } = c.req.valid("param");

    const data = await fs.readFile("src/data/properties.json", "utf8");
    const properties: Property[] = JSON.parse(data);

    const index = properties.findIndex((p) => p.id === id);

    if (index === -1) {
      return c.json({ error: "Property not found" }, 404);
    }

    properties.splice(index, 1);
    await fs.writeFile("src/data/properties.json", JSON.stringify(properties, null, 2));

    return c.json({ message: "Property deleted" });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to delete property" }, 500);
  }
});

export default propertyApp;