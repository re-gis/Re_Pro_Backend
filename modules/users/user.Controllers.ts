import Joi from "joi";
const otpGenerator = require("otp-generator");
import bcryptjs from "bcryptjs";
require("dotenv").config();
import twilio from "twilio";
const tw = twilio(process.env.SID, process.env.AUTH_TOKEN);
import jwt from "jsonwebtoken";
import User from "../../entities/User.entity";
import IRequest from "../../interfaces/IRequest";
import IResponse from "../../interfaces/IResponse";
import { FindOneOptions, getRepository, Repository } from "typeorm";
import Otp from "../../entities/otp.entity";
import { EPosition } from "../../enums/Enums";
import cloudinary from "../../config/cloudinary";

const object = Joi.object({
  email: Joi.string().min(3).email().max(200).required(),
  password: Joi.string().min(8).max(100).required(),
  number: Joi.string().required(),
  name: Joi.string().required(),
  position: Joi.string().required(),
});

// Generate token
const generateToken = (user: User) => {
  return jwt.sign(
    {
      id: user.id,
      number: user.number,
      verified: user.verified,
    },
    //@ts-ignore
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

// User register
export const userRegister = async (
  req: IRequest,
  res: IResponse
): Promise<IResponse> => {
  const otpRepo: Repository<Otp> = getRepository(Otp, "default");
  const userRepo: Repository<User> = getRepository(User, "default");

  const findByEmailOrNumber = async (
    email: string,
    number: string
  ): Promise<User | undefined | null> => {
    const user: User | undefined | null = await userRepo.findOne({
      where: [{ email }, { number }],
    } as FindOneOptions<User>);

    return user;
  };
  try {
    const { email, number, password, name } = req.body;
    let position:any = req.body.position;
    if (!email || !password || !number || !name || !position) {
      return res.status(400).json({ message: "All credentials are required!" });
    } else {
      const { error } = object.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      } else {
        const euser = await findByEmailOrNumber(email, number);

        if (euser) {
          return res.status(400).json({ message: "User already exists!" });
        } else {
          // Generate otp
          const OTP: string = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
          });
          console.log(OTP);

          // Hash otp
          const hashedOtp = bcryptjs.hashSync(OTP, 10);

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

          // const message = await tw.messages.create({
          //   from: "+12765985304",
          //   to: number,
          //   body: `Your Verification Code is ${OTP}`,
          // });

          // if (!message) {
          //   console.log(error);
          //   return res
          //     .status(500)
          //     .json({ message: "Internal server error..." });
          // } else {
            const hashedPass = bcryptjs.hashSync(password, 10);
            // Save user
            const profile: string =
              "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Fblank-profile-pic&psig=AOvVaw1kAh7UoZf3vqRdoN82Zab4&ust=1700721974142000&source=images&cd=vfe&ved=0CBIQjRxqFwoTCMCRs56B14IDFQAAAAAdAAAAABAE";


              let ps: string = position.toLowerCase();
              switch (ps) {
                case "secretary":
                  position = EPosition.SECRETARY;
                  break;

                case "bishop":
                  position = EPosition.BISHOP;
                  break;

                case "pastor":
                  position = EPosition.PASTOR;
                  break;

                case "admin":
                  position = EPosition.SUPER;
                  break;

                case "evangelist":
                  position = EPosition.EVANGELIST;
                  break;

                case "human resource":
                  position = EPosition.HUMRE;
                  break;

                case "pos":
                  position = EPosition.POs;
                  break;

                case "super":
                  position = EPosition.SUPER;
                  break;

                default:
                  return res
                    .status(403)
                    .json({ message: "Position not allowed..." });
              }

            const user = new User(email, hashedPass, number, name, profile);
            user.position = position
            // Save user
            await userRepo.save(user);
            await otpRepo.save(otp);

            return res.status(201).json({
              message: "User registered successfully, verify to continue...",
            });
          // }
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error..." });
  }
};

// Verify otp
export const verifyOtp = async (
  req: IRequest,
  res: IResponse
): Promise<IResponse> => {
  const otpRepo: Repository<Otp> = getRepository(Otp, "default");
  const userRepo: Repository<User> = getRepository(User, "default");
  try {
    const number: string = req.body.number;
    const otp: string = req.body.otp;

    // Check otp existence
    const eotp = await otpRepo.findOneBy({ number });
    if (!eotp) {
      return res.status(404).json({ message: "Invalid Code..." });
    }

    //compare the otps
    if (!bcryptjs.compareSync(otp, eotp.otp) || number !== eotp.number) {
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
    await userRepo.save(user);
    return res.status(200).json({
      message: "Account verified successfully...",
      token: generateToken(user),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error..." });
  }
};

// Update user stats
export const updateUserStats = async (
  req: IRequest,
  res: IResponse
): Promise<IResponse> => {
  const userRepo: Repository<User> = getRepository(User, "default");
  const user: Partial<User> = req.user;
  if (!user) {
    return res.status(401).json({ message: "Not authorised!" });
  }
  try {
    let { position, church, language, idNumber } = req.body;
    if (!position || !church || !language || !idNumber) {
      return res.status(400).json({ message: "All inputs are required!" });
    } else {
      // Get user to update
      const euser = await userRepo.findOne({
        where: { number: user.number, email: user.email },
      });

      if (!euser) {
        return res
          .status(404)
          .json({ message: `User ${user.email} not found!` });
      }
      let ps: string = position.toLowerCase();
      switch (ps) {
        case "secretary":
          position = EPosition.SECRETARY;
          break;

        case "bishop":
          position = EPosition.BISHOP;
          break;

        case "pastor":
          position = EPosition.PASTOR;
          break;

        case "admin":
          position = EPosition.SUPER;
          break;

        case "evangelist":
          position = EPosition.EVANGELIST;
          break;

        case "human resource":
          position = EPosition.HUMRE;
          break;

        case "pos":
          position = EPosition.POs;
          break;

        case "super":
          position = EPosition.SUPER;
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
      if (!u) return res.status(404).json({ message: "User not found!" });
      return res.status(201).json({
        message: "User updated successfully...",
        token: generateToken(u),
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error..." });
  }
};

// Login user
export const loginUser = async (req: IRequest, res: IResponse) => {
  try {
    const email: string = req.body.email;
    const password: string = req.body.password;

    const userRepo: Repository<User> = getRepository(User);

    if (!email || !password) {
      return res.status(400).json({ message: "All credentials are required!" });
    } else {
      // Check user existence
      const euser: User | null | undefined = await userRepo.findOne({
        where: { email },
      });
      if (!euser)
        return res
          .status(403)
          .json({ message: "Invalid email or password..." });

      if (!bcryptjs.compareSync(password, euser.password))
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error..." });
  }
};

// Forgot password
export const forgotPassword = async (
  req: IRequest,
  res: IResponse
): Promise<IResponse> => {
  const userRepo: Repository<User> = getRepository(User);
  const otpRepo: Repository<Otp> = getRepository(Otp);
  const user: User = req.user;

  if (!user) return res.status(400).json({ message: "Not authorised!" });

  // Check its existence
  const u = await userRepo.findOne({
    where: { number: user.number, email: user.email },
  });
  if (!u) return res.status(404).json({ message: "User not found!" });

  // send the otp to the user's number
  const otp: string = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const hashedOtp: string = bcryptjs.hashSync(otp, 10);
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

    const newOtp = new Otp(u.number, hashedOtp);
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

  const newOtp = new Otp(u.number, hashedOtp);
  await otpRepo.save(newOtp);

  return res.status(201).json({
    message: `Code sent to ${u.number}, verify to continue resetting password...`,
  });
};

// Resetting password
export const resetPassword = async (
  req: IRequest,
  res: IResponse
): Promise<IResponse> => {
  const otpRepo: Repository<Otp> = getRepository(Otp);
  const UserRepo: Repository<User> = getRepository(User);
  const otp: string = req.body.otp;
  const password: string = req.body.password;

  const user: User = req.user;

  if (!otp || !password) {
    return res.status(400).json({ message: "All credentials are required..." });
  }
  // Check existence
  const eo = await otpRepo.findOne({ where: { number: user.number } });
  if (!eo) {
    return res.status(400).json({ message: "Otp not found!" });
  }

  // compare otps
  if (!bcryptjs.compareSync(otp, eo.otp)) {
    return res.status(403).json({ message: "Invalid code provided..." });
  }

  // get new Password
  const hashedPass: string = await bcryptjs.hashSync(password, 10);
  // update the user
  const eu = await UserRepo.findOne({
    where: { email: user.email, number: user.number },
  });
  if (!eu) return res.status(404).json({ message: "User not found!" });

  eu.password = hashedPass;
  await UserRepo.save(eu);

  return res.status(201).json({
    message: "Password reset successfully!",
    token: generateToken(eu),
  });
};

// Upload profile picture
export const uploadPicture = async (
  req: IRequest,
  res: IResponse
): Promise<IResponse> => {
  const userRepo: Repository<User> = getRepository(User);
  const user: User = req.user;
  if (!user) {
    return res.status(403).json({ message: "Not authorised!" });
  }
  try {
    const u = await userRepo.findOne({
      where: { email: user.email, number: user.number },
    });
    if (!u) return res.status(404).json({ message: "User not found!" });

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
      const profilePic = await cloudinary.uploader.upload(photo.tempFilePath);
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
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error..." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error..." });
  }
};

// Remove profile pic
export const profilePicRemove = async (
  req: IRequest,
  res: IResponse
): Promise<IResponse> => {
  const userRepo: Repository<User> = getRepository(User);
  const user: User = req.user;
  const password: string = req.body.password;
  if (!user) {
    return res.status(401).json({ message: "No user found!" });
  } else {
    const u = await userRepo.findOne({
      where: { email: user.email, number: user.number },
    });
    if (!u) return res.status(404).json({ message: "User not found!" });

    if (!password)
      return res.status(400).json({ message: "Password is required!" });

    if (!bcryptjs.compareSync(password, u.password))
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

// Get any user profile
export const getAnyUserProfile = async (
  req: IRequest,
  res: IResponse
): Promise<IResponse> => {
  const user: User = req.user;
  const userRepo: Repository<User> = getRepository(User);
  if (!user) return res.status(400).json({ message: "Not authorised" });
  // Get user from url
  const userName: string = req.params.user;

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

// Get my profile from token
export const getUserProfile = async (
  req: IRequest,
  res: IResponse
): Promise<IResponse> => {
  const user: User = req.user;
  if (!user) {
    return res.status(401).json({ message: "Not authorised!" });
  } else {
    return res.status(201).json({
      user,
    });
  }
};

// Update user profile
export const updateProfile = async (req: IRequest, res: IResponse) => {
  const userRepo: Repository<User> = getRepository(User);
  const user: User = req.user;
  const password: string = req.body.password;
  const { name, email, church, language, number, idNumber } = req.body;
  if (!user) {
    return res.status(401).json({ message: "Not authorised!" });
  }

  const u = await userRepo.findOne({
    where: { number: user.number, email: user.email },
  });
  if (!u) return res.status(404).json({ message: "User not found!" });

  const updatedFiels: Partial<User> = {
    name: name || u.name,
    email: email || u.email,
    church: church || u.church,
    language: language || u.language,
    number: number || u.number,
    idNumber: idNumber || u.idNumber,
  };

  if (!password)
    return res.status(401).json({ message: "Password is required!" });

  if (!(await bcryptjs.compare(password, u.password)))
    return res.status(401).json({ message: "Invalid password provided!" });

  Object.assign(u, updatedFiels);
  await userRepo.save(u);
  return res.status(201).json({
    message: "User stats updated successfully...",
    token: generateToken(u),
  });
};

// Delete user profile
export const deleteMyAccount = async (
  req: IRequest,
  res: IResponse
): Promise<IResponse> => {
  const userRepo: Repository<User> = getRepository(User);
  const user: User = req.user;
  if (!user) {
    return res.status(401).json({ message: "Not authorised!" });
  }

  const password: string = req.body.password;

  if (!password)
    return res
      .status(400)
      .json({ message: "Password is required to delete the account..." });

  const u = await userRepo.findOne({
    where: { email: user.email, number: user.number },
  });
  if (!u) return res.status(404).json({ message: "User not found!" });

  if (!(await bcryptjs.compare(password, u.password))) {
    return res.status(401).json({ message: "Invalid password provided..." });
  }

  // delete the account
  await userRepo.remove(u);
  return res
    .status(200)
    .json({ message: "User account deleted successfully..." });
};

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
