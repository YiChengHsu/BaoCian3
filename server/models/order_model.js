const { result } = require('lodash');
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

    const orderQuery = 'SELECT *,o.id AS order_id FROM project.order o JOIN product p on o.product_id = p.id WHERE buyer_id = ? ' + condition.sql + limit.sql;
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

const getSellOrders = async (pageSize, paging, status, userId) => {
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

    const orderQuery = 'SELECT *,o.id AS order_id FROM project.order o JOIN product p on o.product_id = p.id WHERE o.seller_id = ? ' + condition.sql + limit.sql;
    const orderBindings = userBinding.concat(condition.binding).concat(limit.binding)

    const orderCountQuery = 'SELECT COUNT(*) as count FROM project.order o JOIN product p on o.product_id = p.id WHERE o.seller_id = ? ' + condition.sql + limit.sql;
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

const updateOrder = async (userId, orderId, status, delivery) => {
    const conn = await pool.getConnection();

    try {
        await conn.query('START TRANSACTION')
        const [search] = await conn.query('SELECT * FROM project.order WHERE id = ? ', [orderId])

        console.log(search)

        if (!search || (search[0].status != status)) {
            await conn.query('COMMIT')
            return -1;
        }

        const newStatus = status + 1
        await conn.query('UPDATE project.order SET status = ?, delivery = ? WHERE id = ?', [newStatus, delivery ,orderId])
        await conn.query('COMMIT')
        return 1;

    } catch (error) {
        await conn.query('ROLLBACK');
        console.log(error)
        return error;
    } finally {
        await conn.release();
    }
}

const createPayment = async (userId, orderId, paymentIntent) => {
    
    const queryStr = 'INSERT INTO payment SET order_id = ?, user_id = ?, payment_intent = ?, pay_status = 0'
    const bindings = [orderId, userId ,paymentIntent]

    try {
        const [result] = await pool.query(queryStr, bindings)
        const payId = result.insertId  
    } catch(error) {
        console.log(error)
        return -1
    }

    return 1
}

const confirmPayment = async (paymentIntent, payment) => {

    const conn = await pool.getConnection();
    payment.pay_time = Date.now();

    try {
        await conn.query('START TRANSACTION')
        const [search] = await conn.query('SELECT id, user_id, order_id FROM payment WHERE payment_intent = ? ', paymentIntent)

        if (search.length <= 0) {
            await conn.query('COMMIT')
            return -1;
        }
        
        const payId = search[0].id
        const buyerId = search[0].user_id
        const orderId = search[0].order_id

        await conn.query('UPDATE payment SET ?  WHERE id = ?', [payment, payId])
        await conn.query('UPDATE project.order SET status = 1 WHERE id = ?', orderId)

        const [isOtherUnpaidOrder] = await conn.query('SELECT * FROM project.order WHERE status = 0 AND buyer_id = ? AND pay_deadline < ?', [buyerId, payment.pay_time])

        console.log(isOtherUnpaidOrder)

        if (isOtherUnpaidOrder.length == 0) {
            const [result] = await conn.query('UPDATE user SET role_id = 0 WHERE id = ?', [buyerId])
            console.log(result)
        }

        
        await conn.query('COMMIT')
        return 1;

    } catch (error) {
        await conn.query('ROLLBACK');
        console.log(error)
        return error;
    } finally {
        await conn.release();
    }
}

const getExpiredOrder = async () => {
    const [endTimeArr] = await pool.query('SELECT id, buyer_id, pay_deadline FROM project.order WHERE status = 0')
    return endTimeArr
}


module.exports = {
    createOrder,
    getUserOrders,
    getSellOrders,
    updateOrder,
    createPayment,
    confirmPayment,
    getExpiredOrder
}