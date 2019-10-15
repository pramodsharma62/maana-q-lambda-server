// --- External imports
const { ApolloServer } = require('apollo-server-express');
const graphql = require('graphql'); // CommonJS

// --- Internal imports
const { generateResolver } = require('../runtime');

// --- Constants

// --- Functions

const generateSchema = ({ lambdas }) => {
  const types = {};
  const inputs = {};
  const queries = {};

  // Define the User type
  var userType = new graphql.GraphQLObjectType({
    name: 'User',
    fields: {
      id: { type: graphql.GraphQLString },
      name: { type: graphql.GraphQLString }
    }
  });

  lambdas.forEach(lambda => {
    queries[lambda.name] = {
      type: userType,
      args: {
        id: { type: graphql.GraphQLString }
      },
      resolve: generateResolver({ lambda })
    };

    // user: {
    //   type: userType,
    //   // `args` describes the arguments that the `user` query accepts
    //   args: {
    //     id: { type: graphql.GraphQLString }
    //   },
    //   resolve: function(_, { id }) {
    //     return fakeDatabase[id];
    //   }
  });

  // Define the Query type
  var queryType = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: queries
  });
  const schema = new graphql.GraphQLSchema({ query: queryType });
  return schema;
};

const generateService = async ({ lambdas, app }) => {
  console.log('generateServices: ', lambdas);

  if (!lambdas || !lambdas.length) return;

  const serviceId = lambdas[0].serviceId;
  const schema = generateSchema({ lambdas });
  console.log('schema', schema);
  // Call context: every resolver receives this
  const context = {
    //   models, // all of the persistence models
    //   db // the database itself
  };
  generateEndpoint({ schema, context, path: `/${serviceId}/graphql`, app });
};

// ---

const generateAllServices = async ({ app, models }) => {
  // Get all of the lambdas and group them by service
  const allLambdas = await models.Lambda.find();
  const serviceLambdas = {};
  allLambdas.forEach(lambda => {
    let lambdas = serviceLambdas[lambda.serviceId];
    if (!lambdas) {
      lambdas = [];
      serviceLambdas[lambda.serviceId] = lambdas;
    }
    lambdas.push(lambda);
  });
  console.log('serviceLambdas', JSON.stringify(serviceLambdas, null, 2));

  return Promise.all(Object.values(serviceLambdas).map(async lambdas => generateService({ lambdas, app })));
};

const removeService = ({ id, app }) => {
  console.log('removeService', id);
  // console.log(app._router.stack);
};

// ---

const generateEndpoint = ({ schema, context, path, app }) => {
  const server = new ApolloServer({
    schema,
    context
  });
  server.applyMiddleware({ path, app });
};

// --- Exports

module.exports = {
  generateEndpoint,
  generateService,
  generateAllServices,
  removeService
};
