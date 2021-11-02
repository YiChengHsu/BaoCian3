const config = require('../../util/config');
const validator = require('validator');
const User = require('../models/user_model')

const signUp = async (req ,res) => {
    let body = req.body;
    let avatar;

    if (req.file) {
        avatar = req.files.avatar[0].key
    }

    if (!body.name || !body.email || !body.password) {
        res.status(400).send({error: 'Request Error: Name, email, or password can not be empty'})
        console.log("Wrong email")
        return
    }

    if (!validator.isEmail(body.email)) { //User validator to test the email form
        res.status(400).send({error: 'Request Error: Invalid email format'})
        console.log("Wrong email")
    }

    body.name = validator.escape(body.name); //replace symbol with HTML entities.

    const result = await User.nativeSignUp(body.name, body.email, body.password, avatar);
    if (result.error) {
        console.log(result.error)
        res.status(403).send({error: result.error})
        return;
    }

    const user = result.user;
    if (!user) {
        res.status(500).send({error: "Database error"});
        return;
    }

    console.log(user)

    res.status(200).send({
        data:{
            access_token: user.access_token,
            access_expired: user.access_expired,
            login_at: user.login_at,
            user : {
                id: user.id,
                provider: user.provider,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        }
    });
};

const signIn = async (req, res) => {
    const body = req.body;
    console.log(body)

    let result;

    switch (body.provider) {
        case 'native':
            result = await User.nativeSignIn(body.email, body.password);
            break;
        // case 'facebook':
        //     result = await User.facebookSignIn(body.access_token);
        //     break;
        default:
            res.status(403).send({error: "Request Error: Wrong Request"})
    }       

    const user = result.user;
    if (!user) {
        res.status(403).send({error: 'Forbidden'});
    }

    console.log(!user)

    res.status(200).send({
        data:{
            access_token: user.access_token,
            access_expired: user.access_expired,
            login_at: user.login_at,
            user : {
                id: user.id,
                provider: user.provider,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        }
    });
}

const nativeSignIn = async (email, password) => {
    if (!email || !password) {
        return res.send(400).send({error: "Request Error: email and password are required"})
    }

    try {
        const result = User.nativeSignIn(email, password);
        return result;
    } catch (error) {
        return {error};
    }
}

const getUserProfile = async (req, res) => {
    res.status(200).send({
        data: {
            provider: req.user.provider,
            name: req.user.name,
            email: req.user.email,
            picture: `https://s3.ap-northeast-1.amazonaws.com/node.js-image-bucket/${req.user.picture}`
        }
    })
    return
}

module.exports = {
    signIn,
    signUp,
    getUserProfile,
}
