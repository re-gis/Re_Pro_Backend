import { NextFunction } from "express";
import IRequest from "../../interfaces/IRequest";
import IResponse from "../../interfaces/IResponse";
import { EPosition } from "../../enums/Enums";
import { Repository, getRepository } from "typeorm";
import User from "../../entities/User.entity";

export const updateUserStats = async (
  req: IRequest,
  res: IResponse,
  next: NextFunction
): Promise<IResponse> => {
  try {
    const userRepo: Repository<User> = getRepository(User);
    const user_id = req.params.user;
    const user: User | null = await userRepo.findOneBy({ id: user_id });
    if (!user) return res.status(404).json({ message: "User not found!" });
    let { position, church, language, idNumber, name, email, number } = req.body;

    if (!user) {
      return res.status(404).json({ message: `User ${user_id} not found!` });
    }
    if (position != "" && position != undefined) {
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
    }
   const updatedFiels: Partial<User> = {
     name: name || user.name,
     email: email || user.email,
     church: church || user.church,
     language: language || user.language,
     number: number || user.number,
     idNumber: idNumber || user.idNumber,
   };

     Object.assign(user, updatedFiels);
    await userRepo.save(user);

    return res.status(201).json({
      message: "User updated successfully...",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error..." });
  }
};

export const deleteUser = async (
  req: IRequest,
  res: IResponse
): Promise<IResponse> => {
  try {
    const userRepo: Repository<User> = getRepository(User);
    const userId = req.params.user;
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) return res.status(404).json({ message: "User not found!" });

    // delete the user
    const { password } = req.body;
    if (!password)
      return res
        .status(401)
        .json({ message: "Password is required to delete account" });
    await userRepo.remove(user);
    return res.status(200).json({ message: "User removed successfully!" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error..." });
  }
};

export const getAllUses = async (
  req: IRequest,
  res: IResponse
): Promise<IResponse> => {
  try {
    const userRepo: Repository<User> = getRepository(User);
    const users = await userRepo.find();
    if (users.length == 0) {
      return res.status(404).json({ message: "Users not found!" });
    }
    return res
      .status(200)
      .json({ message: "User fetched successfully...", users });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error..." });
  }
};

export const getUsersByPosition = async (
  req: IRequest,
  res: IResponse
): Promise<IResponse> => {
  try {
    let position = req.query.position;
    if (!position) return res.status(200).json({ message: getAllUses });

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

    // get users of the same position
    const userRepo: Repository<User> = getRepository(User);
    const users: User[] | null = await userRepo.findBy({ position });
    if (users.length == 0)
      return res.status(404).json({ message: `No ${ps}s found!` });
    return res
      .status(200)
      .json({ message: `${ps}s fetched successfully...`, users });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error..." });
  }
};
