import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { toPublicUser, type PublicUser } from "../users/user.entity";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface RequestWithUser extends Request {
  user: PublicUser;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // ConfigService is fully initialised here — reads the real JWT_SECRET
      secretOrKey: config.get<string>("JWT_SECRET") ?? "fallback-secret-change-me",
    });
  }

  async validate(payload: JwtPayload): Promise<PublicUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      // If user exists in token but not in DB (e.g. DB was reset), reject the token
      throw new UnauthorizedException("User session no longer valid (user not found)");
    }
    return toPublicUser(user);
  }
}
