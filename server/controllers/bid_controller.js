const Bid = require('../models/bid_model');
const Product = require('../models/product_model')
const SortedArray = require("collections/sorted-array");
const Order = require('../models/order_model')
let productSortedArrWithEndTime;

const setBidRecord = async (userBid) => {

  const isBidSuccess = await Bid.setBidRecord(userBid)
  if (isBidSuccess.status <= 0) {
    return isBidSuccess
  }

  const bidIndexInArr = productSortedArrWithEndTime.array.findIndex(e => e.id == Number(userBid.product_id)) 
  productSortedArrWithEndTime.array[bidIndexInArr].end_time += 30000;
  return isBidSuccess
}

const getBidRecords = async (req, res) => {
  const productId = req.query.id
  try {
    const bidRecords = await Bid.getBidRecords(productId)
    res.status(200).json({data: bidRecords})
  } catch (error) {
    res.status(400).json({error})
  }
}

const setNewProductToFinisher = (id, endTime) => {
  const newProduct = {id, endTime}
  sortedEndTimeArr.push(newProduct)
}

const setBidFinisher = async () => {

  //Set the Arr when server set up
  const endTimeArr = await Product.getProductEndTime();

  sortedEndTimeArr = new SortedArray(endTimeArr, function equals(x, y) {
    return Object.equals(x.end_time, y.end_time)
  }, function compare(x, y) {
    return Object.compare(x.end_time, y.end_time)
  });

  setInterval(async () => {
    while (sortedEndTimeArr.array[0].end_time <= Date.now()) {
      const endProduct = sortedEndTimeArr.shift().id;
      const orderProduct = await Product.endProductsAuction(endProduct);
      if (orderProduct.highest_user_id) {
        createOrder(orderProduct)
      }
    }
  }, 1000)
}

const createOrder = async (product) => {

  const order = {
    product_id: product.id,
    title: product.title,
    total: product.highest_bid,
    seller_id: product.seller_id,
    main_image: product.main_image,
    buyer_id: product.highest_user_id,
    pay_deadline: (Date.now() + 2 * 24 * 60 * 60 * 1000)
  }

  try {
    await Order.createOrder(order)
  } catch (error) {
    console.log(error)
  }
}

//Set the finisher when server set up
setBidFinisher();

module.exports = {
  setBidRecord,
  getBidRecords,
  setNewProductToFinisher
};
