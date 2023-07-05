import axios from "axios";
import { prismaclient } from "../../client/db";
import JwtService from "../../services/jwt";
import { GraphqlContext } from "../../interface";
import { User } from "@prisma/client";

interface GoogleTokenResult {
  iss?: string;
  nbf?: string;
  sub?: string;
  aud?: string;
  email?: string;
  email_verified?: string;
  azp?: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  iat?: string;
  exp?: string;
  jti?: string;
}

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    try {
      const googleAuthToken = token;

      const googleOAuthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
      googleOAuthURL.searchParams.set("id_token", googleAuthToken);

      const { data } = await axios.get<GoogleTokenResult>(
        googleOAuthURL.toString(),
        {
          responseType: "json",
        }
      );

      const checkExisitingUser = await prismaclient.user.findUnique({
        where: { email: data.email },
      });

      if (!checkExisitingUser) {
        await prismaclient.user.create({
          data: {
            email: data?.email ?? "",
            firstName: data?.given_name ?? "",
            lastName: data?.family_name,
            profileImageURL: data?.picture ?? "",
          },
        });
      }

      const IfExists = await prismaclient.user.findUnique({
        where: { email: data.email },
      });

      if (!IfExists) throw new Error("User not found");

      const userToken = JwtService.generateTokenForUser(IfExists);

      return userToken;
    } catch (error) {
      console.log(error);
    }
  },

  getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    try {
      const id = ctx.user?.id;
      if (!id) return null;

      const user = await prismaclient.user.findUnique({ where: { id } });
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
    return prismaclient.user.findUnique({ where: { id } });
  },
};

const extraResolvers = {
  User: {
    tweet: (parent: User) =>
      prismaclient.tweet.findMany({ where: { authorid: parent.id } }),
  },
};

export const resolvers = { queries, extraResolvers };
