const config = require("../../util/config");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/order_model');
const User = require('../models/user_model');
const SortedArray = require("collections/sorted-array");
require('dotenv').config();
let sortedTimeArr;


const createPayment = async (req, res) => {

	const userId = req.user.id
  const data = req.body

  console.log(data.image)

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
				description: '超屌的東西，你一定要有！',
			},
		],
		mode: "payment",
		success_url: `https://baocian3.fun/order/success`,
		cancel_url: "https://baocian3.fun/user/profile",
		metadata: {'order_id': data.orderId, 'user_id': userId}
	});

	console.log(session)

	const paymentIntent = session.payment_intent

	try {
		await Order.createPayment(userId, data.orderId, paymentIntent)
	} catch (error) {
		console.log(error)
		res.status(500).send({error: "Database error"})
		return
	}

	res.status(303).send({ payUrl: session.url});

};

const confirmPayment = async (req ,res) => {

	//Use stipe webhook to confirm the pay

	const sig = req.headers['stripe-signature'];
	const endpointSecret = process.env.END_POINT_SECRET

	let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
		console.log(err)
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

	let paymentIntent;

  // Handle the event
  switch (event.type) {
    case 'charge.succeeded':
      paymentIntent = event.data.object;
			console.log(paymentIntent)
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
			return
  }

	const payment = {
		amount: (paymentIntent.amount_captured / 100),
		create_time: paymentIntent.created,
		payment_method: paymentIntent.payment_method,
		payment_method_details: paymentIntent.payment_method_types,
		payment_card_last4: paymentIntent.payment_method_details.card.last4,
		receipt_url: paymentIntent.receipt_url,
		pay_status: 1,
	}

	await Order.confirmPayment(paymentIntent.payment_intent, payment)

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).send({success: true});
};



const updateOrder = async (req, res) => {

	console.log(req.body)

  const userId = req.user.id
  const orderId = req.body.orderId
  const status = req.body.status
	const delivery =req.body.delivery || null

  const result = await Order.updateOrder(userId, orderId, status, delivery)

	if (result <= 0 ) {
		res.status(400).send({error: "Bad Request"})
		return
	}

	res.status(200).send({message:'Update success'})
} 

const setOrderPayExpiredBanner = async () => {
	
	const endTimeArr = await Order.getExpiredOrder();

	sortedEndTimeArr = new SortedArray(endTimeArr,
		function equals(x,y) {
				return Object.equals(x.pay_deadline, y.pay_deadline)
		},
		function compare(x,y) {
				return Object.compare(x.pay_deadline, y.pay_deadline)
		}
	)

	setInterval( async () => {

		while (sortedEndTimeArr.array[0] && sortedEndTimeArr.array[0].pay_deadline <= Date.now()) {
			const userWithoutPay = sortedEndTimeArr.shift().buyer_id;
			try {
					const bannedUserId = await User.banUserWithoutPay(userWithoutPay);
					console.log('banned user: ' + bannedUserId)
			} catch (error) {
					console.log(error)
			}
		}
	}, 60000)
	
}

setOrderPayExpiredBanner();


module.exports = {
	createPayment,
	confirmPayment,
	updateOrder,
};
