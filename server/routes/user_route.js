const router = require('express').Router();
const { upload, authentication } = require('../../util/util')

const cpUpload = upload.fields([
    {name: 'avatar', maxCount:1}
]);

const {
    signUp,
    signIn,
    getUserProfile,
} = require('../controllers/user_controller');

router.route('/user/signup')
    .get((req, res) => {res.render('user_signup')})
    .post(cpUpload, signUp);

router.route('/user/signin')
    .get((req, res) => {res.send("This is signin page")})
    .post(signIn);

router.route('/user/profile')
    .get(authentication(), getUserProfile)

module.exports = router;