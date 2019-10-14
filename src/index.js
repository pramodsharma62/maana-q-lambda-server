// --- External imports
const express = require('express');
const glue = require('schemaglue');

// --- Internal imports
const { startDB, models } = require('./db');
const { generateEndpoint, generateAllServices } = require('./graphql');

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

  // Base Lambda (admin) service
  generateEndpoint({ typeDefs, resolvers, context, path, app });

  // All lambda services
  await generateAllServices({ app, models });

  // --- HTTP listen

  app.listen({ port }, () => {
    console.log(`🦄  maana-q-lambda-server @ http://localhost:${port}${path}`);
  });
};

main();
