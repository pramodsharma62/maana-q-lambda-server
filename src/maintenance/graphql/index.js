const fs = require('fs');
const path = require('path');

const { gql, ApolloServer } = require('apollo-server-express');

const schema = fs.readFileSync(path.join(__dirname, 'schema.graphql'));

const typeDefs = gql`${schema}`;

const maintenanceServer = options => {
  const { backup, restore, getMaintenanceStatus, setMaintenanceStatus, getCurrentOperation, authOptions } = options;

  const resolvers = {
    Query: {
      info: async (root, args, context, info) => {
        return {
          maintenanceStatus: getMaintenanceStatus(),
          tokenType: authOptions.authType,
          currentOperation: getCurrentOperation()
        };
      }
    },
    Mutation: {
      maintenance: (root, { maintenanceStatus, token }, context) => setMaintenanceStatus(maintenanceStatus, token),
      backup: (root, { location, token }, context) => backup(location, token),
      restore: (root, { location, token }, context) => restore(location, token)
    }
  };
  return new ApolloServer({ typeDefs, resolvers });
};

module.exports = {
  maintenanceServer
};
