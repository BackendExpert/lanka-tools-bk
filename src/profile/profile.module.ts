import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLog, AuditLogSchema } from "src/auditlogs/schema/auditlog.schema";
import { AuthModule } from "src/auth/auth.module";
import { RoleModule } from "src/role/role.module";
import { Role, RoleSchema } from "src/role/schema/role.schema";
import { User, UserSchema } from "src/user/schema/user.schema";
import { Profile, ProfileSchema } from "./schema/profile.schema";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { EmailService } from "src/common/utils/email.util";
import { Notification, NotificationSchema } from "./schema/notification.schema";

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
        ])
    ],
    controllers: [ProfileController],
    providers: [ProfileService, EmailService ],
    exports: [ProfileService]
})

export class ProfileModule { }