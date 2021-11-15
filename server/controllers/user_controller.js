const config = require('../../util/config');
const validator = require('validator');
const User = require('../models/user_model')
const Order = require('../models/order_model');
const { orderBy } = require('lodash');
const { pool } = require('../models/mysqlcon');
const pageSize = 20;
const {
    getProductSellerInfo,
    getProductsImages,
    getProductWatchTimes,
} = require('../controllers/product_controller')
require('dotenv').config();

const signUp = async (req ,res) => {
    console.log(req.file)
    let body = req.body;
    let avatar = req.file ? req.file.key: 'sorry-my-wallet/user_default.png' 

    if (req.file) {
        avatar = req.file.key
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
                picture: process.env.IMAGE_PATH + user.picture
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
    const query = req.query
    console.log(query)
    const paging = parseInt(query.paging) || 0;
    const listType = query.type;
    const status = query.status || null;

    const user = await User.getUserProfileWithDetails(userId)

    const findDataList = async (listType) => {

        if (listType && listType == 'order') {
            return await Order.getUserOrders(pageSize, paging, status, userId)      
        } else if (listType && listType == 'sell') {
            return await Order.getSellOrders(pageSize, paging, userId)   
        } else  {
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

    const pageSize = 20

    const userId = req.user.id
    const paging = parseInt(req.query.paging) || 0

    let watchList = await User.getUserWatchProductIds(userId)
    watchList = Object.values(watchList).map(e => e.product_id)

    const {products, productCount} = await User.getUserWatchList(pageSize, paging, userId)

    if (products.length == 0) {
        res.status(200).json({data: []})
        return;
    }

    let productsWitherSeller = await getProductSellerInfo(products)
    let productsWithImages = await getProductsImages(products)
    let productWithWatchTimes = await getProductWatchTimes(products)
    let productsWithDetails

    productsWithDetails = productsWithImages

    let result;
    if (productCount > (paging + 1) * pageSize) {
        result = { data: productsWithDetails, next_paging: paging +1, user: watchList}
    } else {
        result = { data: productsWithDetails, user: watchList}
    }

    res.status(200).json(result)

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

const getUserAddress = async (req, res) => {

    const userId = req.query.id

    const address = await User.getUserAddress(userId)

    if ( address.length <= 0) {
        res.status(400).send({error: "Bad Request"})
        return
    }
    res.status(200).send({data: address})
}

const updateUserAddress = async(req ,res) => {
    
    const userId = req.user.id
    const body = req.body

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

    const ratedId = body.ratedId
    const orderId = body.orderId
    const rating = body.rating

    try {
        const result = await User.createRating(rateId, ratedId, orderId, rating)

        console.log(result)

        if ( result <= 1 ) {
            res.status(400).send({error: 'Bad Request'})
            return
        }

        const result2 = await Order.updateOrder(rateId, orderId, 3, null)

        if ( result <= 1 ) {
            res.status(400).send({error: 'Bad Request'})
            return
        }

        console.log(result2)
    
        res.status(200).send({result})
    } catch (err) {
        console.log(err)

        res.status(500).send({error: 'Datebase error'})
        return
    }

}

const getRatings = async (userId) => {

    let rating = null

    let ratings = await User.getRatings(userId)

    ratings = ratings.map(e => e.rating)

    // rating = Object.values(rating)

    if (ratings.length >0) {
        let ratingSum = ratings.reduce((previous, current) => current += previous);
        rating = ratingSum / ratings.length;
    }

    return rating
}


module.exports = {
    signIn,
    signUp,
    getUserProfile,
    getUserWatchList,
    getUserOrders,
    getUserAddress,
    updateUserAddress,
    updateUserAccount,
    createRating,
    getRatings
}
