// --- External imports
const { ApolloServer } = require('apollo-server-express');
const graphql = require('graphql'); // CommonJS
const { GraphQLDate, GraphQLTime, GraphQLDateTime } = require('graphql-iso-date');
const { GraphQLJSON } = require('graphql-type-json');

// --- Internal imports
const { generateResolver } = require('../runtime');
const { version } = require('../../package');

// --- Constants

const Modifiers = {
  NONULL: 'NONULL',
  LIST: 'LIST'
};

const GraphQLOperationTypes = {
  QUERY: 'QUERY',
  MUTATION: 'MUTATION'
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
  time: GraphQLTime,
  json: GraphQLJSON
};

// --- Functions

const mkPath = ({ id }) => `/${id}/graphql`;
const escapePath = ({ path }) => path.replace(/\//g, '\\/');

// ---

const generateBaseGraphQLType = ({ cache, name, isInput, lambda }) => {
  let baseType = ScalarTypes[name.toLowerCase()];
  if (!baseType) {
    const matchingKinds = lambda.kinds.filter(kind => kind.name === name);
    if (!matchingKinds || !matchingKinds.length) {
      throw new Error(`Missing kind definition: ${name}`);
    }
    const kind = matchingKinds[0];

    const thunk = () => {
      const fields = {};
      kind.fields.forEach(field => {
        fields[field.name] = {
          type: getGraphQLType({ cache, name: field.kind, modifiers: field.modifiers, isInput, lambda })
        };
      });
      return fields;
    };
    const config = {
      name,
      fields: thunk
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

const generateGraphQLType = ({ cache, name, modifiers, isInput, lambda }) => {
  const baseType = generateBaseGraphQLType({ cache, name, isInput, lambda });
  return generateModifiedGraphQLType({ baseType, modifiers });
};

// ---

const getGraphQLType = ({ cache, name, modifiers, isInput, lambda }) => {
  const key = `${name}:${isInput.toString()}`;
  let baseType = cache[key];
  if (!baseType) {
    baseType = generateBaseGraphQLType({ cache, name, isInput, lambda });
    cache[key] = baseType;
  }
  return generateModifiedGraphQLType({ baseType, modifiers });
};

// ---

const infoQuery = () => ({
  type: graphql.GraphQLString,
  args: {},
  resolve: async () => `Maana Q Lambda Server v${version}`
});

// ---

const generateSchema = ({ lambdas }) => {
  const queries = { info: infoQuery() };
  const mutations = {};

  const cache = {};

  lambdas
    .sort((a, b) => (a._id.getTimestamp() > b._id.getTimestamp() ? -1 : 1)) // QP-835
    .forEach(lambda => {
      // QP-835 (part 2)
      // In the event of a deleted function that we didn't find out about and
      // a new function is created with the same name, we want to take the latest
      // version.  We'll get this for by using the first one we see, since this
      // list is sorted for QP-835 (part 1).  So, all we do is check that we aren't
      // overwriting a function (query or mutation) with the same name.
      const collection = lambda.graphQLOperationType === GraphQLOperationTypes.MUTATION ? mutations : queries;
      if (collection[lambda.name]) return;
      const args = {};
      lambda.input.forEach(arg => {
        args[arg.name] = {
          type: getGraphQLType({ cache, name: arg.kind, modifiers: arg.modifiers, isInput: true, lambda })
        };
      });
      const op = {
        type: getGraphQLType({
          cache,
          name: lambda.outputKind,
          modifiers: lambda.outputModifiers,
          isInput: false,
          lambda
        }),
        args,
        resolve: generateResolver({ lambda })
      };
      collection[lambda.name] = op;
    });

  const query = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: queries
  });
  const schemaInput = { query };
  if (Object.keys(mutations).length) {
    const mutation = new graphql.GraphQLObjectType({
      name: 'Mutation',
      fields: mutations
    });
    schemaInput.mutation = mutation;
  }
  const schema = new graphql.GraphQLSchema(schemaInput);
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
function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const generateAllServices = async ({ app, models }) => {
  // There's some caching either on mongodb or mongoose that returns emtpy result
  // from find() for some time. I belive this is in mongoose as restarting service
  // immediately returns all the data, but with restart time of few milliseconds
  // it still gets into 100-200 ms threshold.
  // Waiting for 100ms generally solves the issue, increasing this to 2.5 seconds just in case
  await sleep(2500);
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

  return Promise.all(
    Object.values(serviceLambdas).map(async lambdas => {
      try {
        await generateService({ lambdas, app });
      } catch (ex) {
        console.log('generateService failed', ex, lambdas);
        console.log('cleaning up service...');
        await models.Lambda.deleteMany({ serviceId: lambdas[0].serviceId });
      }
    })
  );
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
    context,
    extensions: [
      () => ({
        willSendResponse(o) {
          const { context, graphqlResponse } = o;
          graphqlResponse.extensions = context.log;
          return o;
        }
      })
    ]
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
