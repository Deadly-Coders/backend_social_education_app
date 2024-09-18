const express = require('express');
const router = express.Router();

const resourceController = require('../controllers/resourceController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/').get(resourceController.getAllResource);

router.route('/:id').get(resourceController.getResource);

module.exports = router;
