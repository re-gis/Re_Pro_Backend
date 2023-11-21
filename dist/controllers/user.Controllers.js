"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.userRegister = void 0;
const joi_1 = __importDefault(require("joi"));
const otpGenerator = require("otp-generator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
require("dotenv").config();
const twilio_1 = __importDefault(require("twilio"));
const tw = (0, twilio_1.default)(process.env.SID, process.env.AUTH_TOKEN);
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_entity_1 = __importDefault(require("../entities/User.entity"));
const typeorm_1 = require("typeorm");
const otp_entity_1 = __importDefault(require("../entities/otp.entity"));
// const { cloudinary } = require("../config/cloudinary/cloudinary");
const object = joi_1.default.object({
    email: joi_1.default.string().min(3).email().max(200).required(),
    password: joi_1.default.string().min(8).max(100).required(),
    number: joi_1.default.string().required(),
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
const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
const otpRepo = (0, typeorm_1.getRepository)(otp_entity_1.default);
// User register
const userRegister = async (req, res) => {
    try {
        const { email, number, password } = req.body;
        if (!email || !password || !number) {
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
                        const user = userRepo.create({
                            email,
                            password: hashedPass,
                            number,
                        });
                        otpRepo.save(otp);
                        userRepo.save(user);
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
        return res
            .status(200)
            .json({
            message: "Account verified successfully...",
            token: generateToken(user),
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.verifyOtp = verifyOtp;
// // Update user stats
// const updateUserStats = async (req: IRequest, res: IResponse) => {
//   const user = req.user;
//   if (!user) {
//     return res.status(401).json({ message: "Not authorised!" });
//   }
//   try {
//     let { position, church, language, idNumber, name } = req.body;
//     if (!position || !church || !language || !idNumber || !name) {
//       return res.status(400).json({ message: "All inputs are required!" });
//     } else {
//       // Get user to update
//       const sql2 = `SELECT * FROM users WHERE number = '${user.number}'`;
//       const number = user.number;
//       conn.query(sql2, async (error: Error, data: any) => {
//         if (error) {
//           console.log(error);
//           return res.status(500).json({ message: "Internal server error..." });
//         } else {
//           // Update user
//           const sql = `UPDATE users SET position = '${position.toLowerCase()}', church = '${church}', language = '${language}', idNumber = '${idNumber}', name='${name}' WHERE number='${
//             user.number
//           }' AND email='${user.email}'`;
//           conn.query(sql, async (error: Error, data: any) => {
//             if (error) {
//               console.log(error);
//               return res
//                 .status(500)
//                 .json({ message: "Internal server error..." });
//             } else {
//               // Get the user to return
//               const sql = `SELECT * FROM users WHERE number = '${number}'`;
//               conn.query(sql, async (error: Error, data: any) => {
//                 if (error) {
//                   console.log(error);
//                   return res
//                     .status(500)
//                     .json({ message: "Internal server error..." });
//                 } else {
//                   return res.status(201).json({
//                     data,
//                     token: generateToken(data),
//                     message: "User stats updated...",
//                   });
//                 }
//               });
//             }
//           });
//         }
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Internal server error..." });
//   }
// };
// // Login user
// const loginUser = async (req: IRequest, res: IResponse) => {
//   try {
//     const email = req.body.email;
//     const password = req.body.password;
//     if (!email || !password) {
//       return res.status(400).json({ message: "All credentials are required!" });
//     } else {
//       // Check user existence
//       const sql = `SELECT * FROM users WHERE email = '${email}'`;
//       conn.query(sql, async (error: Error, data: any) => {
//         if (error) {
//           console.log(error);
//           return res.status(500).json({ message: "Internal server error..." });
//         } else {
//           if (data.length === 0) {
//             return res.status(401).json({ message: "Not authorised!" });
//           }
//           // Compare passwords
//           const validPass = await bcrypt.compare(password, data[0].password);
//           if (!validPass) {
//             return res
//               .status(400)
//               .json({ message: "Email or Password invalid!" });
//           } else {
//             // Check if user verified
//             if (data[0].verified === "False") {
//               return res
//                 .status(401)
//                 .json({ message: "Verify account to proceed..." });
//             } else {
//               return res.status(201).json({
//                 user: data[0],
//                 token: generateToken(data[0]),
//                 message: "User logged in successfully!",
//               });
//             }
//           }
//         }
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Internal server error..." });
//   }
// };
// // Forgot password
// const forgotPassword = async (req: IRequest, res: IResponse) => {
//   const user = req.user;
//   if (!user) return res.status(400).json({ message: "Not authorised!" });
//   const number = req.body.number;
//   if (!number) {
//     return res.status(400).json({ message: "Please number is required!" });
//   } else {
//     // Check its existence
//     const sql = `SELECT * FROM users WHERE number = '${number}'`;
//     conn.query(sql, async (error: Error, data: any) => {
//       if (error) {
//         console.log(error);
//         return res.status(500).json({ message: "Internal server error..." });
//       } else {
//         if (data.length === 0) {
//           return res
//             .status(401)
//             .json({ message: "Enter number you signed in with!" });
//         } else {
//           // Generate otp
//           const OTP = otpGenerator.generate(6, {
//             digits: true,
//             lowerCaseAlphabets: false,
//             upperCaseAlphabets: false,
//             specialChars: false,
//           });
//           // console.log(OTP);
//           // Hash otp
//           const hashedOtp = await bcrypt.hash(OTP, 10);
//           // Check its existence
//           const sql = `SELECT * FROM otps WHERE number = '${number}'`;
//           conn.query(sql, async (error: Error, data: any) => {
//             if (error) {
//               console.log(error);
//               return res
//                 .status(500)
//                 .json({ message: "Internal server error..." });
//             } else {
//               // Save otp
//               const sql2 = `INSERT INTO otps (number, otp) VALUES ('${number}', '${hashedOtp}')`;
//               conn.query(sql2, async (error: Error) => {
//                 if (error) {
//                   console.log(error);
//                   return res
//                     .status(500)
//                     .json({ message: "Verify the number please..." });
//                 } else {
//                   // json otp
//                   const message = await tw.messages.create({
//                     from: "+12765985304",
//                     to: number,
//                     body: `Your Verification Code is ${OTP}`,
//                   });
//                   if (!message) {
//                     console.log(error);
//                     return res
//                       .status(500)
//                       .json({ message: "Internal server error..." });
//                   } else {
//                     return res
//                       .status(201)
//                       .json({ message: `Confirmation code sent to ${number}` });
//                   }
//                 }
//               });
//             }
//           });
//         }
//       }
//     });
//   }
// };
// // Resetting password
// const resetPassword = async (req: IRequest, res: IResponse) => {
//   const otp = req.body.otp;
//   const number = req.body.number;
//   const password = req.body.password;
//   if (!otp || !number || !password) {
//     return res.status(400).json({ message: "All credentials are required..." });
//   }
//   // Check existence
//   const sql = `SELECT * FROM otps WHERE number = '${number}'`;
//   conn.query(sql, async (error: Error, data: any) => {
//     if (error) {
//       console.log(error);
//       return res.status(500).json({ message: "Internal server error..." });
//     } else {
//       if (data.length === 0) {
//         return res.status(401).json({ message: "No user found!" });
//       }
//       // Verify otp
//       const validOtp = await bcrypt.compare(otp, data[0].otp);
//       if (!validOtp) {
//         return res.status(401).json({ message: "Invalid code..." });
//       } else {
//         // Reset password
//         const newPass = await bcrypt.hash(password, 10);
//         const sql = `UPDATE users SET password = '${newPass}' WHERE number = '${number}'`;
//         conn.query(sql, async (error: Error) => {
//           if (error) {
//             return res
//               .status(500)
//               .json({ message: "Internal server error..." });
//           } else {
//             conn.query(
//               `SELECT * FROM users WHERE number = '${number}'`,
//               (error: Error, data: any) => {
//                 if (error) {
//                   return res
//                     .status(500)
//                     .json({ message: "Internal server error..." });
//                 } else {
//                   return res.status(201).json({
//                     user: data,
//                     token: generateToken(data[0]),
//                   });
//                 }
//               }
//             );
//             // Delete otp
//             const sql = `DELETE FROM otps WHERE number = '${number}'`;
//             conn.query(sql, async (error: Error) => {
//               if (error) {
//                 return res.status(500).json({
//                   message: "Internal server error...",
//                 });
//               }
//             });
//           }
//         });
//       }
//     }
//   });
// };
// // Upload profile picture
// const uploadPicture = async (req: IRequest, res: IResponse) => {
//   const user = req.user;
//   if (!user) {
//     return res.status(401).json({ message: "Not authorised!" });
//   }
//   try {
//     const sql = `SELECT * FROM users WHERE number = '${user.number}' AND email='${user.email}'`;
//     conn.query(sql, async (error: Error, data: any) => {
//       if (error) {
//         return res.status(500).json({ message: "Internal server error..." });
//       } else {
//         if (!req.files) {
//           return res.status(400).json({ message: "Photo required!" });
//         } else {
//           // get the photo
//           const photo = req.files.photo;
//           if (!photo.mimetype.startsWith("image")) {
//             return res.status(400).json({ message: "Upload a photo please!" });
//           } else {
//             const ext = photo.name.split(".")[1];
//             photo.name = `${user.name}${Date.now()}.${ext}`;
//             try {
//               // Upload photo
//               const profilePic = await cloudinary.uploader.upload(
//                 photo.tempFilePath
//               );
//               if (!profilePic) {
//                 return res
//                   .status(500)
//                   .json({ message: "Internal server error" });
//               } else {
//                 // Save picture to database
//                 const sql = `UPDATE users SET profilePic = '${profilePic.secure_url}', cloudinaryId= '${profilePic.public_id}' WHERE number = '${user.number}'`;
//                 conn.query(sql, async (error: Error) => {
//                   if (error) {
//                     return res
//                       .status(500)
//                       .json({ message: "Internal server error..." });
//                   } else {
//                     // Get user info
//                     const sql = `SELECT * FROM users WHERE number = '${user.number}'`;
//                     conn.query(sql, (error: Error, data: any) => {
//                       if (error) {
//                         return res
//                           .status(500)
//                           .json({ message: "Internal server error..." });
//                       } else {
//                         return res.status(201).json({
//                           user: data[0],
//                           message: "Image uploaded successfully...",
//                         });
//                       }
//                     });
//                   }
//                 });
//               }
//             } catch (error) {
//               console.log(error);
//               return res
//                 .status(500)
//                 .json({ message: "Internal server error..." });
//             }
//           }
//         }
//       }
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Internal server error..." });
//   }
// };
// // Remove profile pic
// const profilePicRemove = async (req: IRequest, res: IResponse) => {
//   const user = req.user;
//   if (!user) {
//     return res.status(401).json({ message: "No user found!" });
//   } else {
//     const userName = user.name;
//     // get user from db
//     const sql = `SELECT * FROM users  WHERE name = '${userName}'`;
//     conn.query(sql, async (error: Error, data: any) => {
//       if (error) {
//         return res.status(500).json({ message: "Internal server error..." });
//       } else {
//         if (data.length === 0) {
//           return res.status(401).json({ message: "No user found!" });
//         } else {
//           // require password
//           const password = req.body.password;
//           if (!password) {
//             return res
//               .status(400)
//               .json({ message: "Password required to remove!" });
//           } else {
//             // Compare passwords
//             const validPass = await bcrypt.compare(password, data[0].password);
//             if (!validPass) {
//               return res.status(400).json({ message: "Invalid password..." });
//             } else {
//               // remove profile pic
//               const sql = `UPDATE users SET profilePic = '', cloudinaryId= '' WHERE name = '${userName}'`;
//               // const sql = `SELECT * FROM users WHERE password = '${validPass}'`
//               conn.query(sql, async (error: Error) => {
//                 if (error) {
//                   console.log(error);
//                   return res
//                     .status(500)
//                     .json({ message: "Internal server error..." });
//                 } else {
//                   // get user
//                   const sql = `SELECT * FROM users  WHERE name = '${userName}'`;
//                   conn.query(sql, async (error: Error, data: any) => {
//                     if (error) {
//                       return res
//                         .status(500)
//                         .json({ message: "Internal server error..." });
//                     } else {
//                       return res.status(201).json({
//                         user: data[0],
//                         message: "Profile pic removed...",
//                       });
//                     }
//                   });
//                 }
//               });
//             }
//           }
//         }
//       }
//     });
//   }
// };
// // Get any user profile
// const getAnyUserProfile = async (req: IRequest, res: IResponse) => {
//   const user = req.user;
//   if (!user) return res.status(400).json({ message: "Not authorised" });
//   // Get user from url
//   const userName = req.params.user;
//   // Get user from db
//   const sql = `SELECT * FROM users WHERE name = '${userName}'`;
//   conn.query(sql, async (error: Error, data: any) => {
//     if (error) {
//       return res.status(500).json({ message: "Internal server error..." });
//     } else {
//       if (data.length === 0) {
//         return res.status(401).json({ message: "No user found!" });
//       }
//       if (data[0].number === user.number)
//         return res.status(400).json({ message: "Visit your profile!" });
//       return res.status(201).json({
//         user: data[0],
//       });
//     }
//   });
// };
// // Get my profile from token
// const getUserProfile = async (req: IRequest, res: IResponse) => {
//   const user = req.user;
//   if (!user) {
//     return res.status(401).json({ message: "Not authorised!" });
//   } else {
//     return res.status(201).json({
//       user,
//     });
//   }
// };
// // Update user profile
// const updateProfile = async (req: IRequest, res: IResponse) => {
//   const user = req.user;
//   if (!user) {
//     return res.status(401).json({ message: "Not authorised!" });
//   }
//   if (user.name !== req.params.user)
//     return res
//       .status(400)
//       .json({ message: "Not authorised to perform this action!" });
//   // Get username from url
//   const userName = req.params.user;
//   // compare with the token username
//   if (userName !== user.name) {
//     return res.status(401).json({
//       message: "Not authorised!",
//     });
//   } else {
//     const newUsername = req.body.username ? req.body.username : user.name;
//     const newEmail = req.body.email ? req.body.email : user.email;
//     const newNumber = req.body.number ? req.body.number : user.number;
//     const newposition = req.body.position ? req.body.position : user.position;
//     const church = req.body.position ? req.body.church : user.church;
//     // Confirm using password
//     const password = req.body.password;
//     if (!password || !(await bcrypt.compare(password, user.password))) {
//       return res
//         .status(403)
//         .json({ message: "Confirm password to proceed..." });
//     } else {
//       // Update the user profile
//       const sql = `UPDATE users SET name = '${newUsername}', email='${newEmail}' , number='${newNumber}' , church ='${church}', position='${newposition.toLowerCase()}' WHERE name = '${
//         user.name
//       }' AND number='${user.number}'`;
//       conn.query(sql, async (error: Error) => {
//         if (error) {
//           console.log(error);
//           return res.status(500).json({ message: "Internal server error..." });
//         } else {
//           // Get the user
//           const sql = `SELECT * FROM users WHERE number = '${newNumber}' AND email='${newEmail}'`;
//           conn.query(sql, async (error: Error, data: any) => {
//             if (error)
//               return res
//                 .status(500)
//                 .json({ message: "Internal server error..." });
//             if (data.length === 0)
//               return res.status(401).json({ message: "No user found!" });
//             return res.status(201).json({
//               user: data[0],
//               message: "User profile data updated successfully!",
//               token: generateToken(data[0]),
//             });
//           });
//         }
//       });
//     }
//   }
// };
// // Delete user profile
// const deleteMyAccount = async (req: IRequest, res: IResponse) => {
//   const user = req.user;
//   if (!user) {
//     return res.status(401).json({ message: "Not authorised!" });
//   }
//   // user from url
//   const userName = req.params.user;
//   // compare with the current user
//   if (userName !== user.name) {
//     return res.status(403).json({ message: "Not authorised!" });
//   } else {
//     // confirm using password
//     const password = req.body.password;
//     if (!password) {
//       return res.status(400).json({ message: "Password is required!" });
//     } else {
//       // compare to the token password
//       const validPass = await bcrypt.compare(password, user.password);
//       if (!validPass) {
//         return res.status(400).json({ message: "Invalid password..." });
//       } else {
//         // Delete the user from database
//         const sql = `DELETE FROM users WHERE number = '${user.number}' AND email = '${user.email}' AND name='${user.name}'`;
//         conn.query(sql, async (error: Error) => {
//           if (error) {
//             return res
//               .status(500)
//               .json({ message: "Internal server error..." });
//           } else {
//             return res
//               .status(200)
//               .json({ message: "User account deleted successfully..." });
//           }
//         });
//       }
//     }
//   }
// };
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
