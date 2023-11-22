import mongoose from "mongoose";

export const connectDatabase = async () => {
  await mongoose
    //@ts-ignore
    .connect(process.env.MONGO_URI)
    .then((con) => console.log("Mongodb connected successfully..."))
    .catch((e) => console.log(e));
};
