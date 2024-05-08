const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/createAsync");
const factory = require("./factoryHandler");

const filterObject = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   res.json({
//     status: 'success',
//     results: users.length,
//     requestedAt: req.requestTime,
//     data: {
//       users,
//     },
//   });
// });

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        "Not Allowed to update your password here use /updatePassword",
        401
      )
    );
  }

  const filteredBody = filterObject(req.body, "name", "email");
  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.user._id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route not defiend",
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route not defiend",
  });
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.deleteuser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);
