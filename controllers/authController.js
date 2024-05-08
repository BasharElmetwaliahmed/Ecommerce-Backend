const User = require("../models/userModel");
const catchAsync = require("../utils/createAsync");
const AppError = require("../utils/appError");
const generateToken = require("../utils/generateToken");
const sendMail = require("../utils/email");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");

const createToken = (user, statusCode, res, message) => {
  const token = generateToken(user._id);
  const cookieOpt = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES_COOKIE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    cookieOpt.secure = true;
  }

  res.cookie("jwt", token);
  res.status(statusCode).json({
    status: "success",
    message,
    token,
  });
};

exports.signUp = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  const token = generateToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Provide Email and Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Provide Correct email or password", 401));
  }
  createToken(user, 200, res, "logged in successfully");
});

exports.protect = catchAsync(async (req, res, next) => {
  //check token
  let token;

  if (
    req.headers?.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Error, Login first to get Access", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);

  //check if user deleted

  const user = await User.findById(decoded.id);

  if (!user)
    return next(new AppError("Not Valid Token,User has been deleted", 401));

  //check password changed after set token
  if (user.changedPassword(decoded.iat)) {
    return next(new AppError("Not Valid Token,Password Has been changed", 401));
  }

  req.user = user;
  next();
});

exports.restrictTo = (msg, ...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(msg, 403));
    }

    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError("User with this email not found", 404));

  const resetToken = user.createToken();
  await user.save({ validateBeforeSave: false });

  const setUrl = `${req.protocol}/${req.get(
    "host"
  )}/api/v1/restPassword/${resetToken}`;

  const message = `You Can reset your password by Make PATCH request to this ${setUrl} `;

  try {
    await sendMail({
      to: user.email,
      message,
      subject: "You ResetPassword token (valid for 10 minutes)",
    });
    res.status(200).json({
      status: "success",
      message: "Your  reset password email has been sent successfully",
    });
  } catch (e) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    console.error(e);

    await user.save({ validateBeforeSave: false });
    res.status(500).json({
      status: "fail",
      message: "fail to send reset password email ,try again later",
    });
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  console.log(req.params.token);
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  console.log(req.params.token, resetPasswordToken);
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(new AppError("inavlid token or token has been expired", 401));
  }

  user.password = res.body.password;
  user.confirmPassword = res.body.confirmPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  createToken(user, 200, res, "password reseted successfully");
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Incorrect current Password", 401));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  await user.save();

  createToken(user, 200, res, "password changed successfully");
});
