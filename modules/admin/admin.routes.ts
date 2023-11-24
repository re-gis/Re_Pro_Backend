import express from "express";
import { protect, role } from "../../middlewares/userAuth";
import { EPosition } from "../../enums/Enums";
import {
  deleteUser,
  getAllUses,
  getUsersByPosition,
  updateUserStats,
} from "./admin.controller";

export const adminRouter = express.Router();

adminRouter.patch(
  "/users/update/:user",
  protect,
  role(EPosition.SUPER),
  updateUserStats
);

adminRouter.delete(
  "/users/delete/:user",
  protect,
  role(EPosition.SUPER),
  deleteUser
);

adminRouter.get("/users", protect, role(EPosition.SUPER), getAllUses);

adminRouter.get(
  "/users/position",
  protect,
  role(EPosition.SUPER),
  getUsersByPosition
);
