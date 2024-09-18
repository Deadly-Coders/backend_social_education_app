const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow nested Get Reviews on Tour
    //   let filter = {}; // This is only for the reviews
    //   if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sorting()
      .limitFields()
      .pagination();
    // const doc = await features.query.explain();
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc,
      },
    });
  });

exports.getOne = (Model, populateOption) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOption) query = query.populate(populateOption);

    const doc = await query;

    if (!doc) {
      return next(new AppError('No Tour found with that id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
