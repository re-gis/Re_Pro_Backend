"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
exports.userRouter = express_1.default.Router();
const passport_1 = __importDefault(require("passport"));
const userAuth_1 = require("../../middlewares/userAuth");
const user_Controllers_1 = require("./user.Controllers");
const Enums_1 = require("../../enums/Enums");
exports.userRouter.use(passport_1.default.initialize());
require("../../config/googleAuth/auth");
// Signup user
exports.userRouter.post("/register", userAuth_1.protect, (0, userAuth_1.role)(Enums_1.EPosition.SUPER), user_Controllers_1.userRegister);
// userRouter.post("/register", userRegister);
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
exports.userRouter.put("/register/update", userAuth_1.protect, user_Controllers_1.updateUserStats);
// Login user
exports.userRouter.post("/login", user_Controllers_1.loginUser);
// Forgot password
exports.userRouter.post("/password/forgot", userAuth_1.protect, user_Controllers_1.forgotPassword);
// Reset password
exports.userRouter.post("/password/reset", userAuth_1.protect, user_Controllers_1.resetPassword);
// Upload profile picture
exports.userRouter.post("/profile/photo/upload", userAuth_1.protect, user_Controllers_1.uploadPicture);
// Remove profile pic
exports.userRouter.put("/:user/profile/photo/remove", userAuth_1.protect, user_Controllers_1.profilePicRemove);
// get any user profile
exports.userRouter.get("/:user/my/profile", userAuth_1.protect, user_Controllers_1.getAnyUserProfile);
// Get my profile
exports.userRouter.get("/my/profile", userAuth_1.protect, user_Controllers_1.getUserProfile);
// Update user profile
exports.userRouter.put("/profile/update", userAuth_1.protect, user_Controllers_1.updateProfile);
// Delete account
exports.userRouter.delete("/profile/delete", userAuth_1.protect, user_Controllers_1.deleteMyAccount);
// Get total workers
// userRouter.get("/workers", getTotalWorkers);
// Get pastors
// userRouter.get("/workers/pastors", getPastors);
// Change user password
// userRouter.put("/:user/profile/password/change", protect, passwordChange);
// Search user
// userRouter.post("/search", protect, searchUser);
// module.exports = userRouter;
