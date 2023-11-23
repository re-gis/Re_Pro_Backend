"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMyAccount = exports.updateProfile = exports.getUserProfile = exports.getAnyUserProfile = exports.profilePicRemove = exports.uploadPicture = exports.resetPassword = exports.forgotPassword = exports.loginUser = exports.updateUserStats = exports.verifyOtp = exports.userRegister = void 0;
const joi_1 = __importDefault(require("joi"));
const otpGenerator = require("otp-generator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
require("dotenv").config();
const twilio_1 = __importDefault(require("twilio"));
const tw = (0, twilio_1.default)(process.env.SID, process.env.AUTH_TOKEN);
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_entity_1 = __importDefault(require("../../entities/User.entity"));
const typeorm_1 = require("typeorm");
const otp_entity_1 = __importDefault(require("../../entities/otp.entity"));
const Enums_1 = require("../../enums/Enums");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
// const { cloudinary } = require("../config/cloudinary/cloudinary");
const object = joi_1.default.object({
    email: joi_1.default.string().min(3).email().max(200).required(),
    password: joi_1.default.string().min(8).max(100).required(),
    number: joi_1.default.string().required(),
    name: joi_1.default.string().required(),
});
// Generate token
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        number: user.number,
        verified: user.verified,
    }, 
    //@ts-ignore
    process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};
// User register
const userRegister = async (req, res) => {
    const otpRepo = (0, typeorm_1.getRepository)(otp_entity_1.default, "default");
    const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default, "default");
    try {
        const { email, number, password, name } = req.body;
        if (!email || !password || !number || !name) {
            return res.status(400).json({ message: "All credentials are required!" });
        }
        else {
            const { error } = object.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }
            else {
                const euser = await userRepo.findOne({ where: { email } });
                if (euser) {
                    return res.status(400).json({ message: "User already exists!" });
                }
                else {
                    // Generate otp
                    const OTP = otpGenerator.generate(6, {
                        digits: true,
                        lowerCaseAlphabets: false,
                        upperCaseAlphabets: false,
                        specialChars: false,
                    });
                    console.log(OTP);
                    // Hash otp
                    const hashedOtp = bcryptjs_1.default.hashSync(OTP, 10);
                    // check the otp existence
                    const eotp = await otpRepo.findOne({ where: { number } });
                    if (eotp) {
                        return res.status(400).json({
                            message: "User already exists! Verify to proceed...",
                        });
                    }
                    // Save otp to database
                    const otp = otpRepo.create({
                        number,
                        otp: hashedOtp,
                    });
                    const message = await tw.messages.create({
                        from: "+12765985304",
                        to: number,
                        body: `Your Verification Code is ${OTP}`,
                    });
                    if (!message) {
                        console.log(error);
                        return res
                            .status(500)
                            .json({ message: "Internal server error..." });
                    }
                    else {
                        const hashedPass = bcryptjs_1.default.hashSync(password, 10);
                        // Save user
                        const profile = "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Fblank-profile-pic&psig=AOvVaw1kAh7UoZf3vqRdoN82Zab4&ust=1700721974142000&source=images&cd=vfe&ved=0CBIQjRxqFwoTCMCRs56B14IDFQAAAAAdAAAAABAE";
                        const user = new User_entity_1.default(email, hashedPass, number, name, profile);
                        // Save user
                        userRepo.save(user);
                        otpRepo.save(otp);
                        return res.status(201).json({
                            message: "User registered successfully, verify to continue...",
                        });
                    }
                }
            }
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error..." });
    }
};
exports.userRegister = userRegister;
// Verify otp
const verifyOtp = async (req, res) => {
    const otpRepo = (0, typeorm_1.getRepository)(otp_entity_1.default, "default");
    const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default, "default");
    try {
        const number = req.body.number;
        const otp = req.body.otp;
        // Check otp existence
        const eotp = await otpRepo.findOneBy({ number });
        if (!eotp) {
            return res.status(404).json({ message: "Invalid Code..." });
        }
        //compare the otps
        if (!bcryptjs_1.default.compareSync(otp, eotp.otp) || number !== eotp.number) {
            return res.status(403).json({ message: "Invalid Code..." });
        }
        // update user
        const user = await userRepo.findOneBy({ number });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        user.verified = true;
        // delete the opt
        await otpRepo.remove(eotp);
        userRepo.save(user);
        return res.status(200).json({
            message: "Account verified successfully...",
            token: generateToken(user),
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error..." });
    }
};
exports.verifyOtp = verifyOtp;
// Update user stats
const updateUserStats = async (req, res) => {
    const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default, "default");
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Not authorised!" });
    }
    try {
        let { position, church, language, idNumber } = req.body;
        if (!position || !church || !language || !idNumber) {
            return res.status(400).json({ message: "All inputs are required!" });
        }
        else {
            // Get user to update
            const euser = await userRepo.findOne({
                where: { number: user.number, email: user.email },
            });
            if (!euser) {
                return res
                    .status(404)
                    .json({ message: `User ${user.email} not found!` });
            }
            let ps = position.toLowerCase();
            console.log({ ps, position });
            switch (ps) {
                case "secretary":
                    position = Enums_1.EPosition.SECRETARY;
                    break;
                case "bishop":
                    position = Enums_1.EPosition.BISHOP;
                    break;
                case "pastor":
                    position = Enums_1.EPosition.PASTOR;
                    break;
                case "admin":
                    position = Enums_1.EPosition.ADMIN;
                    break;
                default:
                    return res.status(403).json({ message: "Position not allowed..." });
            }
            euser.position = position;
            euser.church = church;
            euser.language = language;
            euser.idNumber = idNumber;
            await userRepo.save(euser);
            // get the updated user
            const u = await userRepo.findOne({
                where: { number: euser.number, email: euser.email },
            });
            if (!u)
                return res.status(404).json({ message: "User not found!" });
            return res.status(201).json({
                message: "User updated successfully...",
                token: generateToken(u),
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error..." });
    }
};
exports.updateUserStats = updateUserStats;
// Login user
const loginUser = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
        if (!email || !password) {
            return res.status(400).json({ message: "All credentials are required!" });
        }
        else {
            // Check user existence
            const euser = await userRepo.findOne({
                where: { email },
            });
            if (!euser)
                return res
                    .status(403)
                    .json({ message: "Invalid email or password..." });
            if (!bcryptjs_1.default.compareSync(password, euser.password))
                return res
                    .status(403)
                    .json({ message: "Invalid email or password..." });
            if (!euser.verified)
                return res
                    .status(403)
                    .json({ message: "Verify the account to continue..." });
            return res.status(200).json({
                message: "User logged in successfully...",
                token: generateToken(euser),
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error..." });
    }
};
exports.loginUser = loginUser;
// Forgot password
const forgotPassword = async (req, res) => {
    const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
    const otpRepo = (0, typeorm_1.getRepository)(otp_entity_1.default);
    const user = req.user;
    if (!user)
        return res.status(400).json({ message: "Not authorised!" });
    // Check its existence
    const u = await userRepo.findOne({
        where: { number: user.number, email: user.email },
    });
    if (!u)
        return res.status(404).json({ message: "User not found!" });
    // send the otp to the user's number
    const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
    });
    const hashedOtp = bcryptjs_1.default.hashSync(otp, 10);
    const eOtp = await otpRepo.findOne({ where: { number: u.number } });
    if (eOtp) {
        // delete it and send the other
        await otpRepo.remove(eOtp);
        const message = await tw.messages.create({
            from: "+12765985304",
            to: u.number,
            body: `Your Verification Code is ${otp}`,
        });
        if (!message) {
            return res.status(500).json({ message: "Internal server error..." });
        }
        const newOtp = new otp_entity_1.default(u.number, hashedOtp);
        await otpRepo.save(newOtp);
        return res.status(201).json({
            message: `Code sent to ${u.number}, verify to continue resetting password...`,
        });
    }
    const message = await tw.messages.create({
        from: "+12765985304",
        to: u.number,
        body: `Your Verification Code is ${otp}`,
    });
    if (!message) {
        return res.status(500).json({ message: "Internal server error..." });
    }
    const newOtp = new otp_entity_1.default(u.number, hashedOtp);
    await otpRepo.save(newOtp);
    return res.status(201).json({
        message: `Code sent to ${u.number}, verify to continue resetting password...`,
    });
};
exports.forgotPassword = forgotPassword;
// Resetting password
const resetPassword = async (req, res) => {
    const otpRepo = (0, typeorm_1.getRepository)(otp_entity_1.default);
    const UserRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
    const otp = req.body.otp;
    const password = req.body.password;
    const user = req.user;
    if (!otp || !password) {
        return res.status(400).json({ message: "All credentials are required..." });
    }
    // Check existence
    const eo = await otpRepo.findOne({ where: { number: user.number } });
    if (!eo) {
        return res.status(400).json({ message: "Otp not found!" });
    }
    // compare otps
    if (!bcryptjs_1.default.compareSync(otp, eo.otp)) {
        return res.status(403).json({ message: "Invalid code provided..." });
    }
    // get new Password
    const hashedPass = await bcryptjs_1.default.hashSync(password, 10);
    // update the user
    const eu = await UserRepo.findOne({
        where: { email: user.email, number: user.number },
    });
    if (!eu)
        return res.status(404).json({ message: "User not found!" });
    eu.password = hashedPass;
    await UserRepo.save(eu);
    return res.status(201).json({
        message: "Password reset successfully!",
        token: generateToken(eu),
    });
};
exports.resetPassword = resetPassword;
// Upload profile picture
const uploadPicture = async (req, res) => {
    const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
    const user = req.user;
    if (!user) {
        return res.status(403).json({ message: "Not authorised!" });
    }
    try {
        const u = await userRepo.findOne({
            where: { email: user.email, number: user.number },
        });
        if (!u)
            return res.status(404).json({ message: "User not found!" });
        if (!req.files)
            return res.status(400).json({ message: "Profile pic is required!" });
        const photo = req.files.photo;
        if (!photo.mimetype.startsWith("image")) {
            return res.status(400).json({ message: "Upload a photo please!" });
        }
        const ext = photo.name.split(".")[1];
        photo.name = `${user.name}${Date.now()}.${ext}`;
        console.log(photo);
        try {
            const profilePic = await cloudinary_1.default.uploader.upload(photo.tempFilePath);
            if (!profilePic)
                return res
                    .status(500)
                    .json({ message: "Error while uploading the photo..." });
            // save the pic
            u.profilePic = profilePic.secure_url;
            u.cloudinaryId = profilePic.public_id;
            await userRepo.save(u);
            return res
                .status(201)
                .json({ message: "Profile photo uploaded successfully..." });
        }
        catch (e) {
            console.log(e);
            return res.status(500).json({ message: "Internal server error..." });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error..." });
    }
};
exports.uploadPicture = uploadPicture;
// Remove profile pic
const profilePicRemove = async (req, res) => {
    const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
    const user = req.user;
    const password = req.body.password;
    if (!user) {
        return res.status(401).json({ message: "No user found!" });
    }
    else {
        const u = await userRepo.findOne({
            where: { email: user.email, number: user.number },
        });
        if (!u)
            return res.status(404).json({ message: "User not found!" });
        if (!password)
            return res.status(400).json({ message: "Password is required!" });
        if (!bcryptjs_1.default.compareSync(password, u.password))
            return res.status(403).json({ message: "Invalid password provided..." });
        // remove profile pic
        u.profilePic =
            "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Fblank-profile-pic&psig=AOvVaw1kAh7UoZf3vqRdoN82Zab4&ust=1700721974142000&source=images&cd=vfe&ved=0CBIQjRxqFwoTCMCRs56B14IDFQAAAAAdAAAAABAE";
        await userRepo.save(u);
        return res
            .status(200)
            .json({ message: "Profile image removed successfully..." });
    }
};
exports.profilePicRemove = profilePicRemove;
// Get any user profile
const getAnyUserProfile = async (req, res) => {
    const user = req.user;
    const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
    if (!user)
        return res.status(400).json({ message: "Not authorised" });
    // Get user from url
    const userName = req.params.user;
    // Get user from db
    const u = await userRepo.findOne({ where: { name: userName } });
    if (!u)
        return res.status(404).json({ message: `User ${userName} not found!` });
    // check if it is not the same user as logged user
    if (u.number == user.number && u.email == user.email) {
        return res.status(403).json({ message: "Please visit your profile..." });
    }
    return res.status(200).json({ user: u });
};
exports.getAnyUserProfile = getAnyUserProfile;
// Get my profile from token
const getUserProfile = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Not authorised!" });
    }
    else {
        return res.status(201).json({
            user,
        });
    }
};
exports.getUserProfile = getUserProfile;
// Update user profile
const updateProfile = async (req, res) => {
    const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
    const user = req.user;
    const password = req.body.password;
    const { name, email, church, language, number, idNumber } = req.body;
    if (!user) {
        return res.status(401).json({ message: "Not authorised!" });
    }
    const u = await userRepo.findOne({
        where: { number: user.number, email: user.email },
    });
    if (!u)
        return res.status(404).json({ message: "User not found!" });
    const updatedFiels = {
        name: name || u.name,
        email: email || u.email,
        church: church || u.church,
        language: language || u.language,
        number: number || u.number,
        idNumber: idNumber || u.idNumber,
    };
    if (!password)
        return res.status(401).json({ message: "Password is required!" });
    if (!(await bcryptjs_1.default.compare(password, u.password)))
        return res.status(401).json({ message: "Invalid password provided!" });
    Object.assign(u, updatedFiels);
    await userRepo.save(u);
    return res.status(201).json({
        message: "User stats updated successfully...",
        token: generateToken(u),
    });
};
exports.updateProfile = updateProfile;
// Delete user profile
const deleteMyAccount = async (req, res) => {
    const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Not authorised!" });
    }
    const password = req.body.password;
    if (!password)
        return res
            .status(400)
            .json({ message: "Password is required to delete the account..." });
    const u = await userRepo.findOne({
        where: { email: user.email, number: user.number },
    });
    if (!u)
        return res.status(404).json({ message: "User not found!" });
    if (!(await bcryptjs_1.default.compare(password, u.password))) {
        return res.status(401).json({ message: "Invalid password provided..." });
    }
    // delete the account
    await userRepo.remove(u);
    return res
        .status(200)
        .json({ message: "User account deleted successfully..." });
};
exports.deleteMyAccount = deleteMyAccount;
// // Total workers
// const getTotalWorkers = async (req: IRequest, res: IResponse) => {
//   // get users number
//   const sql = `SELECT * FROM users`;
//   conn.query(sql, (error: Error, data: any) => {
//     if (error) {
//       console.log(error);
//       return res.status(500).json({ message: "Internal server error..." });
//     } else {
//       return res.status(201).json({
//         users: data,
//         totalNumber: data.length,
//       });
//     }
//   });
// };
// // Get pastors
// const getPastors = async (req: IRequest, res: IResponse) => {
//   // get users whose position = pastor
//   const sql = `SELECT * FROM users WHERE position = 'pastor'`;
//   conn.query(sql, (error: Error, data: any) => {
//     if (error) {
//       console.log(error);
//       return res.status(500).json({ message: "Internal server error..." });
//     } else {
//       return res.status(201).json({
//         pastors: data,
//         totalNumber: data.length,
//       });
//     }
//   });
// };
// // Change user password
// const passwordChange = async (req: IRequest, res: IResponse) => {
//   const user = req.user;
//   if (!user) return res.status(401).json({ message: "Not authorised!" });
//   // Get user from the url
//   const userName = req.params.user;
//   // Compare to token
//   if (userName === user.name) {
//     // Get password
//     const newPassword = req.body.newPassword;
//     const oldPassword = req.body.oldPassword;
//     const cp = req.body.confirmPass;
//     if (!oldPassword)
//       return res.status(400).json({ message: "Enter old password" });
//     // Check if it matches the user's
//     const validPass = await bcrypt.compare(oldPassword, user.password);
//     if (!validPass)
//       return res.status(403).json({ message: "Invalid password given!" });
//     if (!newPassword)
//       return res.status(400).json({ message: "Enter new password..." });
//     // Change the password
//     if (newPassword !== cp)
//       return res
//         .status(400)
//         .json({ message: "Confirm password to proceed..." });
//     const hp = await bcrypt.hash(newPassword, 10);
//     const sql = `UPDATE users SET password='${hp}' WHERE number = '${user.number}' AND name='${user.name}' AND email='${user.email}'`;
//     conn.query(sql, async (error: Error) => {
//       // console.log(error)
//       if (error)
//         return res.status(500).json({ message: "Internal server error..." });
//       // Get the user from database
//       const sql = `SELECT * FROM users WHERE number ='${user.number}' AND email='${user.email}'`;
//       conn.query(sql, async (error: Error, data: any) => {
//         if (error)
//           // console.log(error)
//           return res.status(500).json({ message: "Internal server error..." });
//         if (data.length === 0)
//           return res.status(401).json({ message: "No user found!" });
//         return res
//           .status(201)
//           .json({ message: "Password updated successfully!", user: data[0] });
//       });
//     });
//   } else {
//     return res
//       .status(401)
//       .json({ message: "Not authorised to perform this action!" });
//   }
// };
// const searchUser = async (req: IRequest, res: IResponse) => {
//   const user = req.user;
//   if (!user) return res.status(400).json({ message: "Not authorised!" });
//   const { search } = req.query;
//   if (!search) {
//     // Get users in the same church
//     const sql = `SELECT * FROM users WHERE church ='${user.church}'`;
//     conn.query(sql, async (err: Error, data: any) => {
//       if (err)
//         return res.status(500).json({ message: "Internal server error..." });
//       if (data.length === 0)
//         return res.status(400).json({ message: "Search users!" });
//       if (data[0].number === user.number)
//         return res.status(400).json({ message: "Visit your profile!" });
//       return res.status(200).json(data);
//     });
//   } else {
//     // Get searched user
//     const sql = `SELECT * FROM users WHERE name LIKE '%${search}%' OR email LIKE '%${search}%'`;
//     conn.query(sql, async (err: Error, data: any) => {
//       if (err)
//         return res.status(500).json({ message: "Internal server error..." });
//       if (data.length === 0)
//         return res.status(400).json({ message: "No user found!" });
//       return res.status(200).json(data);
//     });
//   }
// };
// module.exports = {
//   userRegister,
//   verifyOtp,
//   updateUserStats,
//   loginUser,
//   forgotPassword,
//   resetPassword,
//   uploadPicture,
//   getAnyUserProfile,
//   updateProfile,
//   profilePicRemove,
//   getUserProfile,
//   deleteMyAccount,
//   getTotalWorkers,
//   getPastors,
//   passwordChange,
//   searchUser,
// };
