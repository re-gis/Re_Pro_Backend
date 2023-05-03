const Joi = require("joi");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/mysql/mysql");
require("dotenv").config();
const twilio = require("twilio")(process.env.SID, process.env.AUTH_TOKEN);
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const { cloudinary } = require("../config/cloudinary/cloudinary");

const object = Joi.object({
  name: Joi.string().min(5).max(100),
  email: Joi.string().min(3).email().max(200).required(),
  password: Joi.string().min(8).max(100).required(),
  number: Joi.string().required(),
});

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "re_pro",
});

// Generate token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id,
      number: user.number,
      verified: user.verified,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

// User register
const userRegister = async (req, res) => {
  try {
    const { email, number, password, name } = req.body;
    if (!email || !password || !number || !name) {
      return res.status(400).send({ message: "All credentials are required!" });
    } else {
      const { error } = object.validate(req.body);
      if (error) {
        return res.status(400).send({ message: error.details[0].message });
      } else {
        let sql = `SELECT * FROM users WHERE email = '${email}' OR number = '${number}'`;
        conn.query(sql, async (error, data) => {
          if (error) {
            return res
              .status(500)
              .send({ message: "Internal server error..." });
          } else {
            if (data.length !== 0) {
              return res.status(400).send({ message: "User already exists!" });
            } else {
              // Generate otp
              const OTP = otpGenerator.generate(6, {
                digits: true,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
              });

              // Hash otp
              const hashedOtp = await bcrypt.hash(OTP, 10);

              // check the otp existence
              const sql = `SELECT * FROM otps WHERE number = '${number}'`;
              conn.query(sql, async (error, data) => {
                if (error) {
                  console.log(error);
                  return res
                    .status(500)
                    .send({ message: "Internal server error..." });
                } else {
                  // Save otp to database
                  const sql2 = `INSERT INTO otps (number, otp) VALUES ('${number}', '${hashedOtp}')`;
                  conn.query(sql2, async (error, data) => {
                    if (error) {
                      console.log(error);
                      return res
                        .status(500)
                        .send({ message: "Internal server error..." });
                    } else {
                      try {
                        // Send otp
                        const message = await twilio.messages.create({
                          from: "+12765985304",
                          to: number,
                          body: `Your Verification Code is ${OTP}`,
                        });

                        if (!message) {
                          console.log(error);
                          return res
                            .status(500)
                            .send({ message: "Internal server error..." });
                        } else {
                          const hashedPass = await bcrypt.hash(password, 10);
                          // Save user
                          const sql = `INSERT INTO users (email, password, number, name) VALUES ('${email}', '${hashedPass}', '${number}', '${name}')`;
                          conn.query(sql, async (error, data) => {
                            if (error) {
                              return res
                                .status(500)
                                .send({ message: "Internal server error..." });
                            } else {
                              // Get user
                              const sql = `SELECT * FROM users WHERE email = '${email}' AND number = '${number}'`;
                              conn.query(sql, (error, data) => {
                                if (error) {
                                  console.log(error);
                                  return res.status(500).send({
                                    message: "Internal server error...",
                                  });
                                } else {
                                  console.log(OTP);
                                  return res.status(201).send({
                                    data,
                                    token: generateToken(data[0]),
                                    message: `Code sent to ${number} verify to proceed...`,
                                  });
                                }
                              });
                            }
                          });
                        }
                      } catch (error) {
                        console.log(error);
                        return res
                          .status(500)
                          .send({ message: "Internal server error..." });
                      }
                    }
                  });
                }
              });
            }
          }
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error..." });
  }
};

// Verify otp
const verifyOtp = async (req, res) => {
  try {
    const number = req.body.number;
    const otp = req.body.otp;

    // Check otp existence
    const sql = `SELECT * FROM otps WHERE number = '${number}'`;
    conn.query(sql, async (error, data) => {
      if (error) {
        return res.status(400).send({ message: "Internal server error..." });
      } else {
        // console.log(data)
        if (data.length == 0) {
          return res.status(400).send({ message: "Invalid Code!" });
        } else {
          // Compare otp
          const validOtp = await bcrypt.compare(otp, data[0].otp);
          if (!validOtp) {
            return res.status(400).send({ message: "Invalid code!" });
          } else {
            // Delete code
            const sql = `DELETE FROM otps WHERE number = '${number}'`;
            conn.query(sql, async (error, data) => {
              if (error) {
                return res
                  .status(500)
                  .send({ message: "Internal server error..." });
              } else {
                // Update user verification
                const sql = `UPDATE users SET verified = 'True' WHERE number = '${number}'`;
                conn.query(sql, async (error, data) => {
                  if (error) {
                    return res
                      .status(500)
                      .send({ message: "Internal server error..." });
                  } else {
                    // Get user
                    const sql = `SELECT * FROM users WHERE number = '${number}'`;
                    conn.query(sql, async (error, data) => {
                      if (error) {
                        return res
                          .status(500)
                          .send({ message: "Internal server error..." });
                      } else {
                        return res.status(201).send({
                          data,
                          token: generateToken(data[0]),
                          message: "User verified...",
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// Update user stats
const updateUserStats = async (req, res) => {
  if (!user) {
    return res.status(404).send({ message: "User not found!" });
  }
  try {
    const { position, church, language, idNumber } = req.body;
    if (!position || !church || !language || !idNumber) {
      return res.status(400).send({ message: "All inputs are required!" });
    } else {
      // Get user to update
      const sql2 = `SELECT * FROM users WHERE number = '${user.number}'`;
      const number = user.number;
      conn.query(sql2, async (error, data) => {
        if (error) {
          console.log(error);
          return res.status(500).send({ message: "Internal server error..." });
        } else {
          // Update user
          const sql = `UPDATE users SET position = '${position}', church = '${church}', language = '${language}', idNumber = '${idNumber}'`;
          conn.query(sql, async (error, data) => {
            if (error) {
              console.log(error);
              return res
                .status(500)
                .send({ message: "Internal server error..." });
            } else {
              // Get the user to return
              const sql = `SELECT * FROM users WHERE number = '${number}'`;
              conn.query(sql, async (error, data) => {
                if (error) {
                  console.log(error);
                  return res
                    .status(500)
                    .send({ message: "Internal server error..." });
                } else {
                  return res.status(201).send({
                    data,
                    token: generateToken(data),
                    message: "User stats updated...",
                  });
                }
              });
            }
          });
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error..." });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).send({ message: "All credentials are required!" });
    } else {
      // Check user existence
      const sql = `SELECT * FROM users WHERE email = '${email}'`;
      conn.query(sql, async (error, data) => {
        if (error) {
          return res.status(500).send({ message: "Internal server error..." });
        } else {
          if (data.length === 0) {
            return res.status(404).send({ message: "User not found!" });
          }
          // Compare passwords
          const validPass = await bcrypt.compare(password, data[0].password);
          if (!validPass) {
            return res
              .status(400)
              .send({ message: "Email or Password invalid!" });
          } else {
            // Check if user verified
            if (data[0].verified === "False") {
              return res
                .status(401)
                .send({ message: "Verify account to proceed..." });
            } else {
              return res.status(201).send({
                user: data[0],
                token: generateToken(data[0]),
                message: "User logged in successfully!",
              });
            }
          }
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error..." });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  const number = req.body.number;
  if (!number) {
    return res.status(400).send({ message: "Please number is required!" });
  } else {
    // Check its existence
    const sql = `SELECT * FROM users WHERE number = '${number}'`;
    conn.query(sql, async (error, data) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal server error..." });
      } else {
        if (data.length === 0) {
          return res
            .status(404)
            .send({ message: "Enter number you signed in with!" });
        } else {
          // Generate otp
          const OTP = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
          });
          // console.log(OTP);

          // Hash otp
          const hashedOtp = await bcrypt.hash(OTP, 10);

          // Check its existence
          const sql = `SELECT * FROM otps WHERE number = '${number}'`;
          conn.query(sql, async (error, data) => {
            if (error) {
              console.log(error);
              return res
                .status(500)
                .send({ message: "Internal server error..." });
            } else {
              // Save otp
              const sql2 = `INSERT INTO otps (number, otp) VALUES ('${number}', '${hashedOtp}')`;
              conn.query(sql2, async (error) => {
                if (error) {
                  console.log(error);
                  return res
                    .status(500)
                    .send({ message: "Verify the number please..." });
                } else {
                  // Send otp
                  const message = await twilio.messages.create({
                    from: "+12765985304",
                    to: number,
                    body: `Your Verification Code is ${OTP}`,
                  });

                  if (!message) {
                    console.log(error);
                    return res
                      .status(500)
                      .send({ message: "Internal server error..." });
                  } else {
                    return res
                      .status(201)
                      .send({ message: `Confirmation code sent to ${number}` });
                  }
                }
              });
            }
          });
        }
      }
    });
  }
};

// Resetting password
const resetPassword = async (req, res) => {
  const otp = req.body.otp;
  const number = req.body.number;
  const password = req.body.password;

  if (!otp || !number || !password) {
    return res.status(400).send({ message: "All credentials are required..." });
  }
  // Check existence
  const sql = `SELECT * FROM otps WHERE number = '${number}'`;
  conn.query(sql, async (error, data) => {
    if (error) {
      console.log(error);
      return res.status(500).send({ message: "Internal server error..." });
    } else {
      if (data.length === 0) {
        return res.status(404).send({ message: "User not found!" });
      }
      // Verify otp
      const validOtp = await bcrypt.compare(otp, data[0].otp);
      if (!validOtp) {
        return res.status(404).send({ message: "Invalid code..." });
      } else {
        // Reset password
        const newPass = await bcrypt.hash(password, 10);
        const sql = `UPDATE users SET password = '${newPass}' WHERE number = '${number}'`;
        conn.query(sql, async (error) => {
          if (error) {
            return res
              .status(500)
              .send({ message: "Internal server error..." });
          } else {
            conn.query(
              `SELECT * FROM users WHERE number = '${number}'`,
              (error, data) => {
                if (error) {
                  return res
                    .status(500)
                    .send({ message: "Internal server error..." });
                } else {
                  return res.status(201).send({
                    user: data,
                    token: generateToken(data[0]),
                  });
                }
              }
            );

            // Delete otp
            const sql = `DELETE FROM otps WHERE number = '${number}'`;
            conn.query(sql, async (error) => {
              if (error) {
                return res.status(500).send({
                  message: "Internal server error...",
                });
              }
            });
          }
        });
      }
    }
  });
};

// Upload profile picture
const uploadPicture = async (req, res) => {
  if (!user) {
    return res.status(404).send({ message: "User not found!" });
  }
  try {
    const sql = `SELECT * FROM users WHERE number = '${user.number}' AND email='${user.email}'`;
    conn.query(sql, async (error, data) => {
      if (error) {
        return res.status(500).send({ message: "Internal server error..." });
      } else {
        if (!req.files) {
          return res.status(400).send({ message: "Photo required!" });
        } else {
          // get the photo
          const photo = req.files.photo;
          if (!photo.mimetype.startsWith("image")) {
            return res.status(400).send({ message: "Upload a photo please!" });
          } else {
            const ext = photo.name.split(".")[1];
            photo.name = `${user.name}${Date.now()}.${ext}`;
            try {
              // Upload photo
              const profilePic = await cloudinary.uploader.upload(
                photo.tempFilePath
              );

              if (!profilePic) {
                return res
                  .status(500)
                  .send({ message: "Internal server error" });
              } else {
                // Save picture to database
                const sql = `UPDATE users SET profilePic = '${profilePic.secure_url}', cloudinaryId= '${profilePic.public_id}' WHERE number = '${user.number}'`;
                conn.query(sql, async (error) => {
                  if (error) {
                    return res
                      .status(500)
                      .send({ message: "Internal server error..." });
                  } else {
                    // Get user info
                    const sql = `SELECT * FROM users WHERE number = '${user.number}'`;
                    conn.query(sql, (error, data) => {
                      if (error) {
                        return res
                          .status(500)
                          .send({ message: "Internal server error..." });
                      } else {
                        return res.status(201).send({
                          user: data[0],
                          message: "Image uploaded successfully...",
                        });
                      }
                    });
                  }
                });
              }
            } catch (error) {
              console.log(error);
              return res
                .status(500)
                .send({ message: "Internal server error..." });
            }
          }
        }
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error..." });
  }
};

// Remove profile pic
const profilePicRemove = async (req, res) => {
  if (!user) {
    return res.status(404).send({ message: "No user found!" });
  } else {
    const userName = user.name;
    // get user from db
    const sql = `SELECT * FROM users  WHERE name = '${userName}'`;
    conn.query(sql, async (error, data) => {
      if (error) {
        return res.status(500).send({ message: "Internal server error..." });
      } else {
        if (data.length === 0) {
          return res.status(404).send({ message: "User not found!" });
        } else {
          // require password
          const password = req.body.password;
          if (!password) {
            return res
              .status(400)
              .send({ message: "Password required to remove!" });
          } else {
            // Compare passwords
            const validPass = await bcrypt.compare(password, data[0].password);
            if (!validPass) {
              return res.status(400).send({ message: "Invalid password..." });
            } else {
              // remove profile pic
              const sql = `UPDATE users SET profilePic = '', cloudinaryId= '' WHERE name = '${userName}'`;
              // const sql = `SELECT * FROM users WHERE password = '${validPass}'`
              conn.query(sql, async (error) => {
                if (error) {
                  console.log(error);
                  return res
                    .status(500)
                    .send({ message: "Internal server error..." });
                } else {
                  // get user
                  const sql = `SELECT * FROM users  WHERE name = '${userName}'`;
                  conn.query(sql, async (error, data) => {
                    if (error) {
                      return res
                        .status(500)
                        .send({ message: "Internal server error..." });
                    } else {
                      return res.status(201).send({ user: data[0] });
                    }
                  });
                }
              });
            }
          }
        }
      }
    });
  }
};

// Get any user profile
const getAnyUserProfile = async (req, res) => {
  // Get user from url
  const userName = req.params.user;
  // Get user from db
  const sql = `SELECT * FROM users WHERE name = '${userName}'`;
  conn.query(sql, async (error, data) => {
    if (error) {
      return res.status(500).send({ message: "Internal server error..." });
    } else {
      if (data.length === 0) {
        return res.status(404).send({ message: "User not found!" });
      }
      return res.status(201).send({
        user: data[0],
      });
    }
  });
};

// Get my profile from token
const getUserProfile = async (req, res) => {
  if (!user) {
    return res.status(404).send({ message: "User not found!" });
  } else {
    return res.status(201).send({
      user,
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  if(!user) {
    return res.status(404).send({message: 'User not found!'})
  }
  // Get username from url
  const userName = req.params.user;
  console.log(userName);
  console.log(user);
  // compare with the token username
  if (userName !== user.name) {
    return res.status(404).send({
      message: "User not found!",
    });
  } else {
    // update the current user
    // const sql = `UPDATE users SET `
  }
};

// Delete user profile
const deleteMyAccount = async (req, res) => {
  if(!user) {
    return res.status(404).send({message: 'User not found!'})
  }
  // user from url
  const userName = req.params.user;
  // compare with the current user
  if (userName !== user.name) {
    return res.status(403).send({ message: "Not authorised!" });
  } else {
    // confirm using password
    const password = req.body.password;
    if (!password) {
      return res.status(400).send({ message: "Password is required!" });
    } else {
      // compare to the token password
      const validPass = await bcrypt.compare(password, user.password);
      if (!validPass) {
        return res.status(400).send({ message: "Invalid password..." });
      } else {
        // Delete the user from database
        const sql = `DELETE FROM users WHERE number = '${user.number}' AND email = '${user.email}' AND name='${user.name}'`;
        conn.query(sql, async (error) => {
          if (error) {
            return res
              .status(500)
              .send({ message: "Internal server error..." });
          } else {
            return res
              .status(200)
              .send({ message: "User account deleted successfully..." });
          }
        });
      }
    }
  }
};

// Total workers
const getTotalWorkers = async (req, res) => {
  // get users number
  const sql = `SELECT * FROM users`;
  conn.query(sql, (error, data) => {
    if (error) {
      return res.status(500).send({ message: "Internal server error..." });
    } else {
      return res.status(201).send({
        users: data,
        totalNumber: data.length,
      });
    }
  });
};

// Get pastors
const getPastors = async (req, res) => {
  // get users whose position = pastor
  const sql = `SELECT * FROM users WHERE position = 'pastor'`;
  conn.query(sql, (error, data) => {
    if (error) {
      return res.status(500).send({ message: "Internal server error..." });
    } else {
      return res.status(201).send({
        pastors: data,
        totalNumber: data.length,
      });
    }
  });
};

module.exports = {
  userRegister,
  verifyOtp,
  updateUserStats,
  loginUser,
  forgotPassword,
  resetPassword,
  uploadPicture,
  getAnyUserProfile,
  updateProfile,
  profilePicRemove,
  getUserProfile,
  deleteMyAccount,
  getTotalWorkers,
  getPastors,
};
