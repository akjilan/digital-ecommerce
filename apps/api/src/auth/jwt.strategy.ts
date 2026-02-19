import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import type { PublicUser } from "../users/user.entity";

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
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // ConfigService is fully initialised here — reads the real JWT_SECRET
      secretOrKey: config.get<string>("JWT_SECRET") ?? "fallback-secret-change-me",
    });
  }

  validate(payload: JwtPayload): PublicUser {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role as "user" | "admin",
      name: "",
      createdAt: new Date(),
    };
  }
}
