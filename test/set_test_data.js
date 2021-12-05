require('dotenv').config();
const {NODE_ENV} = process.env;

const bcrypt = require('bcrypt');
const salt = parseInt(process.env.BCRYPT_SALT)

const {
  users,
  roles,
  products,
  product_images,
} = require('./test_data');
const {pool} = require('../server/models/mysqlcon')

const createTestUser = async (conn) => {
  const queryStr = 'INSERT INTO user (provider, role_id, email, password, name, picture, access_token, access_expired, login_at) VALUES ?'

  const bindings = [users.map(e => {
    return [
      e.provider,
      e.role_id,
      e.email,
      bcrypt.hashSync(e.password, salt),
      e.name,
      e.picture,
      e.access_token, 
      e.access_expired, 
      e.login_at
    ]
  })]
  await conn.query(queryStr, bindings)
}

const createTestRole = async (conn) => {
  const queryStr = 'INSERT INTO role (id, name) VALUES ?'
  const bindings = [roles.map(e => Object.values(e))]
  await conn.query(queryStr, bindings)
}

const createTestProducts = async (conn) => {
  const queryStr = 'INSERT INTO product SET ? '
  const bindings = products
  await conn.query(queryStr, bindings)
}

const createTestImages = async (conn) => {
  const queryStr = 'INSERT INTO product_images (product_id, image) VALUES ?'
  const bindings = [product_images.map(x => Object.values(x))]
  await conn.query(queryStr, bindings)
}

const createTestData = async () => {
  if (NODE_ENV !== 'test'){
    console.log('Not in test env')
    return
  }
  const conn = await pool.getConnection();
  await conn.query('START TRANSACTION')
  await conn.query('SET FOREIGN_KEY_CHECKS = ?', 0)
  await createTestUser(conn)
  await createTestRole(conn)
  await createTestProducts(conn)
  await createTestImages(conn)
  await conn.query('SET FOREIGN_KEY_CHECKS = ?', 1);
  await conn.query('COMMIT');
  await conn.release();
}

const truncateTestData = async () => {
  if (NODE_ENV !== 'test') {
    console.log('Not in test env');
    return;
  }

  const truncateTable = async (table) => {
    const conn = await pool.getConnection();
    await conn.query('START TRANSACTION');
    await conn.query('SET FOREIGN_KEY_CHECKS = ?', 0);
    await conn.query(`TRUNCATE TABLE ${table}`);
    await conn.query('SET FOREIGN_KEY_CHECKS = ?', 1);
    await conn.query('COMMIT');
    await conn.release();
    return;
  };

  const tables = ['user', 'role', 'product', 'product_images', 'bid_record', 'watch_list'];
  for(let table of tables) {
    await truncateTable(table);
  }

  return;
}

const closeConnection = async () => {
  return await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = {
  createTestData,
  truncateTestData,
  closeConnection,
};