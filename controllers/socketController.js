const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');

const catchAsync = require('../utils/catchAsync');

exports.socketConn = catchAsync(async (req, res, next) => {
  //   console.log('router hit');
  console.log(req.query);
  const { userId, friendId } = req.query;
  console.log(userId);

  if (!userId || !friendId) {
    console.error('Error: Missing userId or friendId');
    return res.status(400).json({
      status: 'fail',
      message: 'Missing userId or friendId',
    });
  }

  try {
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
    }

    const messages = await Message.find({ conversationId: conversation._id });

    res.status(200).json({
      status: 'success',
      data: {
        messages,
      },
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error. Please try again later.',
    });
  }
});
