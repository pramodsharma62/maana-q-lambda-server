// --- External imports
const { ApolloServer } = require('apollo-server-express');
const graphql = require('graphql'); // CommonJS
const { GraphQLDate, GraphQLTime, GraphQLDateTime } = require('graphql-iso-date');

// --- Internal imports
const { generateResolver } = require('../runtime');

// --- Constants

const Modifiers = {
  NONULL: 'NONULL',
  LIST: 'LIST'
};

const ScalarTypes = {
  boolean: graphql.GraphQLBoolean,
  float: graphql.GraphQLFloat,
  int: graphql.GraphQLInt,
  id: graphql.GraphQLID,
  string: graphql.GraphQLString,
  // ---
  date: GraphQLDate,
  datetime: GraphQLDateTime,
  time: GraphQLTime
};

// --- Functions

const generateType = ({ name, modifiers, isInput, lambda }) => {
  let baseType = ScalarTypes[name.toLowerCase()];
  if (!baseType) {
    const matchingKinds = lambda.kinds.filter(kind => kind.name === name);
    if (!matchingKinds || !matchingKinds.length) {
      throw new Error(`Missing kind definition: ${name}`);
    }
    const kind = matchingKinds[0];

    const fields = {};
    kind.fields.forEach(field => {
      fields[field.name] = {
        type: generateType({ name: field.kind, modifiers: field.modifiers, isInput: false, lambda })
      };
    });
    const config = {
      name,
      fields
    };
    baseType = isInput ? new graphql.GraphQLInputObjectType(config) : graphql.GraphQLObjectType(config);
  }

  // Deal with Q's odd type modifiers
  // - list is either [Foo] or [Foo!]!
  let isRequired = false;
  let isList = false;
  modifiers.forEach(modifier => {
    if (modifier === Modifiers.NONULL) {
      isRequired = true;
    } else if (modifier === Modifiers.LIST) {
      isList = true;
    }
  });

  let modifiedType = baseType;
  if (isList) {
    if (isRequired) {
      modifiedType = graphql.GraphQLNonNull(graphql.GraphQLList(graphql.GraphQLNonNull(baseType)));
    } else {
      modifiedType = graphql.GraphQLList(baseType);
    }
  } else if (isRequired) {
    modifiedType = graphql.GraphQLNonNull(baseType);
  }

  return modifiedType;
};

const generateSchema = ({ lambdas }) => {
  const queries = {};

  lambdas.forEach(lambda => {
    const args = {};
    lambda.input.forEach(arg => {
      args[arg.name] = { type: generateType({ name: arg.kind, modifiers: arg.modifiers, isInput: true, lambda }) };
    });
    queries[lambda.name] = {
      type: generateType({ name: lambda.outputKind, modifiers: lambda.outputModifiers, isInput: false, lambda }),
      args,
      resolve: generateResolver({ lambda })
    };
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
  if (!lambdas || !lambdas.length) return;

  const serviceId = lambdas[0].serviceId;
  const schema = generateSchema({ lambdas });
  const context = {}; // every resolver receives this

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
