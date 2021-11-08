const config = require("../../util/config");
const stripe = require("stripe")(config.stripe.secretKey);
const bcrypt = require('bcrypt');
const Order = require('../models/order_model')

const creatPayment = async (req, res) => {

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
		success_url: `http://localhost:3000/order/success?order-id=${data.orderId}`,
		cancel_url: "http://localhost:3000/user/profile",
		metadata: {'order_id': data.orderId}
	});

	console.log(session)

	res.status(303).send({ payUrl: session.url});
};

const updateOrder = async (req, res) => {

	console.log(req.body)

  const userId = req.user.id
  const orderId = req.body.orderId
  const status = req.body.status

  const result = await Order.updateOrder(userId, orderId, status)

	if (result <= 0 ) {
		res.status(400).send({error: "123Bad Request"})
	}

	res.status(200).send({message:'Update success'})
} 

module.exports = {
	creatPayment,
	updateOrder,
};
