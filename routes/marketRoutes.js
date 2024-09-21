const express = require('express');
const router = express.Router({ mergeParams: true });

const marketController = require('../controllers/marketController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router.use(authController.protect);

router
  .route('/')
  .get(marketController.getAllMarket)
  .post(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    marketController.createMarket
  );

router.get('/user-market', marketController.getCurrentUserMarket);

module.exports = router;
