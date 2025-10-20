import { FastifyInstance } from "fastify";
import { z, ZodError } from "zod";

import crypto from "crypto";
import { database } from "../database/config";

const paramsSchema = z.object({
  id: z.uuid("id is incorrect or not found!").min(5),
});

async function findStudentByEmail(email: string) {
  const userEmail = await database("homework")
    .select("email")
    .where("email", "=", email);

  return userEmail && userEmail.length ? (userEmail[0].email as string) : null;
}

export default async function HomeworkRouter(server: FastifyInstance) {
  server.get("/", async (req, res) => {
    const homeworks = await database("homework").select("*");
    return homeworks;
  });

  server.get("/:id", async (req, res) => {
    try {
      const params = paramsSchema.parse(req.params);
      const student = await database("homework")
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
      title: z.string("Missing payload title").min(5),
      description: z.string("Missing payload email").min(5)
    });

    const { success, data, error } = await payloadSchema.safeParseAsync(
      req.body
    );

    if (!success) {
      return res
        .status(400)
        .send({ errors: error.issues.map((errors) => errors.message) });
    }

    await database("homework").insert({
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
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
      title: z.string("Missing payload title").min(5).optional(),
      description: z.string("Missing payload description").min(5).optional()
    });

    const { success, data, error } = await payloadSchema.safeParseAsync(
      req.body
    );

    if (!success) {
      return res
        .status(400)
        .send({ errors: error.issues.map((errors) => errors.message) });
    }

    await database("homework")
      .where("id", params.data.id)
      .update({
        ...data,
      });

    return res.status(204).send();
  });
}
