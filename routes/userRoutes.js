const express = require('express');
const router = express.Router();
const marketRouter = require('./marketRoutes');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.use('/:userId/market', marketRouter); // using this middelware to redirect this type of url to marketroutes

router.post('/login', authController.login);
router.post('/signup', authController.signup);

router.use(authController.protect);

router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMyPassword', authController.updatePassword);

router.get('/addfriend/:id', userController.addFriend);
router.get('/remfriend/:id', userController.removeFriend);
router.get('/sugstfriend', userController.friendSuggest);

router.route('/').get(userController.getAllUser);

module.exports = router;
