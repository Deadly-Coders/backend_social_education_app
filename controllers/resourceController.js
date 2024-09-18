const factory = require('./handlerFactory');
const Resource = require('../models/resourceModel');

exports.getAllResource = factory.getAll(Resource);

exports.getResource = factory.getOne(Resource);
