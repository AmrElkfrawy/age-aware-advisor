const sendError = (err, req, res) => {
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    console.error('ERROR ', err);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  console.error('ERROR ', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!',
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = JSON.parse(JSON.stringify(err));
  error.message = err.message;

  sendError(error, req, res);
};
