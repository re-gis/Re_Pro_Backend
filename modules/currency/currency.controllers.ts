import { Repository, getRepository } from "typeorm";
import IRequest from "../../interfaces/IRequest";
import IResponse from "../../interfaces/IResponse";
import Currency from "../../entities/currency.entity";
import User from "../../entities/User.entity";

 export const createFund = async (req:IRequest, res:IResponse) => {
   const e:number = req.body.expenses ? req.body.expenses : 0;
   const a:number = req.body.totalAmount ? req.body.totalAmount : 0;
   const expenses = `RWF ${e}`;
   const totalAmount = `RWF ${a}`;
   const currencyRepo:Repository<Currency> = getRepository(Currency)
   await currencyRepo.clear();
   const user:User = req.user
   const userRepo:Repository<User> = getRepository(User)
   const u = await userRepo.findOne({where: {email:user.email}})
   if(!u) return res.status(404).json({message:"User not found!"})

   if (a > e) {
     // if the expenses are less than the total amount
     const profit:string = `RWF ${a - e}`;
    // save them to the database
    const c = currencyRepo.create({
      expenses,
      number: u.number,
      profit
    })

   }else if(e>a){
    // if the expenses are greater than the total amount
    const loss:string = `RWF ${e-a}`

   }else {
    // if they are equal

   }
 };

// // Creating funds
// const createFund = async (req, res) => {
//   if (!user) {
//     return res.status(401).send({ message: "User not found!" });
//   }
//   const n = user.name;
//   const num = user.number;
//   const a = req.body.totalAmount ? req.body.totalAmount : 0;
//   const e = req.body.expenses ? req.body.expenses : 0;
//   // const expenses = e;
//   // const totalAmount = a;
//   if (a > e) {
//     const profit = a - e;
//     // console.log('hello')

//     // Before drop other funds
//     const sql = `DELETE FROM currency WHERE number = '${user.number}'`;
//     conn.query(sql, async (error) => {
//       if (error) {
//         console.log(error);
//         return res.status(500).send({ message: "Internal server error..." });
//       } else {
//         // save to database
//         const sql = `INSERT INTO currency (number, owner, total_amount, expenses, profit,loss) VALUES ('${num}', '${n}', '${a}', '${e}', '${
//           a - e
//         }', '0')`;
//         conn.query(sql, async (error) => {
//           console.log(error);
//           if (error) {
//             return res
//               .status(500)
//               .send({ message: "Internal server error..." });
//           } else {
//             // save to database
//             const sql = `SELECT * FROM currency WHERE number = '${user.number}'`;
//             conn.query(sql, async (error, data) => {
//               if (error) {
//                 console.log(error);
//                 return res
//                   .status(500)
//                   .send({ message: "Internal server error..." });
//               } else {
//                 return res.status(201).send({
//                   funds: data,
//                   message: "Funds Inserted!",
//                 });
//               }
//             });
//           }
//         });
//       }
//     });
//   } else {
//     // save the loss
//     const loss = e - a;
//     // console.log('hello')
//     // Before drop other funds
//     const sql = `DELETE FROM currency WHERE number = '${user.number}'`;
//     conn.query(sql, async (error) => {
//       // console.log(error);
//       if (error) {
//         return res.status(500).send({ message: "Internal server error..." });
//       } else {
//         // save to database
//         const sql = `INSERT INTO currency (number, owner,total_amount, expenses, loss, profit) VALUES ('${num}', '${n}','${a}', '${e}', '${
//           e - a
//         }', '0')`;
//         conn.query(sql, async (error) => {
//           // console.log(error);
//           if (error) {
//             return res
//               .status(500)
//               .send({ message: "Internal server error..." });
//           } else {
//             // save to database
//             const sql = `SELECT * FROM currency WHERE number = '${user.number}'`;
//             conn.query(sql, async (error, data) => {
//               if (error) {
//                 console.log(error);
//                 return res
//                   .status(500)
//                   .send({ message: "Internal server error..." });
//               } else {
//                 return res.status(201).send({
//                   funds: data,
//                   message: "Funds Inserted!",
//                 });
//               }
//             });
//           }
//         });
//       }
//     });
//   }
// };

// // Returning the funds
// const getFunds = async (req, res) => {
//   if (!user) {
//     return res.status(401).send({ message: "User not found!" });
//   }
//   const s = `SELECT * FROM currency WHERE number = '${user.number}' AND owner = '${user.name}'`;
//   conn.query(s, (e, d) => {
//     if (e) {
//       return res.status(500).send({ message: "Internal server error..." });
//     } else {
//       if (d.length === 0) {
//         return res.status(401).send({ message: "No funds found!" });
//       } else {
//         return res.status(201).send({
//           funds: d,
//         });
//       }
//     }
//   });
// };

// // Update the funds
// const updateFund = async (req, res) => {
//   if (!user) {
//     return res.status(401).send({ message: "User not found!" });
//   }
//   if (req.params.me === user.name) {
//     // Check if it exists
//     const sql = `SELECT * FROM currency WHERE number = '${user.number}' AND owner = '${user.name}'`;
//     conn.query(sql, (error, data) => {
//       if (error) {
//         return res.status(500).send({ message: "Internal server error..." });
//       } else {
//         if (data.length === 0) {
//           return res.status(401).send({ message: "Fund not found..." });
//         }
//         // Get total amount, expenses, profit and loss
//         const t = req.body.totalAmount
//           ? req.body.totalAmount
//           : data[0].total_amount;
//         const e = req.body.expenses ? req.body.expenses : data[0].expenses;

//         if (t > e) {
//           const profit = t - e;
//           // update  database
//           const sql = `UPDATE currency SET total_amount =  '${t}', expenses='${e}',profit='${
//             t - e
//           }', loss='0' WHERE number = '${user.number}'`;
//           conn.query(sql, async (error, data) => {
//             if (error) {
//               console.log(error);
//               return res
//                 .status(500)
//                 .send({ message: "Internal server error..." });
//             } else {
//               // Get the new funds
//               const sql = `SELECT * FROM currency WHERE owner='${user.name}'`;
//               conn.query(sql, async (err, data) => {
//                 if (err)
//                   return res
//                     .status(500)
//                     .send({ message: "Internal server error..." });
//                 if (data.length === 0)
//                   return res.status(400).send({ messag: "Fund not found!" });
//                 return res.status(201).send({
//                   funds: data[0],
//                   message: "Funds Updated!",
//                 });
//               });
//             }
//           });
//         } else {
//           // save the loss
//           const loss = e - t;
//           // update  database
//           const sql = `UPDATE currency SET total_amount='${t}', expenses='${e}', loss='${
//             e - t
//           }', profit='0' WHERE number = '${user.number}'`;
//           conn.query(sql, async (error, data) => {
//             if (error) {
//               console.log(error);
//               return res
//                 .status(500)
//                 .send({ message: "Internal server error..." });
//             } else {
//               // Get the new funds
//               const sql = `SELECT * FROM currency WHERE owner='${user.name}'`;
//               conn.query(sql, async (err, data) => {
//                 if (err)
//                   return res
//                     .status(500)
//                     .send({ message: "Internal server error..." });
//                 if (data.length === 0)
//                   return res.status(400).send({ messag: "Fund not found!" });
//                 return res.status(201).send({
//                   funds: data[0],
//                   message: "Funds Updated!",
//                 });
//               });
//             }
//           });
//         }
//       }
//     });
//   } else {
//     console.log({ user1: user.name, user2: req.params.me });
//     return res
//       .status(403)
//       .send({ message: "Not authorized to perform this action!" });
//   }
// };

// module.exports = {
//   createFund,
//   getFunds,
//   updateFund,
// };
