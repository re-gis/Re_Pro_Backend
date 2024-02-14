import { reseller } from "googleapis/build/src/apis/reseller";
import { EPosition } from "../enums/Enums";
import IResponse from "../interfaces/IResponse";
import { Repository, getRepository } from "typeorm";
import User from "../entities/User.entity";

export const getWOrkersByPosition = async (
  position: EPosition
): Promise<User[] | undefined | Error> => {
  try {
    const userRepo: Repository<User> = getRepository(User);

    // get all users with the same position
    const users: User[] | undefined = await userRepo.find({
      where: { position },
    });

    if (users.length === 0) {
      return Error(`Users with position: ${position} not found!`);
    }

    return users;
  } catch (error: Error | any) {
    return error;
  }
};
