const express = require("express");
const { userRegister, verifyOtp, updateUserStats } = require("../controllers/user.Controllers");
const userRouter = express.Router();
const passport = require('passport');
const protect = require("../middlewares/userAuth");

userRouter.use(passport.initialize())

require('../config/googleAuth/auth')

// Signup user
userRouter.post("/register", userRegister);

// Verify number
userRouter.post("/register/verify", verifyOtp);

// Google signup
userRouter.get('/auth/google', passport.authenticate('google', {scope: ['email', 'profile']}))
userRouter.get('/google/callback', passport.authenticate('google', (error, data) => {
    if(error) {
        return error
    } else {
        return data
    }
}))


// Update user stats
userRouter.post('/register/update', protect, updateUserStats)

module.exports = userRouter;
