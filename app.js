const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');

const userRouter = require('./routes/userRoutes');
const marketRouter = require('./routes/marketRoutes');
const lectureRouter = require('./routes/lectureRoutes');
const resourceRouter = require('./routes/resourceRoutes');
const socketRouter = require('./routes/socketRouter');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController'); //ERROR HANDLERS

const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const compression = require('compression');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean'); //security based middlewares

app.use(cors());
app.options('*', cors());

//SECURITY MIDDLEWARES

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

app.use(morgan('dev')); //morgan middleware
app.use(express.json({ limit: '10kb' }));

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());
const limiter = rateLimit({
  //PREVENTS FROM DDOS
  max: 100, // No. of requests
  windowMs: 60 * 60 * 1000, // Time in Ms
  message: 'Too many requests from this IP, Please try again in an hour', // Error message
});
app.use('/api', limiter);

app.use(express.static(`${__dirname}/view`));

app.use('/api/v1/users', userRouter);
app.use('/api/v1/market', marketRouter);
app.use('/api/v1/lecture', lectureRouter);
app.use('/api/v1/resource', resourceRouter);
app.use('/api/v1/messages', socketRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant Find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
