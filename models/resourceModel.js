const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'title is required'],
  },
  date: Date,
  description: {
    type: String,
    required: [true, 'description is required'],
  },
  subject: {
    type: String,
    required: [true, 'subject is required'],
  },
});

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
