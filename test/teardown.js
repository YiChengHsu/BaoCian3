const { closeConnection } = require("./set_test_data");
const { requester } = require("./set_up");

after(async () => {
    await closeConnection();
    requester.close();
});
