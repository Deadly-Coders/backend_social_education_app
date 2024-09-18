const express = require('express');
const router = express.Router();

const lectureController = require('../controllers/lectureController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/').get(lectureController.getAllLecture);

router.route('/:id').get(lectureController.getLecture);

module.exports = router;
