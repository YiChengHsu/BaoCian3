const router = require("express").Router()
const { upload, authentication, getUserIdByToken, errorCatcher } = require("../../util/util")

const cpUpload = upload.fields([
	{ name: "main_image", maxCount: 1 },
	{ name: "other_images", maxCount: 3 },
])

const { createProduct, getProducts, setWatchList, delWatchList, reportProduct } = require("../controllers/product_controller")

router.route("/product/upload").post(authentication(), cpUpload, errorCatcher(createProduct))

router.route("/product/watchList").post(authentication(), errorCatcher(setWatchList)).delete(authentication(), errorCatcher(delWatchList))

router.route("/product/report").post(authentication(), errorCatcher(reportProduct))

router.route("/product/:category").get(getUserIdByToken(), errorCatcher(getProducts))

module.exports = router
