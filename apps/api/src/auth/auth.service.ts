import { Injectable, ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { toPublicUser } from "../users/user.entity";
import type { JwtPayload } from "./jwt.strategy";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private sign(userId: string, email: string, role: string): string {
    const payload: JwtPayload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }

  async register(name: string, email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException("Email already registered");

    // First registered user becomes admin if ADMIN_EMAIL matches, or if no users exist yet
    const allUsers = await this.usersService.findAll();
    const isFirstUser = allUsers.length === 0;
    const isAdminEmail = process.env.ADMIN_EMAIL?.toLowerCase() === email.toLowerCase();
    const role = isFirstUser || isAdminEmail ? "admin" : "user";

    const user = await this.usersService.create(name, email, password, role);
    const accessToken = this.sign(user.id, user.email, user.role);
    return { user: toPublicUser(user), accessToken };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const valid = await this.usersService.validatePassword(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    const accessToken = this.sign(user.id, user.email, user.role);
    return { user: toPublicUser(user), accessToken };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException("User not found");
    return { user: toPublicUser(user) };
  }
}
