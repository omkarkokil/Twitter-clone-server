import { prismaclient } from "../client/db";
import { redisClient } from "../client/redis";

export interface CreateTweetData {
  content: string;
  imageURL?: string;
  userId?: string;
}

class TweetService {  
  public static async createTweet(data: CreateTweetData) {
    const rateLimitFlag = await redisClient.get(`RATE_LIMIT_${data.userId}`);
    if (rateLimitFlag) throw new Error("Please wait...");
    const tweet = await prismaclient.tweet.create({
      data: {
        content: data.content,
        imageURL: data.imageURL,
        author: { connect: { id: data.userId } },
      },
    });
    await redisClient.setex(`RATE_LIMIT_${data.userId}`, 10, 1);
    await redisClient.del("GET_ALL_TWEETS");
    return tweet;
  }

  public static async getAllTweets() {
    const cachedTweet = await redisClient.get("GET_ALL_TWEETS");
    if (cachedTweet) return JSON.parse(cachedTweet);

    const tweets = await prismaclient.tweet.findMany({
      orderBy: { id: "desc" },
    });
    await redisClient.set("GET_ALL_TWEETS", JSON.stringify(tweets));
    return tweets;
  }
}

export default TweetService;
