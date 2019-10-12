const mongoose = require('mongoose');

// --- Schema

const Lambda = require('./Lambda');

const models = {
  Lambda
};

// --- Mongoose client

// Setup Mongoose Promises.
mongoose.Promise = global.Promise;

const startDB = args => {
  const { user, pwd, url, db } = args;
  mongoose.connect(
    `mongodb://${user}:${pwd}@${url}/${db}`,
    {
      useNewUrlParser: true
    },
    error => {
      if (error) {
        console.log('MongoDB error', error);
        setTimeout(() => startDB(args), 3000);
      }
    }
  );
};

module.exports = {
  models,
  startDB
};
