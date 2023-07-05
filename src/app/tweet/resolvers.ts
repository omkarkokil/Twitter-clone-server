import { Tweet } from "@prisma/client";
import { prismaclient } from "../../client/db";
import { GraphqlContext } from "../../interface";

interface CreateTweetData {
  content: string;
  imageURL?: string;
}

const queries = {
  getAllTweets: () => prismaclient.tweet.findMany({ orderBy: { id: "desc" } }),
};

const mutations = {
  CreateTweet: async (
    parent: any,
    { payload }: { payload: CreateTweetData },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) throw new Error("User is not authenticated");
    const tweet = await prismaclient.tweet.create({
      data: {
        content: payload.content,
        imageURL: payload.imageURL,
        author: { connect: { id: ctx.user.id } },
      },
    });

    return tweet;
  },
};

const extraResolvers = {
  Tweet: {
    author: (parent: Tweet) =>
      prismaclient.user.findUnique({ where: { id: parent.authorid } }),
  },
};

export const resolvers = { mutations, extraResolvers, queries };
