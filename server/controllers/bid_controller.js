const Bid = require('../models/bid_model');
const Product = require('../models/product_model')
const SortedArray = require("collections/sorted-array");
const { indexOf } = require('lodash');
const Order = require('../models/order_model')
let sortedEndTimeArr;


const getBidRecords = async (req, res) => {
    const productId = req.query.id
    try {
        const bidRecords = await Bid.getBidRecords(productId)
        res.status(200).json({data: bidRecords})  
    } catch (error) {
        res.status(400).json({error})
    }

}

const setNewProductToFinisher = (id, end_time) => {
    const newProduct = {id, end_time}
    sortedEndTimeArr.push(newProduct)
}

const setBidRecord = async (userBid) => {

    const isBidSuccess = await Bid.setBidRecord(userBid)

    if (isBidSuccess.status <= 0) {
        return isBidSuccess
    }

    const bidIndexInArr = sortedEndTimeArr.array.findIndex(e => e.id == Number(userBid.product_id));

    // sortedEndTimeArr.array[bidIndexInArr].end_time += 30000;

    return isBidSuccess
}

const getUserBidRecords = async (req, res) => {
    const productId = req.body.productId
    const userId = req.body.userId
    const [userBidRecords] = await Bid.getUserBidRecords(productId, userId)
    console.log(userBidRecords)
    res.status(200).json({data: userBidRecords})
}

const setBidFinisher = async() => {
    
    const endTimeArr = await Product.getProductEndTime();

    sortedEndTimeArr = new SortedArray(endTimeArr,
        function equals(x,y) {
            return Object.equals(x.end_time, y.end_time)
        },
        function compare(x,y) {
            return Object.compare(x.end_time, y.end_time)
        }
    );

    // const endProductArr = []

    setInterval( async () => {

        
        // while (sortedEndTimeArr.array[0].end_time <= Date.now()) {
        //     const endProductId = sortedEndTimeArr.shift();
        //     console.log(endProductId)
        //     endProductArr.push(endProductId.id)
        // }

        while (sortedEndTimeArr.array[0].end_time <= Date.now()) {
            const endProduct = sortedEndTimeArr.shift().id;
            try {
                console.log(endProduct)
                const orderProduct = await Product.endProductsAuction(endProduct);
                console.log(orderProduct)
                if (orderProduct.highest_user_id) {
                    orderId = await Order.createOrder(orderProduct)
                    console.log(orderId)
                }

            } catch (error) {
                console.log(error)
            }


        }


        // let orderId;
        // let product;

        // if (endProductArr.length > 0) {
        //     product = await Product.endProductsAuction (endProductArr) 
        //     console.log(product)
        // }

        // if (!product) {
        //     return
        // }

        // if (product.length <=0 || !product.highest_user_id) {
        //     return -1
        // }

        // orderId = await Order.createOrder(product)
        // console.log(orderId)

    }, 1000)

}

setBidFinisher();


module.exports = {
    setBidRecord,
    getBidRecords,
    getUserBidRecords,
    setNewProductToFinisher,
};

