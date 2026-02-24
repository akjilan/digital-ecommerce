import {
    Controller,
    Post,
    Get,
    Body,
    Request,
    UseGuards,
    BadRequestException,
    HttpCode,
    HttpStatus,
} from "@nestjs/common";
import { AiService } from "./ai.service";
import { ChatMessageDto } from "./dto/chat.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt-auth.guard";
import type { RequestWithUser } from "../auth/jwt.strategy";
import { Throttle } from "@nestjs/throttler";

@Controller("chat")
export class AiController {
    constructor(private readonly aiService: AiService) { }

    /**
     * POST /chat/message
     * Public endpoint — works for guests and auth users.
     * OptionalJwtAuthGuard: attaches req.user if JWT is valid, otherwise req.user is null.
     */
    @Post("message")
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @UseGuards(OptionalJwtAuthGuard)
    async sendMessage(
        @Body() dto: ChatMessageDto,
        @Request() req: RequestWithUser,
    ) {
        const msg = dto.message.trim();
        if (!msg) throw new BadRequestException("Message cannot be empty");

        const userId = req.user?.id ?? undefined;
        const reply = await this.aiService.chat(msg, userId);
        return { reply };
    }

    /**
     * GET /chat/history
     * Auth required — returns last 20 messages for the logged-in user.
     */
    @UseGuards(JwtAuthGuard)
    @Get("history")
    getHistory(@Request() req: RequestWithUser) {
        return this.aiService.getHistory(req.user.id);
    }
}
