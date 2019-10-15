// --- External imports

// --- Internal imports
const { execJs } = require('./javaScript');

// --- Constants

const Hosts = {
  Q: 'Q',
  Spark: 'Apache Spark',
  AWSLambda: 'AWS Lambda',
  AzureCloudFunction: 'Azure Cloud Function',
  GoogleCloudFunction: 'Google Cloud Function'
};

const Languages = {
  JavaScript: 'JavaScript',
  Python: 'Python',
  Java: 'Java',
  CSharp: 'C#',
  FSharp: 'F#',
  PHP: 'PHP',
  Go: 'Go'
};

const mkRuntimeId = (host, language) => `${host}+${language}`;

const SupportedRuntimes = [
  {
    host: Hosts.Q,
    language: Languages.JavaScript
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
    language: Languages.JavaScript
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
    language: Languages.JavaScript
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
    language: Languages.JavaScript
  },
  {
    host: Hosts.GoogleCloudFunction,
    language: Languages.Python
  },
  {
    host: Hosts.GoogleCloudFunction,
    language: Languages.Go
  }
].map(x => ({ id: mkRuntimeId(x.host, x.language), ...x }));

// --- Functions

const generateResolver = ({ lambda }) => {
  console.log('generateResolver', lambda);
  if (lambda.runtime.id === mkRuntimeId(Hosts.Q, Languages.JavaScript)) {
    return async (_, inputs) => execJs(inputs, lambda.code);
  } else {
    throw new Error(`Runtime not yet implemented: ${lambda.runtimeId}`);
  }
};

// --- Exports

module.exports = {
  generateResolver,
  SupportedRuntimes
};
