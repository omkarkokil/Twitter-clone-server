import axios from "axios";
import { prismaclient } from "../../client/db";
import JwtService from "../../services/jwt";
import { GraphqlContext } from "../../interface";

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
      return await prismaclient.user.create({
        data: {
          email: data?.email ?? "",
          firstName: data?.given_name ?? "",
          lastName: data?.family_name,
          profileImageURL: data?.picture,
        },
      });
    }

    const IfExists = await prismaclient.user.findUnique({
      where: { email: data.email },
    });

    if (!IfExists) throw new Error("User not found");

    const userToken = JwtService.generateTokenForUser(IfExists);

    return userToken;
  },

  getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    const id = ctx.user?.id;
    if (!id) return null;

    const user = await prismaclient.user.findUnique({ where: { id } });
    return user;
  },
};

export const resolvers = { queries };
