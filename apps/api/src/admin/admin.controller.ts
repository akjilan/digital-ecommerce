import { Controller, Get, UseGuards, Request, ForbiddenException } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UsersService } from "../users/users.service";
import type { RequestWithUser } from "../auth/jwt.strategy";

@Controller("admin")
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get("users")
  async listUsers(@Request() req: RequestWithUser) {
    if (req.user.role !== "admin") throw new ForbiddenException("Admin only");
    return { users: await this.usersService.findAll() };
  }
}
