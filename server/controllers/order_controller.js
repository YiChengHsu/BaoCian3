const config = require("../../util/config");
const stripe = require("stripe")(config.stripe.secretKey);
const Order = require('../models/order_model');
const User = require('../models/user_model');
const SortedArray = require("collections/sorted-array");
let sortedTimeArr;


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
				description: '抱歉錢錢代表賣家與網站感謝您的購買！',
			},
		],
		mode: "payment",
		success_url: `https://baocian3.fun/order/success`,
		cancel_url: "https://baocian3.fun/user/profile",
		metadata: {'order_id': data.orderId, 'user_id': userId}
	});

	const paymentIntent = session.payment_intent

	try {
		await Order.createPayment(data.orderId, paymentIntent)
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
	const endpointSecret = config.stripe.endPointSecret

	let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
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
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
			return
  }

	console.log(paymentIntent)
	
	const intent = paymentIntent.payment_intent
	const payment = {
		amount: (paymentIntent.amount_captured / 100), //Convert cent to NTD dollars
		create_time: paymentIntent.created,
		payment_method: paymentIntent.payment_method,
		payment_method_details: paymentIntent.payment_method_details,
		payment_card_last4: paymentIntent.payment_method_details.card.last4,
		receipt_url: paymentIntent.receipt_url,
		pay_status: 1,
	}

	await Order.confirmPayment(intent, payment)
  // Return a 200 response to acknowledge receipt of the event
  res.status(200).send({success: true});
};



const updateOrder = async (req, res) => {

	const body = req.body
  const orderId = body.orderId
  const status = body.status
	const delivery = body.delivery || null
  const result = await Order.updateOrder(orderId, status, delivery)

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
			const unpaidUser = sortedEndTimeArr.shift().buyer_id;
			try {
					const bannedUserId = await User.banUserWithoutPay(unpaidUser);
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
