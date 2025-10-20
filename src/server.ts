import Fastify from "fastify";
import StudentsRouter from "./router/students.routes";

import HomeworkRouter from "./router/homework.routes";
import { env } from "./env";

const server = Fastify();

server.register(StudentsRouter, {
  prefix: "students",
});

server.register(HomeworkRouter, {
  prefix: "homeworks",
});

server
  .listen({ port: Number(env.NODE_PORT), host: env.NODE_HOST })
  .then(() =>
    console.log(`Server listening at http://${env.NODE_HOST}:${env.NODE_PORT}`)
  );
