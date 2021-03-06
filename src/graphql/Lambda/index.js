// --- External imports

// --- Internal imports
const { SupportedRuntimes } = require('../../runtime/enums');
const { generateService, removeService } = require('../');

// --- Implementation

const resolveRuntime = ({ id }) => {
  const matchingRuntimes = SupportedRuntimes.filter(x => x.id === id);
  if (!matchingRuntimes || !matchingRuntimes.length) {
    throw new Error(`Invalid runtime ${id}`);
  }
  return matchingRuntimes[0];
};

const regenerateService = async ({ id, app, models }) => {
  const lambdas = await models.Lambda.find({ serviceId: id });
  if (!lambdas || !lambdas.length) {
    removeService({ id, app });
    return;
  }
  await generateService({ lambdas, app });
};

const getLambda = async ({ id, models }) => models.Lambda.findOne({ id });

const listLambdas = async ({ serviceId, models }) => models.Lambda.find({ serviceId });

const createLambda = async ({ input, app, models }) => {
  await deleteLambdaOnly({ id: input.id, models });

  // patch to include runtime
  const runtime = resolveRuntime({ id: input.runtimeId });

  const lambda = await models.Lambda.create({ graphQLOperationType: 'QUERY', ...input, runtime });

  // (re)generate the full service
  await regenerateService({ id: lambda.serviceId, app, models });

  return lambda;
};

const deleteLambdaOnly = async ({ id, models }) => models.Lambda.deleteOne({ id });

const deleteLambda = async ({ id, app, models }) => {
  // Get the existing lambda (if any), since we need the service ID
  const lambda = await getLambda({ id, models });
  if (!lambda) {
    throw new Error(`Invalid lambda: ${id}`);
  }

  const x = await deleteLambdaOnly({ id, models });

  // (re)generate the full service
  await regenerateService({ id: lambda.serviceId, app, models });

  return x.deletedCount;
};

const deleteService = async ({ id, app, models }) => {
  const x = await models.Lambda.deleteMany({ serviceId: id });

  removeService({ id, app });

  return x.deletedCount;
};

// --- GraphQL resolvers

const resolver = {
  Query: {
    getLambda: async (_, { id }, { models }) => getLambda({ id, models }),
    listLambdas: async (_, { serviceId }, { models }) => listLambdas({ serviceId, models }),
    listServices: async (_, args, { models }) => models.Lambda.distinct('serviceId'),
    listRuntimes: async () => SupportedRuntimes
  },
  Mutation: {
    createLambda: async (_, { input }, { app, models }) => createLambda({ input, app, models }),
    deleteLambda: async (_, { id }, { app, models }) => deleteLambda({ id, app, models }),
    deleteService: async (_, { id }, { app, models }) => deleteService({ id, app, models })
  }
};

// --- Exports

module.exports = {
  resolver
};
