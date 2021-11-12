const Product = require('../models/product_model');
const _ = require('lodash')
const pageSize = 20;
const Bid = require('../models/bid_model')
const { setNewProductToFinisher } = require('./bid_controller')
const User = require('../models/user_model')

const createProduct = async(req, res) => {
    const user = req.user.id
    const body = req.body;
    const product = {
        category: body.category,
        sub_category: body.sub_category,
        title: body.title,
        price: body.price,
        bid_incr: body.bid_incr,
        description: body.description,
        texture: body.texture,
        condition: body.condition,
        original_packaging: body.original_packaging,
        with_papers: body.with_papers,
        place: body.place,
        seller_id: user,
        end_time: Date.parse(body.end_time),
        highest_bid: body.price,
    }


    product.main_image = req.files.main_image[0].key;


    const other_images = req.files.other_images.map(
        img => ([img.key])
    )

    const productId = await Product.createProduct(product, other_images)
    if (productId == -1) {
        res.status(500);
    } else {
        setNewProductToFinisher(productId, product.end_time)
        res.status(200).send({productId});
    }
}

const getProducts =  async (req, res) => {

    //If token exist, Get the watch list from DB
    let watchList = []
    if (req.user != null) {
        const userId = req.user.id
        const result = await User.getUserWatchProductIds(userId)
        watchList = Object.values(result).map(e => e.product_id)
    } 

    const category = req.params.category;
    const query = req.query
    const paging = parseInt(query.paging) || 0;
    const order = query.order || null;
    console.log(req.query)


    const price = {
        min: query.min,
        max: query.max,
    }

    // const subCategoryArr = ['men_shirt', 'men_pants', 'men_shoes', 'men_bag', 'men_accessories', 'men_others', 'women_shirt', 'women_dress', 'women_skirt', 'women_pants', 'women_shoes', 'women_bag', 'women_accessories', 'women_others','watch', 'bag', 'luxury_others', 'phone', 'computer', 'peripherals', 'earphone', 'camera', 'electronics_others', 'other']

    const findProduct = async (category) => {
        
        switch (category) {
            case 'all':
                return await Product.getProducts(pageSize, paging, {price, order});
            case 'men': case 'women': case 'accessories': case 'electronics': case 'other':
                return await Product.getProducts(pageSize, paging, {category, price, order});
            case 'search': 
                const keyword = query.keyword;
                if (keyword) {
                    return await Product.getProducts(pageSize, paging, {keyword, price, order});
                }
                break;
            case 'details':
                const id = parseInt(query.id);
                if (Number.isInteger(id)) {
                    return await Product.getProducts(pageSize, paging, {id});
                }
                break;
            case 'men_shirt': case 'men_pants': case 'men_shoes': case 'men_bag': case 'men_accessories': case 'men_others': case 'women_shirt': case 'women_dress': case 'women_skirt': case 'women_pants': case 'women_shoes': case 'women_bag': case 'women_accessories': case 'women_others': case'watch': case 'bag': case 'luxury_others': case 'phone': case 'computer': case 'peripherals': case 'earphone': case 'camera': case 'electronics_others': 
                const subCategory = category
                console.log(subCategory)
                return await Product.getProducts(pageSize, paging, {subCategory, price, order});
            default: {
                return ({});
            }
        }
    }

    const {products, productCount} = await findProduct(category);

    if (!products) {
        res.status(400).send({ error: 'Bad Request'});
        return;
    }

    if (products.length == 0) {
        if (category == 'details') {
            res.status(200).json({data: null});
        } else {
            res.status(200).json({data: []})
        };
        return;
    }

    let productsWitherSeller = await getProductSellerInfo(products)
    let productsWithImages = await getProductsImages(products)
    let productWithWatchTimes = await getProductWatchTimes(products)
    let productsWithRecords = await getProductBidRecords (products)
    let productsWithDetails

    if (category == 'details') {
        productsWithDetails = productsWithRecords[0]
    } else {
        productsWithDetails = productsWithImages
    }

    let result;
    if (productCount > (paging + 1) * pageSize) {
        result = { data: productsWithDetails, next_paging: paging +1, user: watchList}
    } else {
        result = { data: productsWithDetails, user: watchList}
    }

    res.status(200).json(result)

}

const getProductsImages = async (products) => {
    const productIds = products.map(e => e.id);
    const images = await Product.getProductsImages(productIds);
    const imagesMap = _.groupBy(images, e => e.product_id)

    const imagePath = 'https://s3.ap-northeast-1.amazonaws.com/node.js-image-bucket/'

    return products.map((e) => {
        e.main_image = e.main_image ? imagePath + e.main_image : null;
        e.images = e.images ? e.images.split(',').map(img => imagePath + img) : null; 

        e.images = imagesMap[e.id].map(img => imagePath + img.image)
        return e;
    })
}

const getProductBidRecords = async(products) => {
    const productIds = products.map(e => e.id);
    const records = await Bid.getBidRecords(productIds)
    const recordsMap = _.groupBy(records, e => e.product_id)

    return products.map((e) => {
        if (records.length == 0) {
            e.records = []
        } else {
            e.records = recordsMap[e.id] 
        }
        return e
    })
}

const getProductSellerInfo = async(products) => {
    const sellerIds = products.map(e => e.seller_id)
    let sellers = await Product.getProductSeller(sellerIds)

    const sellersRating = await User.getRatings(sellerIds)
    let ratingSum = {}
    sellersRating.map((e) => {
        if (ratingSum[e.rated_id]) {
            ratingSum[e.rated_id] += e.rating
        } else {
            ratingSum[e.rated_id] = e.rating
        }
    })

    let ratingCount = _.countBy(sellersRating, e => e.rated_id)

    let ratingAvg = {}
    Object.keys(ratingSum).map((e) => {
        ratingAvg[e] = ratingSum[e] / ratingCount[e]
    })

    sellers = sellers.map((e) => {
        e.rating = ratingAvg[e.id]
        return e
    })

    let sellersMap = _.groupBy(sellers, e => e.id)

    return products.map((e) => {
        e.sellerInfo = sellersMap[e.seller_id][0]
        return e
    })
}

const getProductWatchTimes = async (products) => {
    const productIds = products.map(e => e.id);
    const watchTimes = await Product.getWatchTimes(productIds);
    const watchTimesMap = _.groupBy(watchTimes, e => e.id)

    console.log(watchTimesMap)

    return products.map((e) => {
        if (watchTimesMap[e.id]) {
            e.watchTimes = watchTimesMap[e.id][0].watch_times
        } else e.watchTimes = 0
        return e
    })

}

const setWatchList = async (req, res) => {
    const productId = req.body.productId
    const user = req.user

    if (!user || 
        !user.id) {
        res.status(401).send({error: "Unauthorized"})
        return 
    }
    
    const watchListId =  await Product.setWatchList(user.id, productId)
    if (watchListId < 0) {
        res.status(400).send({error: "Bad Request"})
        return
    }

    res.status(200).send({message:"Set the product in to watch list"})

}

const delWatchList = async (req, res) => {
    console.log(req.body)
    const productId = req.body.productId
    const user = req.user

    console.log(user)

    if (!user || !user.id) {
        res.status(401).send({error: "Unauthorized"})
        return 
    }

    const delResult = await Product.delWatchList(user.id, productId)

    if ( delResult < 0) {
        res.status(400).send({error: "Bad Request"})
        return
    } 

    res.status(200).send("Delete success")
}


module.exports = {
    createProduct,
    getProducts,
    setWatchList,
    delWatchList,
    getProductSellerInfo,
    getProductsImages,
    getProductWatchTimes,
}