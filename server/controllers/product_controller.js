const Product = require('../models/product_model');
const _ = require('lodash')
const pageSize = 6;
const Bid = require('../models/bid_model')

const createProduct = async(req, res) => {
    const body = req.body;
    const product = {
        category: body.category,
        title: body.title,
        brand: body.brand,
        description: body.description,
        price: body.price,
        texture: body.texture,
        condition: body.condition,
        original_packaging: body.original_packaging,
        with_papers: body.with_papers,
        place: body.place,
        note: body.note,                                
        story: body.story,
        seller_id: '1',
        start_time: Date.parse(body.start_time),
        end_time: Date.parse(body.end_time),
        highest_bid: body.price,
        bid_incr: body.bid_incr
    }

    product.main_image = req.files.main_image[0].key;


    const other_images = req.files.other_images.map(
        img => ([img.key])
    )

    const productId = await Product.createProduct(product, other_images)
    if (productId == -1) {
        res.status(500);
    } else {
        console.log(productId)
        res.status(200).send({productId});
    }
}

const getProducts =  async (req, res) => {
    const category = req.params.category;
    const query = req.query
    const paging = parseInt(query.paging) || 0;

    const filterId = []


    const price = {
        min: query.min,
        max: query.max,
    }

    async function findProduct (category) {
        switch (category) {
            case 'all':
                return await Product.getProducts(pageSize, paging, filterId, {price});
            case 'men':
                return await Product.getProducts(pageSize, paging, filterId, {category, price});
            case 'search': 
                const keyword = query.keyword;
                if (keyword) {
                    return await Product.getProducts(pageSize, paging, null, {keyword, price});
                }
                break;
            case 'hot':
                return await Product.getProducts(null, null, null, {category});
            case 'details':
                const id = parseInt(query.id);
                if (Number.isInteger(id)) {
                    return await Product.getProducts(pageSize, paging, null, {id});
                }
            default: {
                return ({});
            }
        }
    }

    const {products, productCount} = await findProduct(category);

    let productsWithImages = await getProductsImages(products)
    let productsWithRecords = await getProductBidRecords (products)
    let productsWithDetails

    if (category == 'details') {
        productsWithDetails = productsWithRecords[0]
    } else {
        productsWithDetails = productsWithImages
    }

    if (!products) {
        res.status(400).send({ error: 'Bad Request'});
        return;
    }

    if (products.length == 0) {
        if (category == 'details') {
            res.status(200).json({data: null});
        } else {
            res.status(200).jso({data: []})
        };
        return;
    }

    let result;
    if (productCount > (paging + 1) * pageSize) {
        result = { data: productsWithDetails, next_paging: paging +1}
    } else {
        result = { data: productsWithDetails}
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

module.exports = {
    createProduct,
    getProducts
}