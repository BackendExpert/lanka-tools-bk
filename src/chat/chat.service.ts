import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DocumentChunk, DocumentChunkDocument } from "src/admin/schema/chunk.schema";
import { verifyToken } from "src/common/utils/verify-token";
import { OllamaService } from "src/ragAi/ollama.service";
import { VectorService } from "src/ragAi/vector.service";
import { User, UserDocument } from "src/user/schema/user.schema";

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(DocumentChunk.name)
        private documentchunkModel: Model<DocumentChunkDocument>,

        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        private readonly ollamaService: OllamaService,
        private readonly vectorService: VectorService,
    ) { }

    async askQuestion(question: string) {

        const questionEmbedding = await this.ollamaService.createEmbedding(question);

        const chunks = await this.documentchunkModel.find().lean();

        const similarChunks = this.vectorService.search(
            questionEmbedding,
            chunks,
            5
        );

        const context = similarChunks.map(c => c.text).join("\n\n");


        const answer = await this.ollamaService.generateChatbotAnswer(
            question,
            context
        );


        return {
            question,
            answer
        };
    }

    async useDashChat(
        token: string,
        question: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const answer = await this.ollamaService.generateDashAnser(
            question
        )

        return {
            question,
            answer
        }

    }
}