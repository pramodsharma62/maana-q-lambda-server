// --- External imports
const { ApolloServer } = require('apollo-server-express');

// --- Internal imports

// --- Constants

// --- Functions

// https://graphql.org/graphql-js/constructing-types/

const generateTypeDefs = async ({ serviceId, models }) => {
  const lambdas = await models.Lambda.find({ serviceId });
  console.log('generateTypeDefs: ', lambdas);

  const kinds = {};
  const resolvers = {};
  const query = {};
  lambdas.forEach(lambda => {
    const resolver = generateResolver({ lambda });
    lambda.kinds.forEach(kind => {
      kinds[kind.name] = kind;
    });
  });
  console.log('kinds', kinds);

  const types = {};
};

// ---

const generateService = async ({ lambdas, app }) => {
  if (!lambdas || !lambdas.serviceLambdas) return;

  // // Call context: every resolver receives this
  // const context = {
  //   models, // all of the persistence models
  //   db // the database itself
  // };
  // const typeDefs = generateTypeDefs({ serviceId: lambda.serviceId, models });
  // const resolvers = lambdas.map(lambda => generateResolver({ lambda }));
  // generateEndpoint({ typeDefs, resolvers, path: `${lambda.serviceId}/graphql`, app });
  console.log('generateServices: ', lambdas);
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
  console.log(app._router.stack);
};

// ---

const generateEndpoint = ({ typeDefs, resolvers, context, path, app }) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context
  });
  server.applyMiddleware({ path, app });
};

// --- Exports

module.exports = {
  generateEndpoint,
  generateTypeDefs,
  generateService,
  generateAllServices,
  removeService
};
