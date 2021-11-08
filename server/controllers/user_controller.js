const config = require('../../util/config');
const validator = require('validator');
const User = require('../models/user_model')
const Order = require('../models/order_model');
const { orderBy } = require('lodash');
const { pool } = require('../models/mysqlcon');
const pageSize = 20;

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

    const userId = req.user.id
    console.log(userId)
    const query = req.query
    const paging = parseInt(query.paging) || 0;
    const listType = query.type;
    const status = query.status || null;

    const user = await User.getUserProfileWithDetails(userId)
    const rating = await getRatings(userId)
    user.rating = rating

    const findDataList = async (listType) => {

        if (listType && listType == 'order') {
            return await Order.getUserOrders(pageSize, paging, status, userId)      
        } else {
            return await User.getUserWatchList(pageSize, paging, userId)
        }
    }


    const {dataList, dataListCounts} = await findDataList(listType)

    console.log(dataList)

    let data = {}
    data.user = user

    if (dataListCounts > (paging + 1) * pageSize) {
        data.list = dataList
        data.next_paging =  paging +1
    } else {
        data.list = dataList
    }

    res.status(200).send({data})
    return 
}


const getUserWatchList = async (req, res) => {

    const userId = req.user.id
    try {
        let watchList = await User.getUserWatchList(userId)
        watchList = Object.values(watchList)

        res.status(200).json({
            data: { watchList }
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({error: 'Bad Requset'})
    }
}

const getUserOrders = async (req, res) => {

    const query = req.query
    const status = req.params.status || null;
    const paging = parseInt(query.paging) || 0;

    const {orders, orderCounts} = await Order.getUserOrders(pageSize, paging, status)

    if (!orders) {
        res.status(400).send({ error: 'Bad Request'});
        return
    }

    if (orders.length == 0) {
        res.status(200).json({data: null});
        return
    }

    let result

    if (orderCounts > (paging + 1) * pageSize) {
        result = { data: orders, next_paging: paging +1}
    } else {
        result = { data: orders}
    }

    res.status(200).json(result)

}

const updateUserAddress = async(req ,res) => {
    
    const userId = req.user.id
    const body = req.body
    console.log(1)
    console.log(body)
    const address = { 
        city: body.city,
        town: body.town,
        zipcode: body.zipcode,
        address: body.address,
        receiver: body.receiver,
        phone: body.phone
    }
    const addressId = await User.updateUserAddress(userId, address)

    if (addressId <= 0) {
        res.status(500).send({error: "Database Error"})
        return
    }

    res.status(200).send({addressId})
}

const updateUserAccount = async(req ,res) => {
    
    const userId = req.user.id
    const body = req.body
    const account = { 
        bank_code: body.bankCode,
        bank_account: body.bankAccount,
        account_name: body.accountName,
    }

    const addressId = await User.updateUserAccount(userId, account)

    if (addressId <= 0) {
        res.status(500).send({error: "Database Error"})
        return
    }

    res.status(200).send({addressId})
}

const createRating = async (req, res) => {

    const rateId = req.user.id
    const body = req.body

    const rate = {
        rate_id: ratedId,
        rated_id: body.rated_id,
        order_id: body.order_id,
        rating: body.rating
    }

    const result = await User.createRating(rate)

    if ( result <= 1 ) {
        res.status(500).send({error: 'Datebase error'})
        return
    }

    res.status(200).send({result})
}

const getRatings = async (userId) => {

    let rating = null

    const ratings = await User.getRatings(userId)

    if (ratings.length >0) {
        let ratingSum = ratings.reduce((previous, current) => current += previous);
        rating = ratingSum / ratings.length;
    }

    console.log(ratings)

    return rating
}


module.exports = {
    signIn,
    signUp,
    getUserProfile,
    getUserWatchList,
    getUserOrders,
    updateUserAddress,
    updateUserAccount,
    createRating,
    getRatings
}
