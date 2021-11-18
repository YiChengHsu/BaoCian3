const router = require('express').Router();
const { upload, authentication } = require('../../util/util')

const {
    signUp,
    signIn,
    getUserProfile,
    getUserWatchList,
    getUserOrders,
    getUserAddress,
    updateUserAddress,
    updateUserAccount,
    createRating,
} = require('../controllers/user_controller');

router.route('/user/signup')
    .post(upload.single('avatar'), signUp);

router.route('/user/signin')
    .post(signIn);

router.route('/user/profile')
    .get(authentication(), getUserProfile)

router.route('/user/order')
    .get(authentication(), getUserOrders)

router.route('/user/address')
    .get(authentication(), getUserAddress)
    .post(authentication(), upload.array() ,updateUserAddress)

router.route('/user/account')
    .post(authentication(), upload.array() ,updateUserAccount)

router.route('/user/rating')
    .post(authentication(), createRating)

router.route('/user/:records')
    .get(authentication(), getUserWatchList)

module.exports = router;