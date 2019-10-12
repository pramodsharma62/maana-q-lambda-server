// Internal
const { generateEndpoint, supportedRuntimes } = require('../server');

// --- Implementation

const createLambda = async ({ input, models }) => {
  // @@TODO: validate inputs
  // lookup runtime
  const runtime = supportedRuntimes.filter(x => x.id === input.runtimeId)[0];

  // clean up previous
  await deleteLambda({ id: input.id, models });

  // create new lambda
  const x = await models.Lambda.create(input);
  console.log('createLambda', x);

  // patch input to include runtime
  const lambda = { ...input, runtime };
  delete lambda.runtimeId;

  generateEndpoint(input.serviceId);
  return lambda;
};

const deleteLambda = async ({ id, models }) => {
  const x = await models.Lambda.deleteOne({ id });
  console.log('deleteLambda', x);
  return x.deletedCount;
};

const deleteService = async ({ id, models }) => {
  const x = await models.Lambda.deleteMany({ serviceId: id });
  console.log('deleteService', x);
  return x.deletedCount;
};

// --- GraphQL resolvers

const resolver = {
  Query: {
    lambda: async (_, { id }, { models }) => {
      const x = await models.Lambda.findOne({ id });
      console.log('lambda', x);
      return x;
    },
    listLambdas: async (_, args, { models }) => {
      const x = await models.Lambda.find(args);
      console.log('listLambdas', x);
      return x;
    },
    listServices: async (_, args, { models }) => {
      const x = await models.Lambda.distinct('serviceId');
      console.log('listServices', x);
      return x;
    },
    listRuntimes: async () => {
      const x = supportedRuntimes;
      console.log('listRuntimes', x);
      return x;
    }
  },
  Mutation: {
    createLambda: async (_, { input }, { models }) => createLambda({ input, models }),
    deleteLambda: async (_, { id }, { models }) => deleteLambda({ id, models }),
    deleteService: async (_, { id }, { models }) => deleteService({ id, models })
  }
};

exports.resolver = resolver;
