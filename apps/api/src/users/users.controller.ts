import { Controller, Patch, Body, UseGuards, Request } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UpdateProfileDto } from "./dto/user.dto";
import { toPublicUser } from "./user.entity";
import * as bcrypt from "bcryptjs";
import type { RequestWithUser } from "../auth/jwt.strategy";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch("me")
  async updateMe(@Request() req: RequestWithUser, @Body() dto: UpdateProfileDto) {
    const updates: { name?: string; passwordHash?: string } = {};
    if (dto.name) updates.name = dto.name;
    if (dto.password) updates.passwordHash = await bcrypt.hash(dto.password, 12);

    const updated = await this.usersService.update(req.user.id, updates);
    if (!updated) return { user: req.user };
    return { user: toPublicUser(updated) };
  }
}
