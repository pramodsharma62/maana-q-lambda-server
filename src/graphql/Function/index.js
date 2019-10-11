// https://nodejs.org/api/vm.html

const vm = require('vm');

const exec = (input, fn) => {
  try {
    const sandbox = { input, output: null };
    vm.createContext(sandbox);
    vm.runInContext(fn.code, sandbox);
    console.log(`sandbox:${fn.name}`, sandbox);
    return sandbox.output;
  } catch (ex) {
    console.log('Ex', ex);
    throw ex;
  }
};

// --- GraphQL resolvers

const resolver = {
  Query: {
    age: async (_, args, { models }) => {
      const fn = await models.Function.findOne({ id: '0' });
      return exec(args, fn);
    },
    list: async (_, args, { models }) => {
      const x = await models.Function.find();
      console.log('list', x);
      return x;
    }
  },
  Mutation: {
    create: async (_, { input }, { models }) => {
      const x = await models.Function.create(input);
      console.log('create', x);
      return input;
    },
    delete: async (_, { id }, { models }) => {
      const x = await models.Function.findOneAndDelete({ id });
      console.log('delete', x);
      return id;
    }
  }
};

exports.resolver = resolver;
