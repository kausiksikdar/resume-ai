const Redis = require('ioredis');

const options = {
  host: 'redis-12709.crce276.ap-south-1-3.ec2.cloud.redislabs.com',
  port: 12709,
  password: process.env.REDIS_PASS,
  username: 'default',
};

const redisClient = new Redis(options);

module.exports = { redisClient, options };