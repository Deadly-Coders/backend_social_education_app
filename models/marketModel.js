const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please give us your title'],
  },
  description: {
    type: String,
    required: [true, 'Please give us your description'],
  },
  price: {
    type: Number,
    required: [true, 'Please give us your price'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A market product must belong to a User'],
  },
  photo: {
    type: String,
    // required: [true, 'Please give us your image'],
  },
});

marketSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

const Market = mongoose.model('Market', marketSchema);
module.exports = Market;
