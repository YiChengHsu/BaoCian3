const config = require("../../util/config");
const {promisify} = require('util'); //util from native nodejs library
const redis = require('redis');

const redisClient = redis.createClient({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password
})

const get = promisify(redisClient.get).bind(redisClient);
const set = promisify(redisClient.set).bind(redisClient);
const del = promisify(redisClient.del).bind(redisClient);
const decr = promisify(redisClient.decr).bind(redisClient);

module.exports = {
    client: redisClient,
    get,
    set,
    del,
    decr,
};