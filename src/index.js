// --- External imports
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const glue = require('schemaglue');
const bodyParser = require('body-parser');

// --- Internal imports
const { startDB, models } = require('./db');
const { generateAllServices } = require('./graphql');
const { version } = require('../package');

// --- Maintenance mode
const { startMaintenanceServer } = require('./maintenance');
// -- Backup and restore
const { backup, restore } = require('./backup');

// ---

const main = async () => {
  console.log('MONGODB_HOST', process.env.MONGODB_HOST);

  // --- Database setup

  const db = startDB({
    user: 'graphql',
    pwd: 'yoga123',
    db: 'graphqlYoga',
    url: process.env.MONGODB_HOST || 'localhost:27017'
  });

  // --- HTTP server

  const port = 4000;
  const path = '/graphql';
  const app = express();

  app.use(bodyParser.json({ limit: '500mb' }));
  const maintenancePath = '/maintenance/graphql';

  /**
   * After restoring from backup, all services must be regenerated
   */
  const restoreAndRegenerateAllServices = async backupPath => {
    const restoreResult = await restore(backupPath);
    console.log('Regenerating all services');
    await generateAllServices({ app, models });
    return restoreResult;
  };

  startMaintenanceServer({
    express: app,
    maintenancePath,
    mainPath: path,
    backup,
    restore: restoreAndRegenerateAllServices,
    authOptions: {
      authType: 'SECRET',
      secret: process.env.MAINTENANCE_SECRET
    }
  });

  // --- Schema setup

  // Glue all the schemas and resolvers together
  const options = {
    js: '**/*.js' // default
    // ignore: '**/somefileyoudonotwant.js'
  };
  const { schema: typeDefs, resolver: resolvers } = glue('src/graphql', options);

  // --- GraphQL server

  // Call context: every resolver receives this
  const context = {
    app,
    db,
    models
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context
  });
  server.applyMiddleware({ path, app });

  // All lambda services
  await generateAllServices({ app, models });

  // --- HTTP listen

  app.listen({ port }, () => {
    console.log(`\n\n\n🦄  maana-q-lambda-server v${version} @ http://localhost:${port}${path}\n\n`);
  });
};

main();
