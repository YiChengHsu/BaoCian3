const express = require("express")
const router = require("express").Router()
const { authentication, errorCatcher } = require("../../util/util")

const { createPayment, updateOrder, confirmPayment } = require("../controllers/order_controller")

router.route("/order/payment").post(authentication(), errorCatcher(createPayment))

router.route("/order/webhook").post(express.raw({ type: "application/json" }), errorCatcher(confirmPayment))

router.route("/order/update").patch(authentication(), errorCatcher(updateOrder))

module.exports = router
