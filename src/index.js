// --- External imports
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const glue = require('schemaglue');

// --- Internal imports
const { startDB, models } = require('./db');
const { generateAllServices } = require('./graphql');
const { version } = require('../package');

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
