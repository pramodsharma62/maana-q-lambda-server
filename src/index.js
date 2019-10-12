// --- External imports
const express = require('express');
const glue = require('schemaglue');

// --- Internal imports
const { startDB, models } = require('./db');
const { generateEndpoint } = require('./graphql/server');

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

// --- Call context: every resolver receives this
const context = {
  models, // all of the persistence models
  db // the database itself
};

// --- GraphQL Server for the service itself
generateEndpoint({ typeDefs, resolvers, context, path, app });

// ---

app.listen({ port }, () => {
  console.log(`🦄  maana-q-lambda-server @ http://localhost:${port}${path}`);
});
