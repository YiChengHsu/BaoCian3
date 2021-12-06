const { closeConnection } = require("./set_test_data");
const { chai } = require("./set_up");
const server = require('../app')

after(async () => {
    await closeConnection();
    chai.request(server).close();
});
