import { Body, Controller, Headers, Post, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { PermissionsGuard } from "src/common/guard/permissions.guard";

@Controller('api/chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService
    ) { }

    @Post('/ask')
    async AskQuestion(
        @Body("question") question: string
    ) {
        return await this.chatService.askQuestion(
            question
        );
    }

    @Post('/genarate-ai')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('genai:genarate-answer')
    GeanrateAnswerAI(
        @Headers("authorization") authHeader: string,
        @Body("question") question: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.chatService.useDashChat(token, question)
    }
}