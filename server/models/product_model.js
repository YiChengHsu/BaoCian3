const {pool} = require('./mysqlcon')

const createProduct = async (product, other_images) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        const [result] = await conn.query('INSERT INTO product SET ?', product);
        const images = other_images.map(
            img => ([result.insertId ,img])
        )
        await conn.query('INSERT INTO product_images (product_id, image) VALUES ? ', [images]);
        await conn.query('COMMIT'); 
        return result.insertId;
    } catch (error) {
        await conn.query('ROLLBACK');
        console.log(error)
        return -1;
    } finally {
        await conn.release();
    }
}

const getProducts = async (pageSize, paging, requirement = {}) => {
    const condition = {sql: '', binding: []};
    const filter = {sql: '', binding: []};
    const price = {sql: '', binding: []};
    const order = {sql: ''};
    const isEnd = {sql: ''}

    if (requirement.category) {
        condition.sql = 'WHERE auction_end = 0 AND category = ?';
        condition.binding = [requirement.category];
    } else if (requirement.subCategory) {
        condition.sql = 'WHERE auction_end = 0 AND sub_category = ?';
        condition.binding = [requirement.subCategory];
    } else if (requirement.keyword != null) {
        condition.sql = 'WHERE title LIKE ?';
        condition.binding = [`%${requirement.keyword}%`];
    } else if (requirement.id != null) {
        condition.sql = 'WHERE id = ?';
        condition.binding = [requirement.id];
    } else {
        isEnd.sql = 'WHERE auction_end = 0 '
    }

    if (requirement.id == null && requirement.price.min && requirement.price.max) {
        price.sql = 'AND price BETWEEN ? AND ? '
        price.binding = [requirement.price.min, requirement.price.max]
    } else if (requirement.price && requirement.price.min) {
        price.sql = 'AND price > ? '
        price.binding = [requirement.price.min]
    } else if (requirement.price && requirement.price.max) {
        price.sql = 'AND price < ? '
        price.binding = [requirement.price.max] 
    }

    if (requirement.order == 'hot') {
        order.sql = ' ORDER BY bid_times DESC'
    } else if (requirement.order == 'earliest') {
        order.sql = ' ORDER BY end_time'
    }else if (requirement.order == 'latest') {
        order.sql = ' ORDER BY end_time DESC'
    }else if (requirement.order == 'unpopular') {
        order.sql = ' ORDER BY bid_times'
    } else {
        order.sql = ' ORDER by id'
    }
    

    const limit = {
        sql: ' LIMIT ?, ?',
        binding: [pageSize * paging, pageSize]
    };

    const productQueryRaw = 'SELECT * FROM product ' + condition.sql + price.sql + isEnd.sql + order.sql + limit.sql;
    const productQuery = productQueryRaw.replace("product AND", "product WHERE")
    const productBindings = condition.binding.concat(price.binding).concat(limit.binding);

    const productCountQueryRaw = 'SELECT COUNT(*) as count FROM product ' + condition.sql + order.sql + price.sql;
    const productCountQuery = productCountQueryRaw.replace("product AND", "product WHERE")
    const productCountBindings = condition.binding.concat(price.binding);

    try {
        const [products] = await pool.query(productQuery, productBindings);
        const [productCounts] = await pool.query(productCountQuery, productCountBindings);

        const data = {
            'products': products,
            'productCount': productCounts[0].count
        }
        return data
    } catch (error) {
        console.log(error)
        return { error }
    }
}

const getProductsImages = async (productIds) => {
    try {
        const queryStr = 'SELECT * FROM product_images WHERE product_id in (?) ';
        const bindings = [productIds];
        const [images] = await pool.query(queryStr, bindings)
        return images;
    } catch(error) {
        console.log(error)
    }
}

const getProductById = async (productIds) => {
    const queryStr = 'SELECT * FROM product WHERE id IN (?)';
    const bindings = [productIds];
    const [products] = await pool.query(queryStr, bindings)
    return products;
}

const getProductEndTime = async () => {
    const [endTimeArr]= await pool.query('SELECT id, end_time FROM product WHERE auction_end = 0')
    return endTimeArr;
}

const endProductsAuction = async (productIds) => {

    const getQueryStr = 'SELECT * FROM product WHERE id in (?)'
    const updateQueryStr = 'UPDATE product SET auction_end = 1 WHERE id in (?)'
    const bindings =  [productIds]
    const [orderProduct]= await pool.query(getQueryStr, bindings)
    console.log("hey")
    await pool.query(updateQueryStr, [bindings])
    return orderProduct[0];
}

const setWatchList = async (userId, productId) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');

        const getQueryStr = 'SELECT * FROM watch_list WHERE user_id = ? AND product_id =?'
        const [watchListId] = await conn.query(getQueryStr, [userId, productId])

        if(watchListId.length > 0) {
            await conn.query('COMMIT');
            return -1;
        }

        const queryStr = 'INSERT INTO watch_list SET user_id = ?, product_id = ?'
        const bindings = [userId, productId]
        const [result] = await conn.query(queryStr, bindings)
        return result.insertId

    } catch (error) {
        await conn.query('ROLLBACK');
        console.log(error)
        return -1;
    } finally {
        await conn.release();
    }
    
}

const delWatchList = async (userId, productId) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');

        const getQueryStr = 'SELECT * FROM watch_list WHERE user_id = ? AND product_id =?'
        const [watchListId] = await conn.query(getQueryStr, [userId, productId])

        if(watchListId.length <= 0) {
            await conn.query('COMMIT');
            return -1;
        }


        const result =  await conn.query('DELETE FROM watch_list WHERE id = ?', [watchListId[0].id])

        console.log(result)

        await conn.query('COMMIT'); 
        return 1;
    } catch (error) {
        await conn.query('ROLLBACK');
        console.log(error)
        return -1;
    } finally {
        await conn.release();
    }
}


module.exports = {
    createProduct,
    getProducts,
    getProductsImages,
    getProductById,
    getProductEndTime,
    endProductsAuction,
    setWatchList,
    delWatchList,
}