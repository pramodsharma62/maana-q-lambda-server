// --- External imports
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const glue = require('schemaglue');

// --- Internal imports
const { startDB, models } = require('./db');

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
const app = express();

// --- Schema setup

// Glue all the schemas and resolvers together
const options = {
  js: '**/*.js' // default
  // ignore: '**/somefileyoudonotwant.js'
};
const { schema: typeDefs, resolver: resolvers } = glue('src/graphql', options);

const addEndpoint = name => {
  // The GraphQL schema
  const typeDefs2 = gql`
    type Query {
      "A simple type for getting started!"
      hello: String
    }
  `;

  // A map of functions which return data for the schema.
  const resolvers2 = {
    Query: {
      hello: () => 'world'
    }
  };

  const server2 = new ApolloServer({
    typeDefs: typeDefs2,
    resolvers: resolvers2,
    context
  });
  server2.applyMiddleware({ path: `/${name}/graphql`, app });
};

// --- Call context: every resolver receives this
const context = {
  models, // all of the persistence models
  db, // the database itself
  resolvers, // all of the other resolvers
  addEndpoint
};

// --- GraphQL Server
const server = new ApolloServer({ typeDefs, resolvers, context });
server.applyMiddleware({ path: '/graphql', app });

// ---

app.listen({ port }, () => {
  console.log(`🦄  maana-q-function-assist-logic @ http://localhost:${port}${server.graphqlPath}`);
});
