const { pool } = require('./mysqlcon');

const setBidRecord = async (bidRecord) => {
    const conn = await pool.getConnection();
    try {
        
        await conn.query('START TRANSACTION');

        const [user_role] = await conn.query('SELECT role_id FROM user WHERE id in (?) ', [bidRecord.user_id])

        console.log(user_role)
        
        if (user_role[0].role_id == 2) {
            await conn.query('COMMIT')
            return {status: -1};
        }

        const [hightestBid] = await conn.query('SELECT highest_bid FROM product WHERE id in (?) FOR UPDATE', [bidRecord.product_id])

        if (bidRecord.bid_amount <= hightestBid[0].highest_bid) {
            await conn.query('COMMIT')
            return {status: 0};
        }

        await conn.query('INSERT INTO bid_record SET ?', bidRecord);
        await conn.query('UPDATE product SET highest_bid = ?, bid_times = bid_times + 1, end_time = end_time + 30000, highest_user_id = ? WHERE id = ?', [bidRecord.bid_amount, bidRecord.user_id, bidRecord.product_id])
        await conn.query('COMMIT');
        return {status:1} ;
    } catch(error) {
        await conn.query('ROLLBACK');
        console.log(error)
        return {error:"Datebase error"};
    } finally {
        conn.release();
    }
};

const getBidRecords = async (productIds) => {
    try {
        const queryStr = 'SELECT * FROM bid_record WHERE product_id in (?) ORDER by bid_amount DESC LIMIT 5 ';
        const bindings = [productIds]
        const [bidRecords] = await pool.query(queryStr, bindings);
        return bidRecords;
    } catch (error) {
        console.log(error)
    }
}

const getUserBidRecords = async (productId, userId) => {
    const [userBidRecords] = await pool.query('SELECT * FROM bid_record WHERE product_id = ? AND user_id = ?', [productId, userId])
    return userBidRecords; 
}

const getHotProducts = async () => {
    try {
        const [hotProducts] = await pool.query('SELECT * FROM product ORDER BY bid_time DESC LIMIT 5')
        return [hotProducts]
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    setBidRecord,
    getBidRecords,
    getUserBidRecords,
    getHotProducts,
};