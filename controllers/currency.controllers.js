const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "re_pro",
});

// const createFund = async (req, res) => {
//   const e = req.body.expenses ? req.body.expenses : 0;
//   const a = req.body.totalAmount ? req.body.totalAmount : 0;
//   const expenses = `RWF ${e}`;
//   const totalAmount = `RWF ${a}`;

//   if (a > e) {
//     const profit = `RWF ${a - e}`;

//     // Before drop other funds
//     const sql = `DELETE FROM currency`;
//     conn.query(sql, async (error) => {
//       if (error) {
//         return res.status(500).send({ message: "Internal server error..." });
//       } else {
//         // save to database
//         const sql = `INSERT INTO currency (total_amount, expenses, profit) VALUES ('${totalAmount}', '${expenses}', '${profit}')`;
//         conn.query(sql, async (error) => {
//           // console.log(error)
//           if (error) {
//             return res
//               .status(500)
//               .send({ message: "Internal server error..." });
//           } else {
//             // save to database
//             const sql = `SELECT * FROM currency`;
//             conn.query(sql, async (error, data) => {
//               if (error) {
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
//      const loss = `RWF ${e - a}`;

//      // Before drop other funds
//      const sql = `DELETE FROM currency`;
//      conn.query(sql, async (error) => {
//        if (error) {
//          return res.status(500).send({ message: "Internal server error..." });
//        } else {
//          // save to database
//          const sql = `INSERT INTO currency (total_amount, expenses, loss) VALUES ('${totalAmount}', '${expenses}', '${loss}')`;
//          conn.query(sql, async (error) => {
//            // console.log(error)
//            if (error) {
//              return res
//                .status(500)
//                .send({ message: "Internal server error..." });
//            } else {
//              // save to database
//              const sql = `SELECT * FROM currency`;
//              conn.query(sql, async (error, data) => {
//                if (error) {
//                  return res
//                    .status(500)
//                    .send({ message: "Internal server error..." });
//                } else {
//                  return res.status(201).send({
//                    funds: data,
//                    message: "Funds Inserted!",
//                  });
//                }
//              });
//            }
//          });
//        }
//      });
//   }
// };

// Creating funds
const createFund = async (req, res) => {
  if (!user) {
    return res.status(404).send({ message: "User not found!" });
  }
  const n = user.name;
  const num = user.number;
  const e = req.body.expenses ? req.body.expenses : 0;
  const a = req.body.totalAmount ? req.body.totalAmount : 0;
  // const expenses = e;
  // const totalAmount = a;

  if (a > e) {
    const profit = a - e;

    // Before drop other funds
    const sql = `DELETE FROM currency WHERE number = '${user.number}'`;
    conn.query(sql, async (error) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal server error..." });
      } else {
        // save to database
        const sql = `INSERT INTO currency (number, owner, total_amount, expenses, profit) VALUES ('${num}', '${n}', '${a}', '${e}', '${profit}')`;
        conn.query(sql, async (error) => {
          console.log(error);
          if (error) {
            return res
              .status(500)
              .send({ message: "Internal server error..." });
          } else {
            // save to database
            const sql = `SELECT * FROM currency WHERE number = '${user.number}'`;
            conn.query(sql, async (error, data) => {
              if (error) {
                console.log(error);
                return res
                  .status(500)
                  .send({ message: "Internal server error..." });
              } else {
                return res.status(201).send({
                  funds: data,
                  message: "Funds Inserted!",
                });
              }
            });
          }
        });
      }
    });
  } else {
    // save the loss
    const loss = e - a;

    // Before drop other funds
    const sql = `DELETE FROM currency WHERE number = '${user.number}'`;
    conn.query(sql, async (error) => {
      console.log(error);
      if (error) {
        return res.status(500).send({ message: "Internal server error..." });
      } else {
        // save to database
        const sql = `INSERT INTO currency (number, owner,total_amount, expenses, loss) VALUES ('${num}', '${n}','${a}', '${e}', '${loss}')`;
        conn.query(sql, async (error) => {
          console.log(error);
          if (error) {
            return res
              .status(500)
              .send({ message: "Internal server error..." });
          } else {
            // save to database
            const sql = `SELECT * FROM currency WHERE number = '${user.number}'`;
            conn.query(sql, async (error, data) => {
              if (error) {
                console.log(error);
                return res
                  .status(500)
                  .send({ message: "Internal server error..." });
              } else {
                return res.status(201).send({
                  funds: data,
                  message: "Funds Inserted!",
                });
              }
            });
          }
        });
      }
    });
  }
};

// Returning the funds
const getFunds = async (req, res) => {
  if (!user) {
    return res.status(404).send({ message: "User not found!" });
  }
  const s = `SELECT * FROM currency WHERE number = '${user.number}' AND owner = '${user.name}'`;
  conn.query(s, (e, d) => {
    if (e) {
      return res.status(500).send({ message: "Internal server error..." });
    } else {
      if (d.length === 0) {
        return res.status(404).send({ message: "No funds found!" });
      } else {
        return res.status(201).send({
          funds: d,
        });
      }
    }
  });
};

// Update the funds
const updateFund = async (req, res) => {
  if (!user) {
    return res.status(404).send({ message: "User not found!" });
  }
  if (req.params.me === user.name) {
    // Check if it exists
    const sql = `SELECT * FROM currency WHERE number = '${user.number}' AND owner = '${user.name}'`;
    conn.query(sql, (error, data) => {
      if (error) {
        return res.status(500).send({ message: "Internal server error..." });
      } else {
        if (data.length === 0) {
          return res.status(404).send({ message: "Fund not found..." });
        }
        // Get total amount, expenses, profit and loss
        const t = req.body.totalAmount
          ? req.body.totalAmount
          : data[0].total_amount;
        const e = req.body.expenses ? req.body.expenses : data[0].expenses;

        if (t > e) {
          // Profit
          const p = t - e;
          console.log(p);
        }
      }
    });
  } else {
    return res
      .status(403)
      .send({ message: "Not authorized to perform this action!" });
  }
};

module.exports = {
  createFund,
  getFunds,
  updateFund,
};
