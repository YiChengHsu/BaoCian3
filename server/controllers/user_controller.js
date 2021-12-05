const validator = require("validator")
const User = require("../models/user_model")
const Order = require("../models/order_model")
const Bid = require("../models/bid_model")
const Product = require("../models/product_model")
const pageSize = 5
const {
	getProductSellerInfo,
	getProductsImages,
	getProductWatchTimes,
} = require("../controllers/product_controller")
require("dotenv").config()

const signUp = async (req, res) => {
	let body = req.body
	let picture = req.file ? req.file.key : "sorry-my-wallet/user_default.png"

	if (!body.name || !body.email || !body.password) {
		res
			.status(400)
			.send({ error: "Bad Request: Name, email, or password is empty" })
		return
	}

	// User validator test is email
	if (!validator.isEmail(body.email)) {
		res.status(400).send({ error: "Bad Request: Invalid email format" })
	}

	//Replace <, >, &, ', " and / with HTML entities.
	body.name = validator.escape(body.name)

	const result = await User.nativeSignUp(
		body.name,
		body.email,
		body.password,
		picture
	)
	if (result.error) {
		console.log(result.error)
		res.status(result.error.type).send({ error: result.error.msg })
		return
	}

	const user = result.user
	if (!user) {
		res.status(500).send({ error: "Database error" })
		return
	}

	res.status(200).send({
		data: {
			access_token: user.access_token,
			access_expired: user.access_expired,
			login_at: user.login_at,
			user: {
				id: user.id,
				provider: user.provider,
				name: user.name,
				email: user.email,
				picture: process.env.IMAGE_PATH + user.picture,
			},
		},
	})
}

const signIn = async (req, res) => {
	const body = req.body

	let result

	switch (body.provider) {
		case "native":
			result = await User.nativeSignIn(body.email, body.password)
			break
		default:
			res.status(400).send({ error: "Bad Request" })
	}

	if (result.error) {
		const error = result.error
		console.log(error)
		res.status(error.type).send({ error: error.msg })
		return
	}

	const user = result.user
	if (!user) {
		res.status(403).send({ error: "Forbidden" })
		return
	}

	res.status(200).send({
		data: {
			access_token: user.access_token,
			access_expired: user.access_expired,
			login_at: user.login_at,
			user: {
				id: user.id,
				provider: user.provider,
				name: user.name,
				email: user.email,
				picture: process.env.IMAGE_PATH + user.picture,
			},
		},
	})
}

const getUserProfile = async (req, res) => {
	const userId = req.user.id
	const query = req.query
	const paging = parseInt(query.paging) || 0
	const listType = query.type
	let status = query.status || null

	const user = await User.getUserDetails(userId)

	const findDataList = async (listType) => {
		switch (listType) {
			case "order":
				return await Order.getUserOrders(pageSize, paging, status, userId)
			case "sell":
				return await Order.getUserOrders(pageSize, paging, "sell", userId)
			default:
				res.status(200).send({ data: [] })
		}
	}

	const { dataList, dataListCounts } = await findDataList(listType)

	let rating = await User.getAvgRatings(userId)
	user.rating = rating ? rating[0].avgRating : null

	const totalPage = Math.ceil(dataListCounts / pageSize)
	const result = {
		data: dataList,
		page: paging,
		total_page: totalPage,
		user: user,
	}

	res.status(200).send(result)
	return
}

const getUserList = async (req, res) => {

	const records = req.params.records

	const userId = req.user.id
	const paging = parseInt(req.query.paging) || 0
	const order = req.query.order || null
	let productList

	let watchList = await User.getUserWatchProductIds(userId)
	watchList = Object.values(watchList).map((e) => e.product_id)

	const findUserProduct = async (records) => {
		switch (records) {
			case "like":
				productList = watchList
				return await Product.getProducts(pageSize, paging, { productList, order })
			case "bade":
				productList = await Bid.getUserBadeProducts(userId)
				productList = Object.values(productList).map((e) => e.product_id)
				return await Product.getProducts(pageSize, paging, { productList, order })
			case "selling":
				return await Product.getProducts(pageSize, paging, { userId, order })
			default:
				return {}
		}
	}

	const { products, productCount } = await findUserProduct(records)

	if (products && products.length == 0) {
		res.status(200).json({ data: [], page: 0, total_page: 1, user: watchList })
		return
	}

	let productsWitherSeller = await getProductSellerInfo(products)
	let productsWithImages = await getProductsImages(products)
	let productWithWatchTimes = await getProductWatchTimes(products)
	let productsWithDetails

	productsWithDetails = productsWithImages

	const totalPage = Math.ceil(productCount / pageSize)
	const result = {
		data: productsWithDetails,
		page: paging,
		total_page: totalPage,
		user: watchList,
	}

	res.status(200).json(result)
}

const getUserOrders = async (req, res) => {
	const query = req.query
	const status = req.params.status || null
	const paging = parseInt(query.paging) || 0

	const { orders, orderCounts } = await Order.getUserOrders(
		pageSize,
		paging,
		status
	)

	if (!orders) {
		res.status(400).send({ error: "Bad Request" })
		return
	}

	if (orders.length == 0) {
		res.status(200).json({ data: null })
		return
	}

	let result

	if (orderCounts > (paging + 1) * pageSize) {
		result = {
			data: orders,
			next_paging: paging + 1,
		}
	} else {
		result = {
			data: orders,
		}
	}

	res.status(200).json(result)
}

const getUserAddress = async (req, res) => {
	const userId = req.query.id
	const address = await User.getUserAddress(userId)

	if (address.length <= 0) {
		res.status(400).send({ error: "Bad Request" })
		return
	}
	res.status(200).send({ data: address })
}

const updateUserAddress = async (req, res) => {
	const userId = req.user.id
	const body = req.body
	const address = {
		city: body.city,
		town: body.town,
		zipcode: body.zipcode,
		address: body.address,
		receiver: body.receiver,
		phone: body.phone,
	}

	const addressId = await User.updateUserAddress(userId, address)

	if (addressId <= 0) {
		res.status(500).send({ error: "Database Error" })
		return
	}

	res.status(200).send({ addressId })
}

const updateUserAccount = async (req, res) => {
	const userId = req.user.id
	const body = req.body
	const account = {
		bank_code: body.bankCode,
		bank_account: body.bankAccount,
		account_name: body.accountName,
	}

	const addressId = await User.updateUserAccount(userId, account)

	if (addressId <= 0) {
		res.status(500).send({ error: "Database Error" })
		return
	}

	res.status(200).send({ addressId })
}

const createRating = async (req, res) => {
	const rateId = req.user.id
	const body = req.body

	const ratedId = body.ratedId
	const orderId = body.orderId
	const rating = body.rating
	const status = body.status

	try {
		const result = await User.createRating(rateId, ratedId, orderId, rating)

		if (result <= 1) {
			res.status(400).send({ error: "Bad Request" })
			return
		}

		await Order.updateOrder(rateId, orderId, status, null)

		res.status(200).send({ result })
	} catch (error) {
		console.log(error)

		res.status(500).send({ error: "Database error" })
		return
	}
}

module.exports = {
	signIn,
	signUp,
	getUserProfile,
	getUserList,
	getUserOrders,
	getUserAddress,
	updateUserAddress,
	updateUserAccount,
	createRating,
}
