const mysql = require("mysql");
const dotenv = require('dotenv');

dotenv.config({ path:'./.env' });

const pool = mysql.createPool({
    host: process.env.DATABASE_HOST, // nu local, indien je server hebt, schrijf je IP adres van server,
    user: process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DATABASE_PORT
  });

module.exports = pool