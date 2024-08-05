const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updateUserPassword,
  updateUserProfile,
  getSingleUser,
  getAllUsers,
  deleteUserProfile,
  updateUserProfileadmin,
} = require("../controller/userController");

const { isAuthUser, authRoles } = require("../middleware/auth");

const userRouter = require("express").Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").get(logout);
userRouter.route("/password/forgot").post(forgotPassword);
userRouter.route("/password/reset/:token").put(resetPassword);
userRouter.route("/me").get(isAuthUser, getUserDetails);
userRouter.route("/password/update").put(isAuthUser, updateUserPassword);
userRouter.route("/me/update").put(isAuthUser, updateUserProfile);
userRouter
  .route("/admin/users")
  .get(isAuthUser, authRoles("admin"), getAllUsers);
userRouter
  .route("/admin/user/:id")
  .get(isAuthUser, authRoles("admin"), getSingleUser)
  .put(isAuthUser, authRoles("admin"), updateUserProfileadmin)
  .delete(isAuthUser, authRoles("admin"), deleteUserProfile);

module.exports = userRouter;
