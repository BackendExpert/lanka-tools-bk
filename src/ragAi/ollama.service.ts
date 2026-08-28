import { Injectable } from "@nestjs/common";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import {
    AI_CHAT_PROMPT,
    DOCUMENT_PROMPT,
    RESOURCE_DOCUMENT_PROMPT,
} from "./promts";

@Injectable()
export class OllamaService {
    private readonly ollamaUrl: string;
    private readonly embedModel: string;
    private readonly genAiModel: string;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.ollamaUrl = this.configService.get<string>("GEN_AI_URL")!;
        this.embedModel = this.configService.get<string>("EMBED_MODEL")!;
        this.genAiModel = this.configService.get<string>("GEN_AI_MODEL")!;
    }

    async createEmbedding(text: string): Promise<number[]> {
        const response = await axios.post(
            `${this.ollamaUrl}/api/embed`,
            {
                model: this.embedModel,
                input: text,
            },
        );

        return response.data.embeddings[0];
    }

    async generateChatbotAnswer(
        question: string,
        context: string,
    ): Promise<string> {

        const response = await axios.post(
            `${this.ollamaUrl}/api/generate`,
            {
                model: this.genAiModel,
                prompt: DOCUMENT_PROMPT(context, question),
                stream: false,
                options: {
                    temperature: 0,
                    top_p: 0.1,
                    top_k: 20,
                    repeat_penalty: 1.1,
                    num_ctx: 8192,
                },
            },
        );

        return response.data.response?.trim() || "";
    }


    async generateResourceAnswer(
        question: string,
        context: string,
    ): Promise<string> {

        const response = await axios.post(
            `${this.ollamaUrl}/api/generate`,
            {
                model: this.genAiModel,
                prompt: RESOURCE_DOCUMENT_PROMPT(context, question),
                stream: false,
                options: {
                    temperature: 0,
                    top_p: 0.1,
                    top_k: 20,
                    repeat_penalty: 1.1,
                    num_ctx: 8192,
                },
            },
        );

        return response.data.response?.trim() || "";
    }


    async generateDashAnser(
        question: string,
    ): Promise<string> {

        const response = await axios.post(
            `${this.ollamaUrl}/api/generate`,
            {
                model: this.genAiModel,
                prompt: AI_CHAT_PROMPT(question),
                stream: false,
                options: {
                    temperature: 0,
                    top_p: 0.8,
                    top_k: 10,
                    repeat_penalty: 1.05,
                    num_ctx: 2048,
                    num_predict: 256,
                },
            },
        );

        return response.data.response?.trim() || "";
    }




}