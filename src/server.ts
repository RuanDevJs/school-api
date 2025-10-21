import Fastify from "fastify";
import StudentsRouter from "./router/students.routes";

import HomeworkRouter from "./router/homework.routes";
import { env } from "./env";

import multipart from "@fastify/multipart"

const server = Fastify();

server.register(multipart);

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
