const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: {
    type: String,
    require: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Function', schema);
