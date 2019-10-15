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

const mkPath = ({ id }) => `/${id}/graphql`;
const escapePath = ({ path }) => path.replace(/\//g, '\\/');

// ---

const generateBaseGraphQLType = ({ name, isInput, lambda }) => {
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
        type: generateGraphQLType({ name: field.kind, modifiers: field.modifiers, isInput: false, lambda })
      };
    });
    const config = {
      name,
      fields
    };
    baseType = isInput ? new graphql.GraphQLInputObjectType(config) : new graphql.GraphQLObjectType(config);
  }
  return baseType;
};

const generateModifiedGraphQLType = ({ baseType, modifiers }) => {
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

const generateGraphQLType = ({ name, modifiers, isInput, lambda }) => {
  const baseType = generateBaseGraphQLType({ name, isInput, lambda });
  return generateModifiedGraphQLType({ baseType, modifiers });
};

// ---

const generateSchema = ({ lambdas }) => {
  const queries = {};

  const typeCache = {};
  const getGraphQLType = ({ name, modifiers, isInput, lambda }) => {
    let baseType = typeCache[name];
    if (!baseType) {
      baseType = generateBaseGraphQLType({ name, isInput, lambda });
      typeCache[name] = baseType;
    }
    return generateModifiedGraphQLType({ baseType, modifiers });
  };

  lambdas.forEach(lambda => {
    const args = {};
    lambda.input.forEach(arg => {
      args[arg.name] = {
        type: getGraphQLType({ name: arg.kind, modifiers: arg.modifiers, isInput: true, lambda })
      };
    });
    queries[lambda.name] = {
      type: getGraphQLType({ name: lambda.outputKind, modifiers: lambda.outputModifiers, isInput: false, lambda }),
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

// ---

const generateService = async ({ lambdas, app }) => {
  if (!lambdas || !lambdas.length) return;

  const serviceId = lambdas[0].serviceId;

  const schema = generateSchema({ lambdas });
  const context = {}; // every resolver receives this

  removeService({ id: serviceId, app });
  generateEndpoint({ schema, context, path: mkPath({ id: serviceId }), app });
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

// ---

const removeService = ({ id, app }) => {
  const path = mkPath({ id });
  const escapedPath = escapePath({ path });

  const stack = app._router.stack;
  let targetLayerIndex = -1;
  stack.forEach((layer, index) => {
    if (layer.name === 'router') {
      const substack = layer.handle.stack;
      if (
        substack.some(x => {
          const regexp = x.regexp.toString();
          const match = regexp.includes(escapedPath);
          return match;
        })
      ) {
        targetLayerIndex = index;
      }
    }
  });
  if (targetLayerIndex === -1) return;
  stack.splice(targetLayerIndex, 1);
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
  generateAllServices,
  generateEndpoint,
  generateSchema,
  generateGraphQLType,
  generateService,
  removeService
};
