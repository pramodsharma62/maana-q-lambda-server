/**
 * Based on provided auth options, produces function that will terminate execution (throw error)
 * if provided token is invalid according to these options
 */
const tokenValidator = authOptions => {
  if (!authOptions) {
    throw new Error('Authentication settings are not provided');
  } else {
    switch (authOptions.authType) {
      case 'SECRET':
        if (!authOptions.secret) {
          console.error('Maintenance secret is not provided');
          process.exit(1);
        }
        return token => {
          if (token !== authOptions.secret) {
            throw new Error('Token is invalid');
          }
        };
      default:
        throw new Error('Authentication settings are invalid or incomplete');
    }
  }
};

module.exports = {
  tokenValidator
};
