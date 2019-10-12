const mongoose = require('mongoose');

const fieldFragment = {
  name: String,
  typeSig: String
};

const kindFragment = {
  name: String,
  fields: [fieldFragment]
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
  runtimeId: {
    type: String,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  input: [fieldFragment],
  typeSig: String,
  kinds: [kindFragment]
});

module.exports = mongoose.model('Lambda', schema);
