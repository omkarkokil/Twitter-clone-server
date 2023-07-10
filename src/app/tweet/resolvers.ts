import { Tweet } from "@prisma/client";
import { prismaclient } from "../../client/db";
import { GraphqlContext } from "../../interface";
import UserService from "../../services/user";
import TweetService, { CreateTweetData } from "../../services/tweet";

const queries = {
  getAllTweets: () => TweetService.getAllTweets(),
};

const mutations = {
  CreateTweet: async (
    parent: any,
    { payload }: { payload: CreateTweetData },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) throw new Error("User is not authenticated");
    const tweet = await TweetService.createTweet({
      ...payload,
      userId: ctx.user.id,
    });

    return tweet;
  },
};

const extraResolvers = {
  Tweet: {
    author: (parent: Tweet) => UserService.getUserById(parent.authorid),
  },
};

export const resolvers = { mutations, extraResolvers, queries };
