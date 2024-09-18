const jwt = require('jsonwebtoken');
const util = require('util');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const CreateSendToken = (user, statusCode, res) => {
  const token = signToken(user._id); // WE WILL CHECK THIS LATER
  const CookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // secure: req.secure || req.headers('x-forwarded-proto') === 'https',
  };
  if (process.env.NODE_ENV === 'production') CookieOptions.secure = true;

  res.cookie('jwt', token, CookieOptions);
  user.password = undefined;
  // console.log(token);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const data = ({
    name,
    collegeName,
    birthDate,
    graduationStart,
    graduationEnd,
    universityName,
    branch,
    interests,
    email,
    password,
    passwordConfirm,
  } = req.body);

  const newUser = await User.create(data);
  const url = `${req.protocol}://${req.get('host')}/me`;
  //   await new Email(newUser, url).sendWelcome();
  CreateSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // console.log(email, password);
  if (!email || !password) {
    return next(new AppError('Please provide an email or password', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  // if (!user) return next(new AppError('Incorrect email or passsword', 401));

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or passsword', 401));

  CreateSendToken(user, 200, res);
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array ['admin','lead-guide']  role is now just user role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.protect = catchAsync(async (req, res, next) => {
  //1> Checking if the token exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) token = req.cookies.jwt;
  if (!token)
    return next(new AppError('You are not logged in! Please login first', 401));

  //-----------------------------------------------------------------------------//

  //2> verification of token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  console.log(decoded);
  //3> Check if the user exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The account belonging to the user does no longer exists',
        401
      )
    );
  }
  //4> Check if the user changed the password after the JWT was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next(); //GRANCT ACCESS TO PROTECTED ROUTE
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1> Get user from the collection
  const user = await User.findById(req.user.id).select('+password');
  //2> Check if the posted password is correct

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    // we will pass passwordCurrent in the req.body

    return next(new AppError('Your current password is wrong', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //3> If so, update the password

  //4> Log the user in with JWT
  CreateSendToken(user, 200, res);
});
