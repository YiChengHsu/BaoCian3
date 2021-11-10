const express = require('express')
const router = require('express').Router();
const { authentication } = require('../../util/util')

const {
    createPayment, 
    creatPayment,
    updateOrder,
    confirmPayment,
} = require('../controllers/order_controller');

router.route('/order/payment')
    .post(authentication(), creatPayment)

router.route('/order/webhook')
    .post(express.raw({type: 'application/json'}), confirmPayment)

module.exports = router;