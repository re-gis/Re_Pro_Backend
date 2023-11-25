import express from "express";
export const userRouter = express.Router();
import passport from "passport";
import { protect, role } from "../../middlewares/userAuth";
import {
  deleteMyAccount,
  forgotPassword,
  getAnyUserProfile,
  getUserProfile,
  loginUser,
  profilePicRemove,
  resetPassword,
  updateProfile,
  updateUserStats,
  uploadPicture,
  userRegister,
  verifyOtp,
} from "./user.Controllers";
import { EPosition } from "../../enums/Enums";

userRouter.use(passport.initialize());

require("../../config/googleAuth/auth");

// Signup user
userRouter.post("/register", protect, role(EPosition.SUPER), userRegister);
// userRouter.post("/register", userRegister);

// Verify number
userRouter.post("/register/verify", verifyOtp);

// Google signup
userRouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
userRouter.get(
  "/google/callback",
  passport.authenticate("google", (error: Error, data: any) => {
    if (error) {
      return error;
    } else {
      return data;
    }
  })
);

// Update user stats
userRouter.put("/register/update", protect, updateUserStats);

// Login user
userRouter.post("/login", loginUser);

// Forgot password
userRouter.post("/password/forgot", protect, forgotPassword);

// Reset password
userRouter.post("/password/reset", protect, resetPassword);

// Upload profile picture
userRouter.post("/profile/photo/upload", protect, uploadPicture);

// Remove profile pic
userRouter.put("/:user/profile/photo/remove", protect, profilePicRemove);

// get any user profile
userRouter.get("/:user/profile", protect, getAnyUserProfile);

// Get my profile
userRouter.get("/my/profile", protect, getUserProfile);

// Update user profile
userRouter.put("/profile/update", protect, updateProfile);

// Delete account
userRouter.delete("/profile/delete", protect, deleteMyAccount);

// Get total workers
// userRouter.get("/workers", getTotalWorkers);

// Get pastors
// userRouter.get("/workers/pastors", getPastors);

// Change user password
// userRouter.put("/:user/profile/password/change", protect, passwordChange);

// Search user
// userRouter.post("/search", protect, searchUser);

// module.exports = userRouter;
