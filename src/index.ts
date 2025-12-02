import { connectToMongoose } from './initializers/connectToMongoose';
import { server } from './server';

connectToMongoose('mongodb://root:admin@localhost:3031/')
  .then(() => {
    server.log.info('Mongo was connected');

    return server.listen({
      port: 3032,
      host: '0.0.0.0',
    });
  })
  .then((url) => {
    server.log.info(`${url}/documentation`);
  });
