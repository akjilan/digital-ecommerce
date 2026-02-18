import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RegisterDto, LoginDto } from "../users/dto/user.dto";
import type { RequestWithUser } from "./jwt.strategy";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    if (!dto.name || !dto.email || !dto.password) {
      throw new BadRequestException("name, email and password are required");
    }
    if (dto.password.length < 8) {
      throw new BadRequestException("Password must be at least 8 characters");
    }
    return this.authService.register(dto.name, dto.email, dto.password);
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException("email and password are required");
    }
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@Request() req: RequestWithUser) {
    return this.authService.getMe(req.user.id);
  }
}
