import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { RoleModule } from "src/role/role.module";
import { AuditLog, AuditLogSchema } from "src/auditlogs/schema/auditlog.schema";
import { Role, RoleSchema } from "src/role/schema/role.schema";
import { User, UserSchema } from "src/user/schema/user.schema";
import { Profile, ProfileSchema } from "src/profile/schema/profile.schema";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { EmailService } from "src/common/utils/email.util";
import { Notification, NotificationSchema } from "src/profile/schema/notification.schema";
import { SystemFiles, SystemFilesSchema } from "./schema/system-files.schema";
import { DocumentChunk, DocumentChunkSchema } from "./schema/chunk.schema";
import { RagAIService } from "src/ragAi/ragai.service";
import { OllamaService } from "src/ragAi/ollama.service";
import { Branch, BranchSchema } from "./schema/branch.schema";

@Module({
    imports: [
        RoleModule,
        AuthModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
            { name: AuditLog.name, schema: AuditLogSchema },
            { name: Profile.name, schema: ProfileSchema },
            { name: Notification.name, schema: NotificationSchema },
            { name: SystemFiles.name, schema: SystemFilesSchema },
            { name: DocumentChunk.name, schema: DocumentChunkSchema },
            { name: Branch.name, schema: BranchSchema }
        ])
    ],
    controllers: [AdminController],
    providers: [AdminService, EmailService, RagAIService, OllamaService],
    exports: [AdminService]
})

export class AdminModule { }