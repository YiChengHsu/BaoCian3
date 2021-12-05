const chai = require('chai');

const chaiHttp = require('chai-http');
const {NODE_ENV} = process.env;

const {truncateTestData, createTestData} = require('./set_test_data');

chai.use(chaiHttp);

const assert = chai.assert;
const expect = chai.expect;

before(async () => {
    if (NODE_ENV !== 'test') {
        throw 'Not in test env';
    }

    await truncateTestData();
    await createTestData();
});

module.exports = {
  expect,
  assert,
  chai
};