import axios from "axios";
import { prismaclient } from "../client/db";
import JwtService from "./jwt";

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

class UserService {
  public static async verifyGoogleToken(token: string) {
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
  }

  public static getUserById(id: string) {
    return prismaclient.user.findUnique({ where: { id } });
  }

  public static async followUser(from: string, to: string) {
    return prismaclient.follows.create({
      data: {
        follower: { connect: { id: from } },
        following: { connect: { id: to } },
      },
    });
  }

  public static unfollowUser(from: string, to: string) {
    return prismaclient.follows.delete({
      where: {
        followerid_followingid: {
          followerid: from,
          followingid: to,
        },
      },
    });
  }
}

export default UserService;
