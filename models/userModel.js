const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { type } = require('os');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  phone: Number,
  collegeName: {
    type: String,
    required: [true, 'Please tell use your college'],
  },
  birthDate: {
    type: String, // WE will view this later
    required: [true, 'Please tell use your DOB'],
  },
  graduationStart: {
    type: Number,
    required: [true, 'Please tell use your graduation start year'],
  },
  graduationEnd: {
    type: Number,
    required: [true, 'Please tell use your graduation end year'],
  },
  universityName: {
    type: String,
    required: [true, 'Please tell use your University'],
  },
  branch: {
    type: String,
    required: [true, 'Please tell use your branch'], //INTRODUCE ENUM HERE
  },
  interests: [
    {
      type: String,
      required: [true, 'Please tell us your interests'], //INTORODUCE ENUM HERE
    },
  ],
  photo: String,
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  role: {
    type: String,
    enum: ['user', 'teacher', 'admin'],
    default: 'user',
  },
  friends: [{ type: mongoose.Schema.ObjectId, ref: 'User' }], //friends for many:many relationship
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, //To not show in the output
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE & SAVE!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'ConfirmPassword do not match the Password',
    },
  },
  passwordChangedAT: Date,
  passwordResetToken: String,
  passwordResetExpiry: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
userSchema.pre('save', async function (next) {
  // Hash the password if it's modified with cost of 12
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined; // Remove passwordConfirm field

    // Update passwordChangedAt field, but only if it's not a new document
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000; //putting 1sec behind
    }
  }

  next();
});

//FOR FUTURE USE

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword //CREATED THIS FUNCTION HERE BECAUSE IT WIILL BE EASY
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAT) {
    const changedTimeStamp = parseInt(this.passwordChangedAT.getTime() / 1000);
    console.log(changedTimeStamp, JWTTimeStamp);
    return JWTTimeStamp < changedTimeStamp; //This will either return a true or false
  }
  return false; //False mean pass not changed
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); //Creating this token to send to user to email to create new password

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpiry = Date.now() + 10 * 60 * 1000; // This will last for Date now + 10 mins
  return resetToken;
};

userSchema.pre(/^find/, function (next) {
  // this is a query middleware which is used for all the query that starts with find

  this.find({ active: { $ne: false } });
  next(); // this is to find only the users that has active to set to true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
