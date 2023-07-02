import Jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { JWTUser } from "../interface";

const JWT_SECERT = "dadasdadncoajcadfsfsdfsdfsfds";

class JwtService {
  public static generateTokenForUser(user: User) {
    const payload: JWTUser = {
      id: user?.id,
      email: user?.email,
    };
    const token = Jwt.sign(payload, JWT_SECERT);
    return token;
  }

  public static decodeToken(token: string) {
    return Jwt.verify(token, JWT_SECERT) as JWTUser;
  }
}

export default JwtService;
