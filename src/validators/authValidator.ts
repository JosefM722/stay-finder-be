import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

const authSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const authValidator = zValidator("json", authSchema, (result, c) => {
  if (!result.success) {
    return c.json(
      {
        errors: result.error.issues
      },
      400
    );
  }
});

export default authValidator;