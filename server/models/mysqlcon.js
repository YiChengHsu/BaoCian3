require("dotenv").config()
const mysql = require("mysql2/promise")
const env = process.env.NODE_ENV || "production"
const multipleStatements = process.env.NODE_ENV === "test"
const { HOST, DATABASE_USER, DATABASE_PASSWORD, DATABASE, DATABASE_TEST } = process.env

const mysqlConfig = {
	production: {
		// for EC2 machine
		host: HOST,
		user: DATABASE_USER,
		password: DATABASE_PASSWORD,
		database: DATABASE,
	},
	development: {
		// for localhost development
		host: HOST,
		user: DATABASE_USER,
		password: DATABASE_PASSWORD,
		database: DATABASE,
	},
	test: {
		// for automation testing (command: npm run test)
		host: HOST,
		user: DATABASE_USER,
		password: DATABASE_PASSWORD,
		database: DATABASE_TEST,
	},
}

let mysqlEnv = mysqlConfig[env]
mysqlEnv.waitForConnections = true
mysqlEnv.connectionLimit = 20

const pool = mysql.createPool(mysqlEnv, { multipleStatements })

module.exports = {
	mysql,
	pool,
}
