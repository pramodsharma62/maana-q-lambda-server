const { ApolloServer } = require('apollo-server-express');
// const { execJs } = require('../../sandbox');

// --- Constants

const Hosts = {
  Q: 'Q',
  Spark: 'Apache Spark',
  AWSLambda: 'AWS Lambda',
  AzureCloudFunction: 'Azure Cloud Function',
  GoogleCloudFunction: 'Google Cloud Function'
};

const Languages = {
  JS: 'JavaScript',
  Python: 'Python',
  Java: 'Java',
  CSharp: 'C#',
  FSharp: 'F#',
  PHP: 'PHP',
  Go: 'Go'
};

const supportedRuntimes = [
  {
    host: Hosts.Q,
    language: Languages.JS
  },
  {
    host: Hosts.Q,
    language: Languages.Python
  },
  {
    host: Hosts.Spark,
    language: Languages.Java
  },
  {
    host: Hosts.AWSLambda,
    language: Languages.JS
  },
  {
    host: Hosts.AWSLambda,
    language: Languages.Python
  },
  {
    host: Hosts.AWSLambda,
    language: Languages.Java
  },
  {
    host: Hosts.AzureCloudFunction,
    language: Languages.JS
  },
  {
    host: Hosts.AzureCloudFunction,
    language: Languages.Python
  },
  {
    host: Hosts.AzureCloudFunction,
    language: Languages.Java
  },
  {
    host: Hosts.AzureCloudFunction,
    language: Languages.CSharp
  },
  {
    host: Hosts.AzureCloudFunction,
    language: Languages.FSharp
  },
  {
    host: Hosts.AzureCloudFunction,
    language: Languages.PHP
  },
  {
    host: Hosts.GoogleCloudFunction,
    language: Languages.JS
  },
  {
    host: Hosts.GoogleCloudFunction,
    language: Languages.Python
  },
  {
    host: Hosts.GoogleCloudFunction,
    language: Languages.Go
  }
].map(x => ({ id: `${x.host}+${x.language}`, ...x }));

// age: async (_, args, { models }) => {
//   const fn = await models.Function.findOne({ id: '0' });
//   return execJs(args, fn);
// },

// ---

const generateEndpoint = ({ typeDefs, resolvers, context, path, app }) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context
  });
  server.applyMiddleware({ path, app });
};

module.exports = {
  generateEndpoint,
  supportedRuntimes
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
