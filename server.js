const app = require('./app');
const mongoose = require('mongoose');
const Message = require('./models/messageModel');
const Conversation = require('./models/conversationModel');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE;

app.use(
  cors({
    origin: '*', // Allow all origins (can specify your Flutter domain or localhost if needed)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allow credentials like cookies
  })
);

mongoose.connect(DB).then(() => {
  console.log('DB connection successful!');
});

// Set up the server and Socket.IO
const port = 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('New user connected');

  // Join the user to a room based on their userId
  socket.on('joinRoom', (userId) => {
    socket.join(userId); // User joins their own room using userId
    console.log(`User with ID ${userId} joined room ${userId}`);
  });

  socket.on('sendMessage', async (data) => {
    const { senderId, receiverId, message } = data;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
      });
      await conversation.save();
    }

    const msg = new Message({
      conversationId: conversation._id, // Use MongoDB generated _id for conversationId
      senderId,
      receiverId,
      message,
    });
    console.log('Message: ', msg);

    await msg.save();

    socket.to(receiverId).emit('newMessage', msg);
    socket.emit('newMessage', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
