const router = require('express').Router();
const path = require('path')

router.route('/')
    .get((req, res) => {
        res.render('product_index')
});

router.route('/product/details')
    .get((req, res) => {
        res.render('product_details')
});

router.route('/product/:params')
    .get((req, res) => {
        res.render('product_index')
});

// router.route('/user/like')
//     .get((req, res) => {
//         res.render('product_index')
//     })

// router.route('/user/bade')
//     .get((req, res) => {
//         res.render('product_index')
//     })

router.route('/user/upload')
    .get((req, res) => {
        res.render('product_upload')
    })

router.route('/user/signin')
    .get((req, res) => {
    res.render('user_signin')
    })

router.route('/user/signup')
    .get((req, res) => {
    res.render('user_signup')
})

router.route('/user/profile')
    .get((req, res) => {
    res.render('user_profile')
})

router.route('/user/:records')
    .get((req, res) => {
    res.render('product_index')  
})

router.route('/order/success')
    .get((req, res) => {
    res.render('pay_success')
})




module.exports = router;