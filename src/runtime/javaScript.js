// --- External imports
const { NodeVM } = require('vm2');

// --- Internal imports

// --- Constants

// --- Functions

const execJs = async ({ input, lambda }) => {
  try {
    const sandbox = { input, output: null };
    const vm = new NodeVM({
      sandbox,
      console: 'inherit',
      require: {
        external: true,
        builtin: ['*']
      },
      wrapper: 'none'
    });
    return vm.run(lambda.code, __filename);
  } catch (ex) {
    console.log('execJs', ex);
    throw ex;
  }
};

// --- Exports

module.exports = {
  execJs
};
