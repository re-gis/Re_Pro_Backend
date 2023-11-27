import jwt from "jsonwebtoken";
import IRequest from "../interfaces/IRequest";
import IResponse from "../interfaces/IResponse";
import { NextFunction } from "express";
import User from "../entities/User.entity";
import { getRepository, Repository } from "typeorm";
import { EPosition } from "../enums/Enums";
const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "re_pro",
});

export const protect = async (
  req: IRequest,
  res: IResponse,
  next: NextFunction
) => {
  let userRepo: Repository<User> = getRepository(User);
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      //Getting the token from the header
      token = req.headers.authorization.split(" ")[1];

      //Verify the token
      // @ts-ignore
      jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
        if (error) return res.status(400).json({ message: "Invalid token!" });
        //@ts-ignore
        const user_id = decoded.id;

        const user = await userRepo.findOne({ where: { id: user_id } });
        console.log(user);

        if (!user) {
          return res.status(403).json({
            message: "Not authorised!",
          });
        }

        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          church: user.church,
          position: user.position,
          verified: user.verified,
          documents: user.documents,
        };

        next();
      });
    } else {
      return res.json({
        message: "Not authorized",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

export const role = (...roles: EPosition[]) => {
  return (req: IRequest, res: IResponse, next: NextFunction) => {
    if (roles[0] != req.user.position) {
      return res
        .status(403)
        .json({ message: "You are not authorised to perform this action..." });
    } else {
      next();
    }
  };
};

export const isVerified = () => {
  return (req: IRequest, res: IResponse, next: NextFunction) => {
    console.log("hy")
    if (req.user.verified != true) {
      return res
        .status(403)
        .json({ message: "Verify the account to continue..." });
    } else {
      next();
    }
  };
};
