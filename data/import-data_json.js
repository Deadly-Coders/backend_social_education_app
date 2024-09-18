const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const Lecture = require('../models/lectureModel');

dotenv.config({ path: '../config.env' });
const DB = process.env.DATABASE;
console.log(DB);

mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful!');
  });

const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const lecture = JSON.parse(
  fs.readFileSync(`${__dirname}/lecture.json`, 'utf-8')
);

//IMPORT DATA TO DATABASE
const importData = async () => {
  try {
    // await Tour.create(tours);
    // await User.create(users, { validateBeforeSave: false });
    await Lecture.create(lecture);
    console.log('Data imported successfully form json file');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
const deleteData = async () => {
  try {
    // await Tour.deleteMany();
    // await User.deleteMany();
    await Lecture.deleteMany();
    console.log('Data deleted successfully');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
console.log(process.argv);
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
