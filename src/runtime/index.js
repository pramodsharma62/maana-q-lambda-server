// --- External imports

// --- Internal imports
const { Hosts, Languages, SupportedRuntimes, ExecutorMap } = require('./enums');
const runCode = require('./runCode');
const runJavaScript = require('./runJavaScript');

// --- Functions

const generateQResolver = ({ lambda }) => {
  if (lambda.runtime.language === Languages.JavaScript) {
    return async (_, input, context) => runJavaScript({ input, lambda, context });
  } else if (ExecutorMap[lambda.runtime.language]) {
    return async (_, input, context) => runCode({ input, lambda, context });
  } else {
    throw new Error(`Language not supported: ${lambda.runtime.language}`);
  }
};

const generateResolver = ({ lambda }) => {
  switch (lambda.runtime.host) {
    case Hosts.Q:
      return generateQResolver({ lambda });
    case Hosts.AWS:
    case Hosts.Google:
      throw new Error(`Host not yet implemented: ${lambda.runtime.host}`);
    default:
      throw new Error(`Host not supported: ${lambda.runtime.host}`);
  }
};

// --- Exports

module.exports = {
  generateResolver,
  SupportedRuntimes
};
