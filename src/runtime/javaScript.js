// --- External imports
const vm = require('vm'); // https://nodejs.org/api/vm.html

// --- Internal imports

// --- Constants

// --- Functions

const execJs = ({ input, lambda }) => {
  try {
    // console.log('execJs', input, lambda);
    const sandbox = { input, output: null };
    vm.createContext(sandbox);
    vm.runInContext(lambda.code, sandbox);
    // console.log(`sandbox:${lambda.name}`, sandbox);
    return sandbox.output;
  } catch (ex) {
    console.log('execJs', ex);
    throw ex;
  }
};

// --- Exports

module.exports = {
  execJs
};
