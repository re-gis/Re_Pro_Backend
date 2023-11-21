"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
function connectToDatabase() {
    return (0, typeorm_1.createConnection)({
        type: "postgres",
        host: "your_database_host",
        port: 5432,
        username: "postgres",
        password: "Password@2001",
        database: "re_pro",
        entities: [__dirname + "/entities/*.ts"],
        synchronize: true,
        logging: true,
    })
        .then((connection) => {
        console.log("Connected to the database");
        return connection;
    })
        .catch((error) => {
        console.error("Error connecting to the database:", error);
        throw error;
    });
}
exports.default = connectToDatabase;
