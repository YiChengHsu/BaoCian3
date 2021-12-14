const { pool } = require("./mysqlcon")

const setBidRecord = async (bid) => {
	const conn = await pool.getConnection()
	try {
		await conn.query("START TRANSACTION")

		const [user_role] = await conn.query("SELECT role_id FROM user WHERE id in (?) ", [bid.user_id])

		if (user_role[0].role_id == 2) {
			await conn.query("COMMIT")
			return { error: "Unpaid user" }
		}

		const [search] = await conn.query("SELECT price, highest_bid, auction_end FROM product WHERE id in (?) FOR UPDATE", [bid.product_id])

		if (bid.bid_amount < search[0].price) {
			await conn.query("COMMIT")
			return { error: "Invalid bid" }
		}

		if (search[0].highest_bid && bid.bid_amount <= search[0].highest_bid) {
			await conn.query("COMMIT")
			return { error: "Invalid bid" }
		}

		if (search[0].auction_end != 0) {
			await conn.query("COMMIT")
			return { error: "Ended auction" }
		}

		const [result] = await conn.query("INSERT INTO bid_record SET product_id = ?, user_id = ?, bid_amount = ?, bid_time = ?, time_left = ?, user_name = ?", [bid.product_id, bid.user_id, bid.bid_amount, bid.bid_time, bid.time_left, bid.user_name])
		await conn.query("UPDATE product SET highest_bid = ?, bid_times = ?, end_time = ?, highest_user_id = ? WHERE id = ?", [
			bid.bid_amount,
			bid.total_bid_times,
			bid.end_time,
			bid.user_id,
			bid.product_id,
		])
		await conn.query("COMMIT")
		return result.insertId
	} catch (error) {
		await conn.query("ROLLBACK")
		console.log(error)
		return { error: "Database error" }
	} finally {
		conn.release()
	}
}

const getBidRecords = async (productIds) => {
	const queryStr = "SELECT * FROM bid_record WHERE product_id in (?) ORDER by bid_amount DESC LIMIT 5 "
	const bindings = [productIds]
	const [bids] = await pool.query(queryStr, bindings)
	return bids
}

const getUserBadeProducts = async (userId) => {
	const queryStr = "SELECT DISTINCT product_id FROM bid_record WHERE user_id = ?"
	const bindings = [userId]
	const [productIds] = await pool.query(queryStr, bindings)
	return productIds
}

module.exports = { setBidRecord, getBidRecords, getUserBadeProducts }
