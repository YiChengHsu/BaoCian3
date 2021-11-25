const {pool} = require('./mysqlcon')

const createOrder = async (product) => {

  const conn = await pool.getConnection();

  try {
    await conn.query('START TRANSACTION')
    const [result] = await conn.query('INSERT INTO project.order SET ?', product)
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
  const condition = {
    sql: '',
    binding: []
  }
  const userBinding = [userId]

  console.log(status)

  if (status != null && status == 3) {
    condition.sql = 'AND status in (3,4,5) '
  } else if (status != null) {
    condition.sql = 'AND status = ? '
    condition.binding = [status]
  }

  const limit = {
    sql: 'LIMIT ?, ?',
    binding: [
      pageSize * paging,
      pageSize
    ]
  };

  const orderQuery = 'SELECT *,o.id AS order_id FROM project.order o JOIN product p on o.product_id = p.id WHERE buyer_id = ? ' + condition.sql + limit.sql;
  const orderBindings = userBinding.concat(condition.binding).concat(limit.binding)

  const orderCountQuery = 'SELECT COUNT(*) as count FROM project.order o JOIN product p on o.product_id = p.id WHERE buyer_id = ? ' + condition.sql + limit.sql;
  const orderCountBindings = userBinding.concat(condition.binding).concat(limit.binding)

  console.log(orderQuery)

  try {
    const [orders] = await pool.query(orderQuery, orderBindings)
    const [orderCounts] = await pool.query(orderCountQuery, orderCountBindings)

    console.log(orders)

    const data = {
      dataList: orders,
      dataListCounts: orderCounts[0].count
    }

    return data
  } catch (error) {
    console.log(error)
    return {error}
  }

}

const getSellOrders = async (pageSize, paging, userId) => {
  const userBinding = [userId]

  const limit = {
    sql: 'LIMIT ?, ?',
    binding: [
      pageSize * paging,
      pageSize
    ]
  };

  const orderQuery = 'SELECT *,o.id AS order_id FROM project.order o JOIN product p on o.product_id = p.id WHERE o.seller_id = ? ORDER BY o.pay_deadline DESC ' + limit.sql;
  const orderBindings = userBinding.concat(limit.binding)

  const orderCountQuery = 'SELECT COUNT(*) as count FROM project.order o JOIN product p on o.product_id = p.id WHERE o.seller_id = ? ';
  const orderCountBindings = userBinding

  console.log(orderBindings)

  try {
    const [orders] = await pool.query(orderQuery, orderBindings)
    const [orderCounts] = await pool.query(orderCountQuery, orderCountBindings)

    const data = {
      dataList: orders,
      dataListCounts: orderCounts[0].count
    }

    return data
  } catch (error) {
    console.log(error)
    return {error}
  }

}

const updateOrder = async (orderId, status, delivery) => {
  const conn = await pool.getConnection();

  try {
    await conn.query('START TRANSACTION')
    const [search] = await conn.query('SELECT status FROM project.order WHERE id in (?) ', [orderId])

    console.log(search)

    if (!search || (search[0].status != status)) {
      await conn.query('COMMIT')
      return -1;
    }

    const newStatus = status + 1
    await conn.query('UPDATE project.order SET status = ?, delivery = ? WHERE id = ?', [newStatus, delivery, orderId])
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

const createPayment = async (orderId, paymentIntent) => {

  const queryStr = 'INSERT INTO payment SET order_id = ?, payment_intent = ?, pay_status = 0'
  const bindings = [orderId, paymentIntent]
  const [result] = await pool.query(queryStr, bindings)
  const payId = result.insertId
  return payId
}

const confirmPayment = async (paymentIntent, payment) => {

  payment.pay_time = Date.now();

  const conn = await pool.getConnection();
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

    if (isOtherUnpaidOrder.length == 0) {
      const [result] = await conn.query('UPDATE user SET role_id = 0 WHERE id = ?', [buyerId])
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
