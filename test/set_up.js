const chai = require('chai');
const server = require('../app')
const chaiHttp = require('chai-http');
const {NODE_ENV} = process.env;
const {truncateTestData, createTestData} = require('./set_test_data');

// Start server for socket testing
const port = 3001;
server.listen(port, function () { console.log(`start test server at port ${port}`); });

chai.use(chaiHttp);
const requester = chai.request(server).keepOpen();

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
  requester,
};