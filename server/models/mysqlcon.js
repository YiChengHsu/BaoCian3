const config = require("../../util/config");
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    connectionLimit: 10, 
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
});

module.exports = { 
    pool,
};