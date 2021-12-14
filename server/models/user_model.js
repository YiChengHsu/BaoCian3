const { pool } = require("./mysqlcon")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const salt = parseInt(process.env.BCRYPT_SALT)
require("dotenv").config()

const nativeSignUp = async (name, email, password, avatar) => {
	const conn = await pool.getConnection()
	try {
		await conn.query("START TRANSACTION")

		const emails = await conn.query("SELECT email FROM user WHERE email = ? FOR UPDATE", [email])
		if (emails[0].length > 0) {
			await conn.query("COMMIT")
			return {
				error: {
					type: 400,
					msg: "Email Already Exists",
				},
			}
		}

		const loginAt = new Date()
		const accessExpire = process.env.ACCESS_TOKEN_EXPIRE

		const user = {
			provider: "native",
			email: email,
			password: bcrypt.hashSync(password, salt),
			name: name,
			access_expired: accessExpire,
			login_at: loginAt,
			picture: avatar,
		}

		const accessToken = jwt.sign(
			{
				provider: user.provider,
				name: user.name,
				email: user.email,
				picture: user.picture,
			},
			process.env.ACCESS_TOKEN_SECRET
		)

		user.access_token = accessToken
		user.provider = "native"

		const [result] = await conn.query("INSERT INTO user SET ?", user)
		const userId = result.insertId
		user.id = userId
		await conn.query("INSERT INTO user_address (user_id) VALUES (?)", [userId])
		await conn.query("INSERT INTO user_account (user_id) VALUES (?)", [userId])
		await conn.query("COMMIT")
		return { user }
	} catch (error) {
		console.log(error)
		await conn.query("ROLLBACK")
		return {
			error: {
				type: 500,
				msg: error,
			},
		}
	} finally {
		conn.release()
	}
}

const nativeSignIn = async (email, password) => {
	const conn = await pool.getConnection()
	try {
		await conn.query("START TRANSACTION")

		const [result] = await conn.query("SELECT * FROM user WHERE email = ?", [email])

		if (result.length == 0) {
			await conn.query("COMMIT")
			return {
				error: {
					type: 400,
					msg: "Email not exist",
				},
			}
		}

		const user = result[0]

		if (!bcrypt.compareSync(password, user.password)) {
			await conn.query("COMMIT")
			return {
				error: {
					type: 403,
					msg: "Wrong password",
				},
			}
		}

		const loginAt = new Date()
		const accessExpire = process.env.ACCESS_TOKEN_EXPIRE
		const accessToken = jwt.sign(
			{
				provider: user.provider,
				name: user.name,
				email: user.email,
				picture: user.picture,
			},
			process.env.ACCESS_TOKEN_SECRET
		)

		await conn.query("UPDATE user SET access_token = ?, access_expired = ?, login_at = ? WHERE id = ?", [accessToken, accessExpire, loginAt, user.id])

		await conn.query("COMMIT")

		user.access_token = accessToken
		user.login_at = loginAt
		user.access_expired = accessExpire

		return { user }
	} catch (error) {
		await conn.query("ROLLBACK")
		return { error }
	} finally {
		await conn.release()
	}
}

const getUserProfile = async (email) => {
	try {
		const [result] = await pool.query("SELECT * FROM user WHERE email = ?", [email])
		const user = result[0]
		return { user }
	} catch (error) {
		return null
	}
}

const getUserDetails = async (userId) => {
	const [result] = await pool.query(
		"SELECT * FROM (project.user u LEFT JOIN user_address a ON u.id = a.user_id) LEFT JOIN user_account acc ON u.id = acc.user_id  WHERE u.id = ?;",
		[userId]
	)
	const user = result[0]

	return user
}

const getUserWatchProductIds = async (userId) => {
	const queryStr = "SELECT product_id from watch_list WHERE user_id = ? "
	const bindings = userId

	const [productIds] = await pool.query(queryStr, bindings)
	return productIds
}

const getUserWatchList = async (pageSize, paging, userId) => {
	const binding = [userId]

	const limit = {
		sql: "LIMIT ?, ?",
		binding: [pageSize * paging, pageSize],
	}

	const queryStr =
		"SELECT * FROM watch_list w INNER JOIN product p on w.product_id = p.id where w.user_id = ? AND p.auction_end = 0  ORDER by p.end_time " + limit.sql
	const countQueryStr = "SELECT COUNT(*) as count from watch_list WHERE user_id = ? "
	const bindings = binding.concat(limit.binding)

	try {
		const [watches] = await pool.query(queryStr, bindings)
		const [watchCounts] = await pool.query(countQueryStr, binding)

		const data = {
			products: watches,
			productCount: watchCounts[0].count,
		}

		return data
	} catch (error) {
		console.log(error)
		return { error }
	}
}

const getUserAddress = async (userId) => {
	const queryStr = "SELECT * from user_address WHERE user_id = ? "
	const bindings = userId

	const [address] = await pool.query(queryStr, bindings)
	return address[0]
}

const updateUserAddress = async (userId, address) => {
	const conn = await pool.getConnection()
	try {
		await conn.query("START TRANSACTION")

		await conn.query("UPDATE user_address SET ? WHERE user_id = ?", [address, userId])
		await conn.query("COMMIT")
		return 1
	} catch (error) {
		await conn.query("ROLLBACK")
		console.log(error)
		return -1
	} finally {
		await conn.release()
	}
}

const updateUserAccount = async (userId, account) => {
	const conn = await pool.getConnection()
	try {
		await conn.query("START TRANSACTION")

		await conn.query("UPDATE user_account SET ? WHERE user_id = ?", [account, userId])
		await conn.query("COMMIT")
		return 1
	} catch (error) {
		await conn.query("ROLLBACK")
		console.log(error)
		return -1
	} finally {
		await conn.release()
	}
}

const createRating = async (rateId, ratedId, orderId, rating) => {
	const conn = await pool.getConnection()

	try {
		await conn.query("START TRANSACTION")

		const [search] = await conn.query("SELECT * FROM project.rating WHERE rate_id = ? AND order_id = ? ", [rateId, orderId])

		if (search.length > 0) {
			conn.query("COMMIT")
			return -1
		}

		const [result] = await conn.query("INSERT INTO rating SET?", {
			rate_id: rateId,
			rated_id: ratedId,
			order_id: orderId,
			rating: rating,
		})

		await conn.query('UPDATE project.order SET status = status + 1 WHERE id = ?', [orderId])
		await conn.query("COMMIT")
		return result.insertId
	} catch (error) {
		await conn.query("ROLLBACK")
		console.log(error)
		return error
	} finally {
		await conn.release()
	}
}

const getRatings = async (userId) => {
	const queryStr = "SELECT rated_id, rating FROM rating WHERE rated_id in (?)"
	const bindings = [userId]

	const [ratings] = await pool.query(queryStr, bindings)
	return ratings
}

const getAvgRatings = async (userId) => {
	const queryStr = "SELECT rated_id, AVG(rating) as avgRating FROM rating WHERE rated_id in (?)"
	const bindings = [userId]

	const [avgRating] = await pool.query(queryStr, bindings)
	return avgRating
}

const banUnpaidUser = async (userIds) => {
	const queryStr = "UPDATE user SET role_id = 2 WHERE id in (?)"
	const bindings = [userIds]

	const [banUserIds] = await pool.query(queryStr, bindings)

	return banUserIds
}

const updateUserPicture = async (userId, picture) => {

	const conn = await pool.getConnection()
	try {
		await conn.query("START TRANSACTION")

		await conn.query("UPDATE user SET picture = ? WHERE id = ? ", [picture, userId])

		const [result] = await conn.query("SELECT * FROM user WHERE id = ?", [userId])
		const user = result[0]

		const loginAt = new Date()
		const accessExpire = process.env.ACCESS_TOKEN_EXPIRE
		const accessToken = jwt.sign(
			{
				provider: user.provider,
				name: user.name,
				email: user.email,
				picture: picture,
			},
			process.env.ACCESS_TOKEN_SECRET
		)

		await conn.query("UPDATE user SET access_token = ?, access_expired = ?, login_at = ? WHERE id = ?", [accessToken, accessExpire, loginAt, user.id])

		await conn.query("COMMIT")

		user.access_token = accessToken
		user.login_at = loginAt
		user.access_expired = accessExpire

		return { user }
	} catch (error) {
		await conn.query("ROLLBACK")
		return { error }
	} finally {
		await conn.release()
	}
}

module.exports = {
	nativeSignUp,
	nativeSignIn,
	getUserProfile,
	getUserDetails,
	getUserWatchProductIds,
	getUserWatchList,
	getUserAddress,
	updateUserAddress,
	updateUserAccount,
	createRating,
	getRatings,
	getAvgRatings,
	banUnpaidUser,
	updateUserPicture
}
