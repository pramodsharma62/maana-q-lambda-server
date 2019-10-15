// --- External imports
const vm = require('vm'); // https://nodejs.org/api/vm.html

// --- Internal imports

// --- Constants

// --- Functions

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

// --- Exports

module.exports = {
  execJs
};
