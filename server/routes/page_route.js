const router = require('express').Router();
const path = require('path')

router.route('/product/details')
    .get((req, res) => {
        res.sendFile(path.join(__dirname, '../../public/views/product_details.html'))
});

router.route('/product/:params')
    .get((req, res) => {
        res.sendFile(path.join(__dirname, '../../public/views/product_index.html'))
});

router.route('/user/upload')
    .get((req, res) => {
        res.sendFile(path.join(__dirname, '../../public/views/product_upload.html'))
    })

router.route('/user/signin')
    .get((req, res) => {
    res.sendFile(path.join(__dirname, '../../public/views/user_signin.html'))
    })

router.route('/user/signup')
    .get((req, res) => {
    res.sendFile(path.join(__dirname, '../../public/views/user_signup.html'))
    })

router.route('/user/profile')
    .get((req, res) => {
    res.sendFile(path.join(__dirname, '../../public/views/user_profile.html'))
    })




module.exports = router;