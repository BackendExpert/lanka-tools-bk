import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DocumentChunk, DocumentChunkSchema } from "src/admin/schema/chunk.schema";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { OllamaService } from "src/ragAi/ollama.service";
import { VectorService } from "src/ragAi/vector.service";
import { User, UserSchema } from "src/user/schema/user.schema";
import { RoleModule } from "src/role/role.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports: [
        RoleModule,
        AuthModule,
        MongooseModule.forFeature([
            { name: DocumentChunk.name, schema: DocumentChunkSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],

    controllers: [ChatController],
    providers: [ChatService, OllamaService, VectorService],
    exports: [ChatService]
})

export class ChatModule { }