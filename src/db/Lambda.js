const mongoose = require('mongoose');

const fieldFragment = {
  name: String,
  kind: String,
  modifiers: [String]
};

const kindFragment = {
  name: String,
  fields: [fieldFragment]
};

const runtimeFragment = {
  id: String,
  host: String,
  language: String
};

const schema = new mongoose.Schema({
  id: {
    type: String,
    require: true,
    index: true
  },
  serviceId: {
    type: String,
    require: true,
    index: true
  },
  runtime: runtimeFragment,
  code: {
    type: String,
    required: true
  },
  input: [fieldFragment],
  outputKind: String,
  outputModifiers: [String],
  kinds: [kindFragment]
});

module.exports = mongoose.model('Lambda', schema);
