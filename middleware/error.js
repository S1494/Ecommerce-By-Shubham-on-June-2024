const ErrorHandler = require("../utils/errorhandler.js");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || " Internal Server Error";

  //wrong mongo db id error
  if (err.name === "castError") {
    const message = `Resource not found invalid : ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Duplicate key error
  if (err.code === 11000) {
    const message = ` Duplicate  ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  //wrong jwt error
  if (err.name === "jsonWebTokenError") {
    const message = `Json webtoken is invalid : ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //wrong jwt expiry error
  if (err.name === "TokenExpiredError") {
    const message = `Json webtoken is Expired : ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message, // this will show error message in console
    error: err.stack, // this will show where the error is
  });
};
