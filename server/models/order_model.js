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

const getUserOrders = async (pageSize, paging, status, userId) => {
    const condition = {sql: '', binding: []}
    const userBinding = [userId]

    console.log(status)

    if (status != null) {
        condition.sql = 'AND status = ? '
        condition.binding = [status]
    }

    const limit = {
        sql: 'LIMIT ?, ?',
        binding: [pageSize * paging, pageSize]
    };

    const orderQuery = 'SELECT * FROM project.order o JOIN product p on o.product_id = p.id WHERE buyer_id = ? ' + condition.sql + limit.sql;
    const orderBindings = userBinding.concat(condition.binding).concat(limit.binding)

    const orderCountQuery = 'SELECT COUNT(*) as count FROM project.order o JOIN product p on o.product_id = p.id WHERE buyer_id = ? ' + condition.sql + limit.sql;
    const orderCountBindings = userBinding.concat(condition.binding).concat(limit.binding)

    console.log(orderQuery)

    try {
        const [orders] = await pool.query(orderQuery, orderBindings)
        const [orderCounts] = await pool.query(orderCountQuery, orderCountBindings)

        const data = {
            dataList: orders, 
            dataListCounts: orderCounts
        }

        return data
    } catch(error) {
        console.log(error)
        return { error }
    }

}

module.exports = {
    createOrder,
    getUserOrders
}