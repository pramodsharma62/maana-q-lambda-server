const vm = require('vm'); // https://nodejs.org/api/vm.html

const execJs = (input, fn) => {
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

module.exports = {
  execJs
};

// // The GraphQL schema
// const typeDefs2 = gql`
//   type Query {
//     "A simple type for getting started!"
//     hello: String
//   }
// `;

// // A map of functions which return data for the schema.
// const resolvers2 = {
//   Query: {
//     hello: () => 'world'
//   }
// };

// const server2 = new ApolloServer({
//   typeDefs: typeDefs2,
//   resolvers: resolvers2,
//   context
// });
// server2.applyMiddleware({ path: `/${name}/graphql`, app });
