const Bid = require('../models/bid_model');

const getBidRecords = async (req, res) => {
    const productId = req.query.id
    try {
        const bidRecords = await Bid.getBidRecords(productId)
        res.status(200).json({data: bidRecords})  
    } catch (error) {
        res.status(400).json({error})
    }

}

const setBidRecord = async (req, res) => {
    const bid = req.body
    const bidRecord = {
        'product_id': bid.productId,
        'user_id': bid.userId,
        'bid_number': bid.bidNumber,
        'bid_current_number': bid.currentBid
    }
    try {
        const result = await Bid.setBidRecord(bidRecord)
        return result;
    } catch (error) {
        res.status(500).send({error})
    }
}

const getUserBidRecords = async (req, res) => {
    const productId = req.body.productId
    const userId = req.body.userId
    const [userBidRecords] = await Bid.getUserBidRecords(productId, userId)
    console.log(userBidRecords)
    res.status(200).json({data: userBidRecords})
}

module.exports = {
    setBidRecord,
    getBidRecords,
    getUserBidRecords,
};

