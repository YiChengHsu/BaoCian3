const { pool } = require('./mysqlcon');

const setBidRecord = async (bidRecord) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        await conn.query('SELECT * FROM bid_record FOR UPDATE')
        await conn.query('INSERT INTO bid_record SET ?', bidRecord);
        await conn.query('UPDATE product SET bid_current_number = ?, bid_time = bid_time + 1, end_time = end_time + 30000 WHERE id = ?', [bidRecord.bid_current_number, bidRecord.product_id])
        await conn.query('COMMIT');
        return true;
    } catch(error) {
        await conn.query('ROLLBACK');
        console.log(error)
        return {error};
    } finally {
        conn.release();
    }
};

const getBidRecords = async (productId) => {
    try {
        const [bidRecords] = await pool.query('SELECT * FROM bid_record WHERE product_id = (?) ORDER by bid_current_number DESC LIMIT 5' , [productId]);
        return bidRecords;
    } catch (error) {
        return {error: "Database error"}
    }
}

const getUserBidRecords = async (productId, userId) => {
    try {
        const [userBidRecords] = await pool.query('SELECT * FROM bid_record WHERE product_id = ? AND user_id = ?', [productId, userId])
        return userBidRecords;  
    }catch (err) {
        console.log(err)
    }

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