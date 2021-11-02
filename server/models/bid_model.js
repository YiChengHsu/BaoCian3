const { pool } = require('./mysqlcon');

const setBidRecord = async (bidRecord) => {
    const conn = await pool.getConnection();
    try {

        console.log(bidRecord)
        
        await conn.query('START TRANSACTION');
        const [hightestBid] = await conn.query('SELECT highest_bid FROM product WHERE id in (?) FOR UPDATE', [bidRecord.product_id])

        console.log(hightestBid)

        if (bidRecord.bid_amount <= hightestBid[0].highest_bid) {
            await conn.query('COMMIT')
            return {error:"Bid amount is lower than current highest bid"};
        }

        await conn.query('INSERT INTO bid_record SET ?', bidRecord);
        await conn.query('UPDATE product SET highest_bid = ?, bid_times = bid_times + 1, end_time = end_time + 30000, highest_user_id = ? WHERE id = ?', [bidRecord.bid_amount, bidRecord.user_id, bidRecord.product_id])
        await conn.query('COMMIT');
        return 1;
    } catch(error) {
        await conn.query('ROLLBACK');
        console.log(error)
        return -1;
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