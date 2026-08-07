const Redis = require('ioredis');

const options = {
  host: 'redis-11244.c14.us-east-1-3.ec2.cloud.redislabs.com',
  port: 11244,
  password: process.env.REDIS_PASS,
  username: 'default',
};

const redisClient = new Redis(options);

module.exports = { redisClient, options };