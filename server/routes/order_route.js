const express = require('express')
const router = require('express').Router();
const { authentication } = require('../../util/util')

const {
    createPayment, 
    updateOrder,
    confirmPayment,
} = require('../controllers/order_controller');

router.route('/order/payment')
    .post(authentication(), createPayment)

router.route('/order/webhook')
    .post(express.raw({type: 'application/json'}), confirmPayment)

router.route('/order/update')
    .patch(authentication(), updateOrder)

module.exports = router;