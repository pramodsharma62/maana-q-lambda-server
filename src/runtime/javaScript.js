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
    const result = vm.run(lambda.code, __filename);
    const output = await Promise.resolve(result);
    return output;
  } catch (ex) {
    console.log('execJs', ex);
    throw ex;
  }
};

// --- Exports

module.exports = {
  execJs
};
