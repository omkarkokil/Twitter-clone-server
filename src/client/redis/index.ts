import Redis from "ioredis";

export const redisClient = new Redis(
  "redis://default:38194dd5a8714a0ca7c297213ef1a759@us1-rational-stinkbug-38644.upstash.io:38644"
);
