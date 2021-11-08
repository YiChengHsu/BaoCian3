const router = require('express').Router();
const { 
    upload, 
    authentication, 
    authenticationPass } = require('../../util/util')

const cpUpload = upload.fields([
    {name: 'main_image', maxCount:1},
    {name: 'other_images', maxCount: 3}
]);

const { 
    createProduct,
    getProducts,
    setWatchList,
    delWatchList,
} = require('../controllers/product_controller');

router.route('/product/upload')
    .post(authentication(), cpUpload, createProduct);

router.route('/product/watchList/set')
    .post(authentication(), setWatchList);

router.route('/product/watchList/del')
    .post(authentication(), delWatchList);

router.route('/product/:category')
    .get(authenticationPass(), getProducts);


module.exports = router;