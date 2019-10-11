// --- GraphQL resolvers

const resolver = {
  Query: {
    apply: async (_, { id, params }, { models }) => {
      const x = await models.Function.findOne({ id });
      console.log('apply', x);
      return `apply(id:${id}, params: ${params})`;
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
