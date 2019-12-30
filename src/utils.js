const logLambda = (lambda, ...args) => {
  console.log(`[${lambda.id}:${lambda.name}]`, args);
};

module.exports = {
  logLambda
};
