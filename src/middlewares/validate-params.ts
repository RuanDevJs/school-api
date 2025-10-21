import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function validateParams(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.uuid("id is incorrect or not found!").min(5),
  });

  const params = paramsSchema.safeParse(request.params);

  if (!params.success) {
    return reply
      .status(400)
      .send({ errors: params.error.issues.map((errors) => errors.message) });
  }

}
