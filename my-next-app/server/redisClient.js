const Redis = require("ioredis");

// Use environment variables for host and port, fallback to Docker service name "redis" which is in the host part
const publisher = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});

const subscriber = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});

module.exports = {
  publisher,
  subscriber,
};
