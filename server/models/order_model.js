const {pool} = require('./mysqlcon')

const createOrder = async (product) => {

    const order = {
        product_id: product.id,
        title: product.title,
        total: product.highest_bid,
        seller_id: product.seller_id,
        main_image: product.main_image,
        buyer_id: product.highest_user_id,
        pay_deadline: (Date.now() + 2*24*60*60*1000)
    }

    const conn = await pool.getConnection();

    try {
        await conn.query('START TRANSACTION')
        const [result] = await conn.query('INSERT INTO project.order SET ?', order)
        console.log(result)
        await conn.query('COMMIT')
        return result.insertId
    } catch (error) {
        await conn.query('ROLLBACK');
        console.log(error)
        return -1;
    } finally {
        await conn.release();
    }
}

module.exports = {
    createOrder,
}