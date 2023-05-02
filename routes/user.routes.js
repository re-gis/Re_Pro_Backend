const express = require("express");
const {
  userRegister,
  verifyOtp,
  updateUserStats,
  loginUser,
  forgotPassword,
  resetPassword,
  uploadPicture,
  getUserProfile,
  updateProfile,
  profilePicRemove,
  getAnyUserProfile,
  deleteMyAccount,
} = require("../controllers/user.Controllers");
const userRouter = express.Router();
const passport = require("passport");
const protect = require("../middlewares/userAuth");
const currencyRouter = express.Router();

userRouter.use(passport.initialize());

require("../config/googleAuth/auth");

// Signup user
userRouter.post("/register", userRegister);

// Verify number
userRouter.post("/register/verify", verifyOtp);

// Google signup
userRouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
userRouter.get(
  "/google/callback",
  passport.authenticate("google", (error, data) => {
    if (error) {
      return error;
    } else {
      return data;
    }
  })
);

// Update user stats
userRouter.post("/register/update", protect, updateUserStats);

// Login user
userRouter.post("/login", loginUser);

// Forgot password
userRouter.post("/password/forgot", forgotPassword);

// Reset password
userRouter.post("/password/reset", resetPassword);

// Upload profile picture
userRouter.post("/profile/photo/upload", protect, uploadPicture);

// Remove profile pic
userRouter.post('/:user/profile/photo/remove', profilePicRemove)

// get my profile
userRouter.get('/:user/my/profile', protect, getUserProfile)

// Get any user profile
userRouter.get("/:user/profile", protect, getAnyUserProfile);

// Update user profile
userRouter.post("/:user/profile/update", protect, updateProfile);


// Delete account
userRouter.delete('/:user/profile/delete', protect, deleteMyAccount)

module.exports = userRouter;
