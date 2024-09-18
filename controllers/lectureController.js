const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const Lecture = require('../models/lectureModel');

exports.getAllLecture = factory.getAll(Lecture);

exports.getLecture = factory.getOne(Lecture);
