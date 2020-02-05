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

  const conn = mongoose.connection;
  conn.on('connecting', function() {
    console.log('connecting to MongoDB...');
  });

  conn.on('error', function(error) {
    console.error('Error in MongoDb connection:', error);
    mongoose.disconnect();
  });

  conn.on('connected', function() {
    console.log('MongoDB connected!');
  });

  conn.once('open', function() {
    console.log('MongoDB connection opened!');
  });

  conn.on('reconnected', function() {
    console.log('MongoDB reconnected!');
  });

  conn.on('disconnected', function() {
    console.log('MongoDB disconnected!');
    setTimeout(() => startDB(args), 3000);
  });

  const connStr = `mongodb://${user}:${pwd}@${url}/${db}`;
  console.log('Connect to', connStr);
  mongoose.connect(
    connStr,
    {
      server: { auto_reconnect: true },
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
