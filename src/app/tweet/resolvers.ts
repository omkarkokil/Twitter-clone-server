import { Tweet } from "@prisma/client";
import { prismaclient } from "../../client/db";
import { GraphqlContext } from "../../interface";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import UserService from "../../services/user";
import TweetService, { CreateTweetData } from "../../services/tweet";

const s3Client = new S3Client({
  region: `${process.env.AWS_REGION}`,
  credentials: {
    accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
    secretAccessKey: `${process.env.AWS_S3_SECRET_KEY}`,
  },
});

const queries = {
  getAllTweets: () => TweetService.getAllTweets(),

  getSignedUrlForTweet: async (
    parent: any,
    { imageType, imageName }: { imageType: string; imageName: string },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user || !ctx.user.id) throw new Error("User is Unauthenticated");

    const allowedImageTypes = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!allowedImageTypes.includes(`${imageType}`))
      throw new Error("Unsupported image type");

    const putObjectCommand = new PutObjectCommand({
      Bucket: `${process.env.AWS_S3_BUCKET_NAME}`,
      Key: `uploads/${
        ctx.user.id
      }/tweets/${imageName}-${Date.now().toString()}.${imageType}`,
    });

    const signedUrl = await getSignedUrl(s3Client, putObjectCommand);

    return signedUrl;
  },
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
