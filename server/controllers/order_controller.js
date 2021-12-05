const config = require("../../util/config")
const stripe = require("stripe")(config.stripe.secretKey)
const Order = require("../models/order_model")
const User = require("../models/user_model")
const SortedArray = require("collections/sorted-array")
let ordersSortByDeadline

const createPayment = async (req, res) => {
	const userId = req.user.id
	const data = req.body

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		customer_email: data.customerEmail,
		line_items: [
			{
				price_data: {
					currency: "twd",
					product_data: {
						name: data.title,
						images: [data.image],
					},
					unit_amount: data.price * 100,
				},
				quantity: 1,
				description: "抱歉錢錢代表賣家感謝您的購買！",
			},
		],
		mode: "payment",
		success_url: `https://baocian3.fun/order/success`,
		cancel_url: "https://baocian3.fun/user/profile",
		metadata: { order_id: data.orderId, user_id: userId },
	})

	const paymentIntent = session.payment_intent

	try {
		await Order.createPayment(data.orderId, paymentIntent)
	} catch (error) {
		console.log(error)
		res.status(500).send({ error: "Database error" })
		return
	}

	res.status(303).send({ payUrl: session.url })
}

const confirmPayment = async (req, res) => {
	//Use stipe webhook to confirm the pay
	const sig = req.headers["stripe-signature"]
	const endpointSecret = config.stripe.endPointSecret

	let event

	try {
		event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
	} catch (error) {
		console.log(error)
		res.status(400).send(`Webhook Error: ${error.message}`)
		return
	}

	let paymentIntent

	// Handle the event
	switch (event.type) {
		case "charge.succeeded":
			paymentIntent = event.data.object
			break
		default:
			return
	}

	const intent = paymentIntent.payment_intent
	const payment = {
		amount: paymentIntent.amount_captured / 100, //Convert cent to NTD dollars
		create_time: paymentIntent.created,
		payment_method: paymentIntent.payment_method,
		card_brand: paymentIntent.payment_method_details.card.brand,
		exp_month: paymentIntent.payment_method_details.card.exp_month,
		exp_year: paymentIntent.payment_method_details.card.exp_year,
		payment_card_last4: paymentIntent.payment_method_details.card.last4,
		receipt_url: paymentIntent.receipt_url,
		pay_status: 2,
	}

	const result = await Order.confirmPayment(intent, payment)

	if (result.error) {
		res.status(500), send(result.error)
		return
	}
	// Return a 200 response to acknowledge receipt of the event
	res.status(200).send({ success: true })
}

const updateOrder = async (req, res) => {
	const body = req.body
	const orderId = body.orderId
	const status = body.status
	const delivery = body.delivery || null
	const result = await Order.updateOrder(orderId, status, delivery)

	if (result <= 0) {
		res.status(400).send({ error: "Bad Request" })
		return
	}

	res.status(200).send({ message: "Update success" })
}

//Check if unpaid order per minutes 
const setUnpaidUserBanner = async () => {
	const endTimeArr = await Order.getExpiredOrder()
	ordersSortByDeadline = new SortedArray(
		endTimeArr,
		function equals(x, y) {
			return Object.equals(x.pay_deadline, y.pay_deadline)
		},
		function compare(x, y) {
			return Object.compare(x.pay_deadline, y.pay_deadline)
		}
	)

	setInterval(async () => {
		const unpaidUsers = []

		while (
			ordersSortByDeadline.array[0] &&
			ordersSortByDeadline.array[0].pay_deadline <= Date.now()
		) {
			const unpaidOrder = ordersSortByDeadline.shift()
			unpaidUsers.push(unpaidOrder.buyer_id)
		}

		let result
		try {
			if (unpaidUsers > 0) {
				await User.banUnpaidUser(unpaidUsers)
			}
		} catch (error) {
			console.log(error)
		}
	}, 60000)
}

setUnpaidUserBanner()

module.exports = {
	createPayment,
	confirmPayment,
	updateOrder,
}
