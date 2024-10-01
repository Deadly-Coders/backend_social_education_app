const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');
const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');

exports.socketConn = catchAsync(async (req, res, next) => {
  //   console.log('router hit');
  console.log(req.query);
  const { userId, friendId } = req.query;
  console.log(userId);

  if (!userId || !friendId) {
    console.error('Error: Missing userId or friendId');

    return next(new AppError('Missing userId or friendId', 400));
  }

  const conversation = await Conversation.findOne({
    participants: { $all: [userId, friendId] },
  });

  if (!conversation) {
    conversation = new Conversation({
      participants: [userId, friendId],
    });
    await conversation.save();
    res.status(200).json({
      status: 'success',
      conversation,
    });
  } //Removed unnecessary code

  const messages = await Message.find({ conversationId: conversation._id });

  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});
