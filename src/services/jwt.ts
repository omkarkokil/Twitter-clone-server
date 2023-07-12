import Jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { JWTUser } from "../interface";

class JwtService {
  public static generateTokenForUser(user: User) {
    const payload: JWTUser = { id: user?.id, email: user?.email };
    const token = Jwt.sign(payload, `${process.env.JWT_SECERT}`);
    return token;
  }

  public static decodeToken(token: string) {
    try {
      return Jwt.verify(token, `${process.env.JWT_SECERT}`) as JWTUser;
    } catch (error) {
      return null;
    }
  }
}

export default JwtService;
