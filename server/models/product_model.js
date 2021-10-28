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

const getProducts = async (pageSize, paging = 0, filterId=[] ,requirement = {}) => {
    const condition = {sql: '', binding: []};
    const filter = {sql: '', binding: []};
    const price = {sql: '', binding: []};
    const time = {sql: '', binding: []};

    if (requirement.category) {
        condition.sql = 'WHERE category = ?';
        condition.binding = [re.requirement.category];
    } else if (requirement.keyword != null) {
        condition.sql = 'WHERE title LIKE ?';
        condidition.binding = [`%${requirement.keyword}%`];
    } else if (requirement.id != null) {
        condition.sql = 'WHERE id = ?';
        condition.binding = [requirement.id];
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

    const limit = {
        sql: ' LIMIT ?, ?',
        binding: [pageSize * paging, pageSize]
    };

    const productQueryRaw = 'SELECT * FROM product ' + condition.sql + filter.sql + price.sql + ' ORDER by id' + limit.sql;
    const productQuery = productQueryRaw.replace("product AND", "product WHERE")
    const productBindings = condition.binding.concat(filter.binding).concat(price.binding).concat(limit.binding);

    const productCountQueryRaw = 'SELECT COUNT(*) as count FROM product ' + condition.sql + filter.sql + price.sql;
    const productCountQuery = productCountQueryRaw.replace("product AND", "product WHERE")
    const productCountBindings = condition.binding.concat(filter.binding).concat(price.binding);

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
    const products = await pool.query(queryStr, bindings)
    return products[0];
}

module.exports = {
    createProduct,
    getProducts,
    getProductsImages,
    getProductById
}