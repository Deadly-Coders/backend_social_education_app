const express = require('express');
const router = express.Router({ mergeParams: true });

const marketController = require('../controllers/marketController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router
  .route('/')
  .get(marketController.getAllMarket)
  .post(marketController.createMarket);

module.exports = router;
