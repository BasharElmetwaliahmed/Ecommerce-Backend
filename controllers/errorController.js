const AppError = require("../utils/appError");
const cloudinary = require("../utils/cloudinary");

const handlCastErrorsDB = (err) => {
  let message = `invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
const sendErrorDev = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};
const handleDupliaceValuesDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/);
  const message = `field value:${value} aleady exist. please use another`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((err) => err.message);
  const message = `Invalid Input data.  ${messages.join(". ")}`;
  return new AppError(message, 400);
};
const sendErrorProd = (res, err) => {
  if (err.isOperational) {
    //operational trusted errors
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //programming errors or external unexpected errors ,not operational
    console.error("ERROR  " + err);
    res.status(500).json({
      message: "something went very wrong",
    });
  }
};

module.exports = async (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (req.file) {
    const publicId = req.file.filename;
    await cloudinary.uploader.destroy(publicId);
  }

  if (process.env.NODE_ENV === "production") {
    let error = err;

    if (error.name === "CastError") error = handlCastErrorsDB(error);
    if (error.code == 11000) error = handleDupliaceValuesDB(error);
    if (error.name === "ValidationError") error = handleValidationError(error);
    sendErrorProd(res, error);
  } else if (process.env.NODE_ENV === "development") {
    sendErrorDev(res, err);
  }
};
