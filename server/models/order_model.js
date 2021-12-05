const { pool } = require("./mysqlcon")

const createOrder = async (product) => {
	const queryStr = "INSERT INTO project.order SET ?"
	const bindings = [product]

	const [result] = await pool.query(queryStr, bindings)

	return result.insertId
}

const getUserOrders = async (pageSize, paging, status, userId) => {
	const condition = {
		sql: "",
		binding: [],
	}
	const userBinding = [userId]

	if (status == "sell") {
		condition.sql = " WHERE o.seller_id = ? "
	} else if (status != null && status == 4) {
		condition.sql = " WHERE buyer_id = ? AND status in (4,5,6) "
	} else if (status != null) {
		condition.sql = " WHERE buyer_id = ? AND status = ? "
		condition.binding = [status]
	} else {
		condition.sql = " WHERE buyer_id = ? "
	}

	const limit = {
		sql: "LIMIT ?, ?",
		binding: [pageSize * paging, pageSize],
	}

	const orderStr = " ORDER BY o.pay_deadline DESC "

	const orderQuery = "SELECT *,o.id AS order_id FROM project.order o JOIN product p on o.product_id = p.id " + condition.sql + orderStr + limit.sql
	const orderBindings = userBinding.concat(condition.binding).concat(limit.binding)

	const orderCountQuery = "SELECT COUNT(*) as count FROM project.order o JOIN product p on o.product_id = p.id " + condition.sql + limit.sql
	const orderCountBindings = userBinding.concat(condition.binding).concat(limit.binding)

	try {
		const [orders] = await pool.query(orderQuery, orderBindings)
		const [orderCounts] = await pool.query(orderCountQuery, orderCountBindings)

		const data = {
			dataList: orders,
			dataListCounts: orderCounts[0] ? orderCounts[0].count : null,
		}

		return data
	} catch (error) {
		console.log(error)
		return { error }
	}
}

const updateOrder = async (orderId, status, delivery) => {
	const conn = await pool.getConnection()

	try {
		await conn.query("START TRANSACTION")
		const [search] = await conn.query("SELECT status FROM project.order WHERE id in (?) ", [orderId])

		console.log(search)

		if (!search || search[0].status != status) {
			await conn.query("COMMIT")
			return -1
		}

		const newStatus = status + 1
		await conn.query("UPDATE project.order SET status = ?, delivery = ? WHERE id = ?", [newStatus, delivery, orderId])
		await conn.query("COMMIT")
		return 1
	} catch (error) {
		await conn.query("ROLLBACK")
		console.log(error)
		return error
	} finally {
		await conn.release()
	}
}

const createPayment = async (orderId, paymentIntent) => {
	const queryStr = "INSERT INTO payment SET order_id = ?, payment_intent = ?, pay_status = 0"
	const bindings = [orderId, paymentIntent]
	const [result] = await pool.query(queryStr, bindings)
	const payId = result.insertId
	return payId
}

const confirmPayment = async (paymentIntent, payment) => {
	payment.pay_time = Date.now()

	const conn = await pool.getConnection()
	try {
		await conn.query("START TRANSACTION")
		const [search] = await conn.query(
			"SELECT p.id, p.order_id, o.buyer_id FROM payment p INNER JOIN project.order o ON p.order_id = o.id  WHERE p.payment_intent = ? ",
			paymentIntent
		)

		if (search.length <= 0) {
			await conn.query("COMMIT")
			return { error: "Payment create fail" }
		}

		const payId = search[0].id
		const buyerId = search[0].buyer_id
		const orderId = search[0].order_id

		await conn.query("UPDATE payment SET ? WHERE id = ?", [payment, payId])
		await conn.query("UPDATE project.order SET status = 2 WHERE id = ?", orderId)

		const [isOtherUnpaidOrder] = await conn.query("SELECT * FROM project.order WHERE status = 1 AND buyer_id = ? AND pay_deadline < ?", [
			buyerId,
			payment.pay_time,
		])

		if (isOtherUnpaidOrder.length == 0) {
			await conn.query("UPDATE user SET role_id = 1 WHERE id = ?", [buyerId])
		}

		await conn.query("COMMIT")
		return payId
	} catch (error) {
		await conn.query("ROLLBACK")
		console.log(error)
		return { error: "Database error" }
	} finally {
		await conn.release()
	}
}

const getExpiredOrder = async () => {
	const [endTimeArr] = await pool.query("SELECT id, buyer_id, pay_deadline FROM project.order WHERE status = 1")
	return endTimeArr
}

module.exports = {
	createOrder,
	getUserOrders,
	updateOrder,
	createPayment,
	confirmPayment,
	getExpiredOrder,
}
