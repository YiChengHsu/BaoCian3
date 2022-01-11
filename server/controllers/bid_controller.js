const Bid = require("../models/bid_model")
const Product = require("../models/product_model")
const SortedArray = require("collections/sorted-array")
const Order = require("../models/order_model")
let productsSortByEndTime

const setBidRecord = async (data) => {

	const bidData = {
		product_id: data.productId,
		user_id: data.userId,
		bid_amount: data.bidAmount,
		bid_time: data.bidTime,
		time_left: data.timeLeft,
		end_time: data.endTime + 30000,
		user_name: data.userName,
		total_bid_times: data.totalBidTimes + 1,
	}

	const result = await Bid.setBidRecord(bidData)
	if (result.error) {
		console.log(result)
		return result
	}

	//Add 30s of product end time if bid success
	const bidIndexInArr = productsSortByEndTime.array.findIndex(
		(e) => e.id == Number(bidData.product_id)
	)
	productsSortByEndTime.array[bidIndexInArr].end_time += 30000

	return bidData
}

const getBidRecords = async (req, res) => {
	const productId = req.query.id
	try {
		const bidRecords = await Bid.getBidRecords(productId)
		res.status(200).json({ data: bidRecords })
	} catch (error) {
		res.status(500).json({ error: "Internal Server Error" })
	}
}

const setNewProductToFinisher = (id, endTime) => {
	const newProduct = { id, endTime }
	productsSortByEndTime.push(newProduct)
}

const setBidFinisher = async () => {
	//Set the Arr when server set up
	const endTimeArr = await Product.getProductEndTime()

	productsSortByEndTime = new SortedArray(
		endTimeArr,
		function equals(x, y) {
			return Object.equals(x.end_time, y.end_time)
		},
		function compare(x, y) {
			return Object.compare(x.end_time, y.end_time)
		}
	)

	setInterval(async () => {
		while (
			productsSortByEndTime.array[0] &&
			productsSortByEndTime.array[0].end_time <= Date.now()
		) {
			const endProduct = productsSortByEndTime.shift().id
			const orderProduct = await Product.endProductsAuction(endProduct)
			try {
				if (orderProduct && orderProduct.highest_user_id) {
					await createOrder(orderProduct)
				}
			} catch (error) {
				console.log(error)
			}
		}
	}, 1000)
}

const createOrder = async (product) => {
	const order = {
		product_id: product.id,
		title: product.title,
		total: product.highest_bid,
		seller_id: product.seller_id,
		main_image: product.main_image,
		buyer_id: product.highest_user_id,
		pay_deadline: Date.now() + 2 * 24 * 60 * 60 * 1000,
	}

	try {
		await Order.createOrder(order)
	} catch (error) {
		console.log(error)
	}
}

//Set the finisher when server set up
setBidFinisher()

module.exports = {
	setBidRecord,
	getBidRecords,
	setNewProductToFinisher,
}
