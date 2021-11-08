const router = require('express').Router();
const { authentication } = require('../../util/util')

const {
    createPayment, 
    creatPayment,
    updateOrder,
} = require('../controllers/order_controller');

router.route('/order/payment')
    .post(creatPayment)

router.route('/order/update')
    .patch(authentication(), updateOrder)

module.exports = router;