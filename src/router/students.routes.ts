import { FastifyInstance } from "fastify";
import { z, ZodError } from "zod";

import crypto from "crypto";
import { database } from "../database/config";

const paramsSchema = z.object({
  id: z.uuid("id is incorrect or not found!").min(5),
});

async function findStudentByEmail(email: string) {
  const userEmail = await database("students")
    .select("email")
    .where("email", "=", email);

  return userEmail && userEmail.length ? (userEmail[0].email as string) : null;
}

export default async function Router(server: FastifyInstance) {
  server.get("/", async (req, res) => {
    const students = await database("students").select("*");
    return students;
  });

  server.get("/:id", async (req, res) => {
    try {
      const params = paramsSchema.parse(req.params);
      const student = await database("students")
        .select("*")
        .where("id", params.id);

      return res.status(200).send(student);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(404)
          .send({ errors: error.issues.map((e) => e.message) });
      }
    }
  });

  server.post("/", async (req, res) => {
    const payloadSchema = z.object({
      name: z.string("Missing payload name").min(5),
      email: z
        .email("Missing payload email")
        .min(5)
        .refine(
          async (value) => !(value === (await findStudentByEmail(value))),
          "Email is already exists in database!"
        ),
    });

    const { success, data, error } = await payloadSchema.safeParseAsync(
      req.body
    );

    if (!success) {
      return res
        .status(400)
        .send({ errors: error.issues.map((errors) => errors.message) });
    }

    await database("students").insert({
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
    });

    return res.status(201).send();
  });

  server.put("/:id", async (req, res) => {
    const params = paramsSchema.safeParse(req.params);

    if (!params.success) {
      return res
        .status(400)
        .send({ errors: params.error.issues.map((errors) => errors.message) });
    }

    const payloadSchema = z.object({
      name: z.string("Missing payload name").min(5).optional(),
      email: z
        .email("Missing payload email")
        .min(5)
        .refine(
          async (value) => !(value === (await findStudentByEmail(value))),
          "Email is already exists in database!"
        )
        .optional(),
    });

    const { success, data, error } = await payloadSchema.safeParseAsync(
      req.body
    );

    if (!success) {
      return res
        .status(400)
        .send({ errors: error.issues.map((errors) => errors.message) });
    }

    await database("students")
      .where("id", params.data.id)
      .update({
        ...data,
      });

    return res.status(204).send();
  });
}
