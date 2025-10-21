import { FastifyInstance } from "fastify";
import { z, ZodError } from "zod";

import crypto from "crypto";
import { database } from "../database/config";
import { validateParams } from "../middlewares/validate-params";

interface IParams {
  id: string;
}

export default async function HomeworkRouter(server: FastifyInstance) {
  server.get("/", async (req, res) => {
    const homeworks = await database("homework").select("*");
    return homeworks;
  });

  server.get("/:id", { preHandler: [validateParams] }, async (req, res) => {
    try {
      const params = req.params as IParams;
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

  server.put("/:id", { preHandler: [validateParams] }, async (req, res) => {
    const params = req.params as IParams;

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
      .where("id", params.id)
      .update({
        ...data,
      });

    return res.status(204).send();
  });

  server.post("/:id", { preHandler: [validateParams] }, async (req, reply) => {
    const params = req.params as IParams;
    const payloadSchema = z.object({
      student_id: z.uuid("Payload is invalid! student_id is not valid!").min(5),
    });

    const { success, data, error } = payloadSchema.safeParse(req.body);

    if (!success) {
      return reply
        .status(400)
        .send({ errors: error.issues.map((errors) => errors.message) });
    }

    await database("student_homework").insert({
      id: crypto.randomUUID(),
      student_id: data.student_id,
      homework_id: params.id
    })

    return reply.status(201).send()
  })

  server.get("/students", async (req, reply) => {
    const rows = await database("student_homework").select("*")

    return reply.status(201).send(rows)
  })
}
