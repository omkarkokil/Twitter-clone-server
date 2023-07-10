import axios from "axios";
import { prismaclient } from "../../client/db";
import JwtService from "../../services/jwt";
import { GraphqlContext } from "../../interface";
import { User } from "@prisma/client";
import UserService from "../../services/user";
import { redisClient } from "../../client/redis";

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const ResultToken = await UserService.verifyGoogleToken(token);
    return ResultToken;
  },

  getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    try {
      const id = ctx.user?.id;
      if (!id) return null;

      const user = await UserService.getUserById(id);
      return user;
    } catch (error) {
      console.log(error);
    }
  },

  getUserById: async (
    parent: any,
    { id }: { id: string },
    ctx: GraphqlContext
  ) => {
    return await UserService.getUserById(id);
  },
};

const extraResolvers = {
  User: {
    tweet: (parent: User) =>
      prismaclient.tweet.findMany({ where: { authorid: parent.id } }),

    followers: async (parent: User) => {
      {
        const result = await prismaclient.follows.findMany({
          where: { following: { id: parent.id } },
          include: { follower: true },
        });

        return result.map((ele) => ele.follower);
      }
    },

    following: async (parent: User) => {
      {
        const result = await prismaclient.follows.findMany({
          where: { follower: { id: parent.id } },
          include: { following: true },
        });

        return result.map((ele) => ele.following);
      }
    },

    recommenedUsers: async (parent: User, _: any, ctx: GraphqlContext) => {
      if (!ctx.user) return [];

      const cachedValue = await redisClient.get(
        `RECOMMENDED_USERS: ${ctx.user.id}`
      );

      if (cachedValue) {
        return JSON.parse(cachedValue);
      }

      const MyFollowing = await prismaclient.follows.findMany({
        where: {
          followerid: ctx.user.id,
        },
        include: {
          following: {
            include: { followers: { include: { following: true } } },
          },
        },
      });

      let users: User[] = [];
      // console.log(MyFollowing[1].following.followers);
      for (const followings of MyFollowing) {
        for (const followingOfFollowedUser of followings.following.followers) {
          if (
            followingOfFollowedUser.following.id !== ctx.user.id &&
            MyFollowing.findIndex(
              (ele) => ele.followingid === followingOfFollowedUser.following.id
            ) < 0
          ) {
            users.push(followingOfFollowedUser.following);
          }
        }
      }

      await redisClient.set(
        `RECOMMENDED_USERS: ${ctx.user.id}`,
        JSON.stringify(users)
      );
      return users;
    },
  },
};

const mutations = {
  followUser: async (
    parent: any,
    { to }: { to: string },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user || !ctx.user.id) throw new Error("User is not authenticated");
    await UserService.followUser(ctx.user.id, to);
    await redisClient.del(`RECOMMENDED_USERS: ${ctx.user.id}`);
    return true;
  },

  unfollowUser: async (
    parent: any,
    { to }: { to: string },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user || !ctx.user.id) throw new Error("User is not authenticated");
    await UserService.unfollowUser(ctx.user.id, to);
    await redisClient.del(`RECOMMENDED_USERS: ${ctx.user.id}`);
    return true;
  },
};

export const resolvers = { queries, extraResolvers, mutations };
