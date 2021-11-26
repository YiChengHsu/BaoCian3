const {pool} = require('./mysqlcon');

const setBidRecord = async (bidRecord) => {
  const conn = await pool.getConnection();
  try {

    await conn.query('START TRANSACTION');

    const [user_role] = await conn.query('SELECT role_id FROM user WHERE id in (?) ', [bidRecord.user_id])

    console.log(user_role)

    if (user_role[0].role_id == 2) {
      await conn.query('COMMIT')
      return {error: 'Unpaid user'};
    }

    const [hightestBid] = await conn.query('SELECT highest_bid FROM product WHERE id in (?) FOR UPDATE', [bidRecord.product_id])

    if (bidRecord.bid_amount<= hightestBid[0].highest_bid) {
      await conn.query('COMMIT')
      return {error: 'Invalid bid'};
    }

    await conn.query('INSERT INTO bid_record SET ?', bidRecord);
    await conn.query('UPDATE product SET highest_bid = ?, bid_times = bid_times + 1, end_time = end_time + 30000, highest_user_id = ? WHERE id = ?', [bidRecord.bid_amount, bidRecord.user_id, bidRecord.product_id])
    await conn.query('COMMIT');
    return {msg: 'Bid success'} ;
  } catch(error) {
      await conn.query('ROLLBACK');
      console.log(error)
      return {error:"Database error"};
  } finally {
    conn.release();
  }
};

const getBidRecords = async (productIds) => {
  const queryStr = 'SELECT * FROM bid_record WHERE product_id in (?) ORDER by bid_amount DESC LIMIT 5 ';
  const bindings = [productIds]
  const [bidRecords] = await pool.query(queryStr, bindings);
  return bidRecords;
}

const getUserBadeProducts = async (userId) => {
  const queryStr = 'SELECT DISTINCT product_id FROM bid_record WHERE user_id = ?'
  const bindings = [userId]
  const [productIds] = await pool.query(queryStr, bindings)
  return productIds
}

module.exports =
  { setBidRecord,
  getBidRecords,
  getUserBadeProducts
};
