const Market = require('../models/marketModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllMarket = catchAsync(async (req, res, next) => {
  //   console.log('market Router HIT');
  let filter = {};
  if (req.params.userId) filter = { user: req.params.userId };
  const market = await Market.find(filter);
  res.status(200).json({
    status: 'success',
    results: market.length,
    data: {
      market,
    },
  });
});

exports.createMarket = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  const newMarket = await Market.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      market: newMarket,
    },
  });
});
