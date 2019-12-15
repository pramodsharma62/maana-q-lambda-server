// --- External imports
const { NodeVM } = require('vm2');

// --- Internal imports
const { logLambda } = require('../utils');

// --- Functions

const runJavaScript = async ({ input, lambda, context }) => {
  try {
    const startTime = new Date();
    const sandbox = { input, output: null };
    const vm = new NodeVM({
      sandbox,
      console: 'redirect',
      require: {
        // Allow lambda code to use any installed module
        external: true,
        builtin: ['*']
      },
      wrapper: 'none'
    });

    // Capture console.log() output from within lambda function
    const log = [];
    vm.on('console.log', (...args) => {
      log.push(args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
    });

    const result = vm.run(lambda.code, __filename);

    const endTime = new Date();
    const elapsedTime = (endTime.getTime() - startTime.getTime()) / 1000;
    logLambda(lambda, 'runJavaScript', `took ${elapsedTime} seconds`);

    context.log = log;
    return result;
  } catch (ex) {
    logLambda(lambda, 'runJavaScript', ex);
    throw ex;
  }
};

module.exports = runJavaScript;
