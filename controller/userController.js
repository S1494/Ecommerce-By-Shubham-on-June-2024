const userSchema = require("../models/userSchema.js");
const ErrorHandler = require("../utils/errorhandler.js");
const catchAsyncError = require("../middleware/catchAsyncError.js");
const sendToken = require("../utils/jwtToken.js");
const sendEmail = require("../utils/sendemail.js");
const crypto = require("crypto");
const { log } = require("console");

// Register a user
exports.registerUser = catchAsyncError(async (req, res) => {
  const { name, email, password } = req.body;

  const newUser = await userSchema.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is sample public id",
      url: "this is sample url",
    },
  });

  const token = newUser.getJWTToken();

  res.status(201).json({
    success: true,
    newUser,
    token,
  });
});

// Login a user
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given both email & password
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & passwrd", 400));
  }

  const user = await userSchema.findOne({ email: email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email & password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  console.log(isPasswordMatched);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email & password", 401));
  }

  sendToken(user, 201, res);
});

//logout
exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httponly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out Successfully",
  });
});

// Forgot Password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await userSchema.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("user not found ", 404));
  }

  //get reset passowrd token
  const resetToken = user.GetResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // creating reset link
  // req.protocol used to get  http  or https
  // req.get("host") used to get domain name currently it is local host
  const resetPasswordURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is :- /n/n ${resetPasswordURL} /n /n if you have not requested it kindly ignore`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce passoword recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `email sent successfully to  ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExipre = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  console.log(resetPasswordToken);

  const user = await userSchema.findOne({
    resetPasswordToken,
    resetPasswordExipre: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Reset Password token has been exipred", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password doesn't match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExipre = undefined;

  user.save();

  sendToken(user, 200, res);
});

//Get User Details
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  const user = await userSchema.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

//Update User password
exports.updateUserPassword = catchAsyncError(async (req, res, next) => {
  const user = await userSchema.findById(req.user.id).select("+password");

  const isPasswordMatched = user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("old password is wrong", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password doesn't matched", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

//Update User Profile
exports.updateUserProfile = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await userSchema.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  user.save();

  res.status(200).json({
    success: true,
  });
});

//Get allusers
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await userSchema.find();
  res.status(200).json({
    success: true,
    users,
  });
});

//Get Single user - Admin
exports.getSingleUser = catchAsyncError(async (req, res, next) => {
  const user = await userSchema.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("user does't exist with id", 400));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

//Delete user - Admin
exports.deleteUserProfile = catchAsyncError(async (req, res, next) => {
  const user = userSchema.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("user does't exist", 400));
  }
  await userSchema.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: true,
    message: "user Deleted successfully",
  });
});

//Update User Profile - Admin
exports.updateUserProfileadmin = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const response = await userSchema.findByIdAndUpdate(
    req.params.id,
    newUserData
  );

  res.status(200).json({
    success: true,
    response,
  });
});
