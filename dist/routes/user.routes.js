"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
exports.userRouter = express_1.default.Router();
const passport_1 = __importDefault(require("passport"));
const user_Controllers_1 = require("../controllers/user.Controllers");
exports.userRouter.use(passport_1.default.initialize());
require("../config/googleAuth/auth");
// Signup user
exports.userRouter.post("/register", user_Controllers_1.userRegister);
// Verify number
exports.userRouter.post("/register/verify", user_Controllers_1.verifyOtp);
// Google signup
exports.userRouter.get("/auth/google", passport_1.default.authenticate("google", { scope: ["email", "profile"] }));
exports.userRouter.get("/google/callback", passport_1.default.authenticate("google", (error, data) => {
    if (error) {
        return error;
    }
    else {
        return data;
    }
}));
// Update user stats
// userRouter.put("/register/update", protect, updateUserStats);
// Login user
// userRouter.post("/login", loginUser);
// Forgot password
// userRouter.post("/password/forgot", protect, forgotPassword);
// Reset password
// userRouter.post("/password/reset", protect, resetPassword);
// Upload profile picture
// userRouter.post("/profile/photo/upload", protect, uploadPicture);
// Remove profile pic
// userRouter.put("/:user/profile/photo/remove", protect, profilePicRemove);
// get my profile
// userRouter.get("/:user/my/profile", protect, getUserProfile);
// Get any user profile
// userRouter.get("/:user/profile", protect, getAnyUserProfile);
// Update user profile
// userRouter.put("/:user/profile/update", protect, updateProfile);
// Delete account
// userRouter.delete("/:user/profile/delete", protect, deleteMyAccount);
// Get total workers
// userRouter.get("/workers", getTotalWorkers);
// Get pastors
// userRouter.get("/workers/pastors", getPastors);
// Change user password
// userRouter.put("/:user/profile/password/change", protect, passwordChange);
// Search user
// userRouter.post("/search", protect, searchUser);
// module.exports = userRouter;
