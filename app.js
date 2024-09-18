const express = require('express');
const morgan = require('morgan');
const app = express();

const userRouter = require('./routes/userRoutes');
const marketRouter = require('./routes/marketRoutes');
const lectureRouter = require('./routes/lectureRoutes');
const resourceRouter = require('./routes/resourceRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController'); //ERROR HANDLERS

app.use(morgan('dev')); //morgan middleware
app.use(express.json({ limit: '10kb' }));

app.use(express.static(`${__dirname}/view`));

app.use('/api/v1/users', userRouter);
app.use('/api/v1/market', marketRouter);
app.use('/api/v1/lecture', lectureRouter);
app.use('/api/v1/resource', resourceRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant Find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
