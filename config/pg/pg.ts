import { Pool } from "pg";

export const pool = new Pool({
  user: "vista_db_six6_user",
  host: "dpg-cmrnbnen7f5s738k39fg-a.oregon-postgres.render.com",
  database: "vista_db_six6",
  password: "efnLNKFlmRLQIyQcOSyfuRUdq9MZIyuv",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const connectPgDb = async () => {
  pool.query("SELECT NOW()", (err: any, res: any) => {
    if (err) {
      console.error("Error connecting to the database", err);
    } else {
      console.log("Connected to the PG database...");
    }
  });
};
