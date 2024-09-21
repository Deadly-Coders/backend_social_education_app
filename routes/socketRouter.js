const express = require('express');
const router = express.Router();

const socketController = require('../controllers/socketController');
const authController = require('../controllers/authController');

// router.use(authController.protect);
router.get('/conversation', socketController.socketConn);

module.exports = router;
