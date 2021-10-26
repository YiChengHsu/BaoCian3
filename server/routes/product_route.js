const router = require('express').Router();
const { upload } = require('../../util/util')

const cpUpload = upload.fields([
    {name: 'main_image', maxCount:1},
    {name: 'other_images', maxCount: 5}
]);

const { 
    createProduct,
    getProducts,
} = require('../controllers/product_controller');

router.route('/product/upload')
    .post(cpUpload, createProduct);

router.route('/product/:category')
    .get(getProducts);

module.exports = router;