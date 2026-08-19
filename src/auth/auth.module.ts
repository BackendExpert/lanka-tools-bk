import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLog, AuditLogSchema } from "src/auditlogs/schema/auditlog.schema";
import { Role, RoleSchema } from "src/role/schema/role.schema";
import { User, UserSchema } from "src/user/schema/user.schema";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { EmailService } from "src/common/utils/email.util";
import { AuthToken, AuthTokenSchema } from "./schema/authtoken.schema";
import { OTP, OTPSchema } from "./schema/otp.schema";
import { Profile, ProfileSchema } from "src/profile/schema/profile.schema";
import { BackupCodes, BackupCodesSchema } from "./schema/backup-codes.schema";
import { Notification, NotificationSchema } from "src/profile/schema/notification.schema";

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const secret = configService.get<string>("JWT_SECRET");
                console.log("JWT_SECRET loaded:", !!secret);
                return { secret, signOptions: { expiresIn: "1d" } };
            }
        }),

        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
            { name: AuditLog.name, schema: AuditLogSchema },
            { name: AuthToken.name, schema: AuthTokenSchema },
            { name: OTP.name, schema: OTPSchema },
            { name: Profile.name, schema: ProfileSchema },
            { name: BackupCodes.name, schema: BackupCodesSchema },
            { name: Notification.name, schema: NotificationSchema },
        ])
    ],

    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, EmailService],
    exports: [JwtModule, AuthService]
})

export class AuthModule { }