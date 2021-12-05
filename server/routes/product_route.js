const router = require('express').Router();
const { 
    upload, 
    authentication,
    getUserIdByToken, 
} = require('../../util/util')

const cpUpload = upload.fields([
    {name: 'main_image', maxCount:1},
    {name: 'other_images', maxCount: 3}
]);

const { 
    createProduct,
    getProducts,
    setWatchList,
    delWatchList,
    reportProduct, 
} = require('../controllers/product_controller');

router.route('/product/upload')
    .post(authentication(), cpUpload, createProduct);

router.route('/product/watchList')
    .post(authentication(), setWatchList)
    .delete(authentication(), delWatchList);

// router.route('/product/watchList/del')
//     .delete(authentication(), delWatchList);

router.route('/product/report')
    .post(authentication(), reportProduct)    

router.route('/product/:category')
    .get(getUserIdByToken(),getProducts);



module.exports = router;