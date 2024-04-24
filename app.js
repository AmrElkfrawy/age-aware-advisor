const express = require('express');
const cors = require('cors');
const app = express();

const router = require('./routes/healthRouter');
const errorHandler = require('./controllers/errorController');
const AppError = require('./helpers/appError');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/', router);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(errorHandler);

module.exports = app;
