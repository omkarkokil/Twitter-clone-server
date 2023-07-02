import Jwt from "jsonwebtoken";
import { User } from "@prisma/client";

const JWT_SECERT = "dadasdadncoajcadfsfsdfsdfsfds";

class JwtService {
  public static generateTokenForUser(user: User) {
    const payload = {
      id: user?.id,
      email: user?.email,
    };

    const token = Jwt.sign(payload, JWT_SECERT);
    return token;
  }
}

export default JwtService;
