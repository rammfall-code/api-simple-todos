import fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';

const server = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
}).withTypeProvider<TypeBoxTypeProvider>();

await server.register(fastifyCors);
await server.register(fastifyCookie);
await server.register(fastifySwagger);
await server.register(fastifySwaggerUi);
await server.register(fastifyStatic, {
  root: `${process.cwd()}/public`,
});
await server.register(fastifyMultipart, {
  attachFieldsToBody: 'keyValues',
});

server
  .listen({
    port: 4043,
  })
  .then(() => {
    server.log.info('Started');
  });
