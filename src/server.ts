import Fastify from "fastify";
import Router from "./router";
import { env } from "./env";

const server = Fastify();

server.register(Router, {
  prefix: "students",
});

server
  .listen({ port: Number(env.NODE_PORT), host: env.NODE_HOST })
  .then(() =>
    console.log(`Server listening at http://${env.NODE_HOST}:${env.NODE_PORT}`)
  );
