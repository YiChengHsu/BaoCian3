const { pool } = require('./mysqlcon')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../../util/config')

const nativeSignUp = async (name, email, password, avatar) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');

        const emails = await conn.query(
            'SELECT email FROM user WHERE email = ? FOR UPDATE', [email]
        );
        if (emails[0].length > 0) {
            await conn.query('COMMIT');
            return { error: "Email Already Exists"};
        }

        const loginAt = new Date();
        const accessExpire = config.token.accessExpire

        const user = {
            provider: 'native',
            email: email,
            password: bcrypt.hashSync(password, 10),
            name: name,
            access_expired: accessExpire,
            login_at: loginAt,
            picture: avatar,
        }

        const accessToken = jwt.sign(
            {
                provider: user.provider,
                name: user.name,
                email: user.email,
                picture: user.picture
            },
            config.token.accessToken
        );

        user.access_token = accessToken;
        user.provider = 'native';

        console.log(user)

        const [result] = await conn.query('INSERT INTo user SET ?', user);
        user.id = result.insertId;
        await conn.query('COMMIT');
        return { user };
    } catch (error) {
        console.log(error);
        await conn.query('ROLLBACK');
        return { error };
    } finally {
        conn.release();
    }
};

const nativeSignIn = async (email, password) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');

        const [result] = await conn.query('SELECT * FROM user WHERE email = ?', [email]);

        const user = result[0];
        if (!bcrypt.compareSync(password, user.password)) {
            await conn.query('COMMIT');
            return { error: 'Password is wrong'};
        }

        const loginAt = new Date();
        const accessExpire = config.token.accessExpire
        const accessToken = jwt.sign(
            {
                provider: user.provider,
                name: user.name,
                email: user.email,
                picture: user.picture
            },
            config.token.accessToken
        );

        await conn.query('UPDATE user SET access_token = ?, access_expired = ?, login_at = ? WHERE id = ?', [accessToken, accessExpire, loginAt, user.id]);
        
        await conn.query('COMMIT');

        user.access_token = accessToken;
        user.login_at = loginAt;
        user.access_expired = accessExpire;

        return {user};

    } catch (error) {
        await conn.query('ROLLBACK')
        return { error };
    } finally {
        await conn.release();
    }
};

const getUserProfile = async (email) => {
    try {
        const [result] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
        const user = result[0];
        return { user };
    } catch (error) {
        return null;
    }
};

const getUserProfileWithDetails = async (userId) => {
    const [result] = await pool.query('SELECT * FROM (project.user u JOIN user_address a ON u.id = a.user_id) JOIN user_account acc ON u.id = acc.user_id  WHERE u.id = ?;', [userId])
    const user = result[0]

    return user
}

const getUserWatchProductIds = async (userId) => {

    const queryStr = "SELECT product_id from watch_list WHERE user_id = ? "
    const bindings = userId

    const [productIds] = await pool.query(queryStr, bindings)
    return productIds
}

const getUserWatchList = async (pageSize, paging, userId) => {
    const binding = [userId]

    const limit = {
        sql: 'LIMIT ?, ?',
        binding: [pageSize * paging, pageSize]
    };

    const queryStr = "SELECT * FROM watch_list w INNER JOIN product p on w.product_id = p.id where w.user_id = ? AND p.auction_end = 0  ORDER by p.end_time " + limit.sql;
    const countQueryStr = "SELECT product_id from watch_list WHERE user_id = ? " + limit.sql;
    const bindings = binding.concat(limit.binding)

    try {
        const [watches] = await pool.query(queryStr, bindings)
        const [watchCounts] = await pool.query(countQueryStr, bindings)

        const data = {
            dataList: watches,
            dataListCounts: watchCounts
        }

        return data
    } catch (error) {
        console.log(error)
        return { error}
    }

}

// const getWatchListWithDetail = async (products) => {

//     const productIds = products.map(e => e.product_id)
//     const 
// } 

module.exports = {
    nativeSignUp,
    nativeSignIn,
    getUserProfile,
    getUserProfileWithDetails,
    getUserWatchProductIds,
    getUserWatchList,
}