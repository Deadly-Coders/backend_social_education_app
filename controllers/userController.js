const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const sharp = require('sharp');
const multer = require('multer');

//-----------------------------------------------------------------------------------------

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  console.log('image passed');
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image, Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  console.log(req.originalUrl);

  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  if (req.originalUrl.includes('updateMe')) {
    console.log('circular sharp has been hit');
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`view/img/users/${req.file.filename}`);
  } else {
    console.log('square  sharp has been hit');
    await sharp(req.file.buffer)
      .resize(500, 500, {
        fit: sharp.fit.cover, // ensures the image is cropped to cover the square dimensions
        position: 'center', // centers the image before cropping
      })
      .toFormat('jpeg')
      .jpeg({ quality: 100 }) // higher quality for high resolution
      .toFile(`view/img/market/${req.file.filename}`);
  }
  next();
});

const filterObj = (obj, ...allowedFileds) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    // we want the selected elements of the req.body
    if (allowedFileds.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

//--------------------------------------------------------------------------------

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError('This route is not for changing the password!', 400)
    ); // 1> We dont want user to update password from here

  // 2> Update user document

  const filteredBody = filterObj(
    req.body,
    'name',
    'email',
    'collegeName',
    'birthDate',
    'graduationStart',
    'graduationEnd',
    'universityName',
    'branch',
    'interests'
  ); //USed this to filter out the names that are not needed to prevent them from updating any other stuff that will lead to security breach
  if (req.file) filteredBody.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.getAllUser = catchAsync(async (req, res, next) => {
  const user = await User.find();
  res.status(200).json({
    status: 'success',
    results: user.length,
    data: {
      user,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getUser = factory.getOne(User, {
  path: 'friends',
  select: 'name photo',
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.addFriend = catchAsync(async (req, res, next) => {
  const friendId = req.params.id;
  const user = await User.findById(req.user.id);

  const friendUser = await User.findById(friendId);
  if (!user || !friendUser)
    return next(new AppError('User or friend not found', 404));
  if (user.friends.includes(friendId))
    return next(new AppError('Friend already exists', 400));

  user.friends.push(friendId);
  friendUser.friends.push(user.id);

  await user.save({ validateBeforeSave: false });
  await friendUser.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'friends added successfully',
  });
});

exports.removeFriend = catchAsync(async (req, res, next) => {
  const friendId = req.params.id;
  const user = await User.findById(req.user.id);
  const friendUser = await User.findById(friendId);
  if (!user || !friendUser)
    return next(new AppError('User or friend not found', 404));
  user.friends = user.friends.filter((f) => f.toString() !== friendId);
  friendUser.friends = friendUser.friends.filter(
    (f) => f.toString() !== user.id
  );

  await user.save({ validateBeforeSave: false });
  await friendUser.save({ validateBeforeSave: false });

  res.status(204).json({
    status: 'success',
    message: 'friends removed successfully',
  });
});

exports.friendSuggest = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('friends');
  // console.log(user);

  // console.log(user.friends.map((friend) => friend._id));

  const allUsers = await User.find({
    _id: {
      $ne: user._id, // Exclude the current user
      $nin: user.friends.map((friend) => friend._id),
    }, // Exclude current friends
  });
  // console.log(allUsers);

  const recommendations = [];

  allUsers.forEach((potentialFriend) => {
    let score = 0;

    // Same college
    if (user.collegeName === potentialFriend.collegeName) {
      score += 3;
    }

    // Same branch
    if (user.branch === potentialFriend.branch) {
      score += 2;
    }

    // Shared interests
    const sharedInterests = potentialFriend.interests.filter((interest) =>
      user.interests.includes(interest)
    );
    score += sharedInterests.length;

    if (score > 0) {
      recommendations.push({
        user: potentialFriend,
        score,
      });
    }
  });

  // Sort the recommendations based on the score in descending order
  recommendations.sort((a, b) => b.score - a.score);

  res.status(200).json({
    status: 'success',
    results: recommendations.length,
    recommendations,
  });
});
