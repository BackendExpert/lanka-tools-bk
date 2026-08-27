import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuditLog, AuditLogDocument } from "src/auditlogs/schema/auditlog.schema";
import { Role, RoleDocument } from "src/role/schema/role.schema";
import { User, UserDocument } from "src/user/schema/user.schema";
import { AuthToken, AuthTokenDocument } from "./schema/authtoken.schema";
import { EmailService } from "src/common/utils/email.util";
import { JwtService } from "@nestjs/jwt";
import { RegisterDTO } from "./dto/Register.dto";
import bcrypt from 'bcrypt'
import { createAuditLog } from "src/common/utils/auditlogs.util";
import { getLocationFromIP } from "src/common/utils/location";
import { LoginDTO } from "./dto/login.dto";
import { ConfigService } from "@nestjs/config";
import { OTP, OTPDocument } from "./schema/otp.schema";
import { generateOTP } from "src/common/utils/otp.util";
import { Types } from "mongoose";
import { verifyToken } from "src/common/utils/verify-token";
import { Profile, ProfileDocument } from "src/profile/schema/profile.schema";
import { generateBackupCodes } from "src/common/utils/backup-code.util";
import { BackupCodes, BackupCodesDocument } from "./schema/backup-codes.schema";
import { LoginBackupCodesDTO } from "./dto/login-backupcodes.dto";
import { Notification, NotificationDocument } from "src/profile/schema/notification.schema";
import { CreateNotification } from "src/common/utils/notification.util";

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        @InjectModel(Role.name)
        private roleModel: Model<RoleDocument>,

        @InjectModel(AuditLog.name)
        private auditlogModel: Model<AuditLogDocument>,

        @InjectModel(AuthToken.name)
        private authtokenModel: Model<AuthTokenDocument>,

        @InjectModel(OTP.name)
        private otpModel: Model<OTPDocument>,

        @InjectModel(Profile.name)
        private profileModel: Model<ProfileDocument>,

        @InjectModel(BackupCodes.name)
        private backupcodesModel: Model<BackupCodesDocument>,

        @InjectModel(Notification.name)
        private notificationModel: Model<NotificationDocument>,

        private readonly emailService: EmailService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async Registation(
        dto: RegisterDTO,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const user = await this.userModel.findOne({ email: dto.email })

        if (user) {
            throw new ConflictException("User Already Registed in System")
        }

        const role = await this.roleModel.findOne({ role: 'customer' })

        if (!role) {
            throw new NotFoundException("Role Cannot be found")
        }

        const hashpass = await bcrypt.hash(dto.password, 10)

        const { plainCodes, hashedCodes } = await generateBackupCodes();

        const createUser = await this.userModel.create({
            email: dto.email,
            password: hashpass,
            role: role._id,
            account_stats: true
        })

        await this.backupcodesModel.create({
            user: createUser._id,
            backup_codes: hashedCodes,
        });

        const location = getLocationFromIP(ipAddress || "");

        const createprofile = await this.profileModel.create({
            user: createUser._id,
            first_name: dto.first_name,
            last_name: dto.last_name
        })

        const adminRole = await this.roleModel.findOne({ role: "admin" });

        if (adminRole) {
            const admins = await this.userModel.find({
                role: adminRole._id,
            });

            await Promise.all(
                admins.map((admin) =>
                    CreateNotification(
                        this.notificationModel,
                        admin._id,
                        "New User Created",
                        `New user created in the system: ${dto.email} at ${new Date().toISOString()}`,
                        "System"
                    )
                )
            );
        }
        
        await createAuditLog(this.auditlogModel, {
            user: createUser._id,
            action: "REGISTER_SUCCESS",
            description: `Registration Successfully ${dto.email}`,
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                location,
            },
        });

        const codeToken = await this.jwtService.signAsync(
            {
                email: dto.email,
                type: "CODE_TOKEN",
                codes: plainCodes,
            },
            {
                secret: this.configService.get<string>(
                    "JWT_SECRET"
                )!,
                expiresIn: "15m",
            }
        );

        return {
            success: true,
            codetoken: codeToken,
            message: "Registation Success, And Backup codes Generated Success, And wait for Admin to Verify and Activate your Accout",
        }
    }

    async Login(
        dto: LoginDTO,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const location = getLocationFromIP(ipAddress || "");

        const user = await this.userModel.findOne({
            email: dto.email,
        });

        if (!user) {
            throw new NotFoundException(
                "User Cannot be found"
            );
        }

        if (!user.account_stats) {
            throw new ForbiddenException("Account Deactive. Contact Admin")
        }

        const role = await this.roleModel.findById(user.role)

        if (!role) {
            throw new NotFoundException("Role Cannot be found")
        }

        const checkPass = await bcrypt.compare(
            dto.password,
            user.password,
        );

        if (!checkPass) {
            await createAuditLog(this.auditlogModel, {
                user: user._id,
                action: "WRONG_PASSWORD",
                description: `${user.email} Wrong Password`,
                ipAddress,
                userAgent,
                metadata: {
                    location
                }
            });

            throw new UnauthorizedException(
                "Password Not Match"
            );
        }


        const accessToken = await this.jwtService.signAsync(
            {
                sub: user._id.toString(),
                email: user.email,
                role: role.role,
                type: "LOGIN_TOKEN",
            },
            {
                secret: this.configService.get<string>(
                    "JWT_SECRET"
                )!,
                expiresIn: "15m",
            }
        );



        const refreshToken = await this.jwtService.signAsync(
            {
                sub: user._id.toString(),
                email: user.email,
                type: "REFRESH_TOKEN",
            },
            {
                secret: this.configService.get<string>(
                    "JWT_REFRESH_SECRET"
                )!,
                expiresIn: "30d",
            }
        );


        const refreshTokenHash = await bcrypt.hash(
            refreshToken,
            10
        );

        const expireAt = new Date();

        expireAt.setDate(
            expireAt.getDate() + 30
        );

        await this.authtokenModel.deleteMany({
            user: user._id,
        });

        await this.authtokenModel.create({
            user: user._id,
            refresh_token_hash: refreshTokenHash,
            expire_at: expireAt,
            ip_address: ipAddress,
            user_agent: userAgent,
        });

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "LOGIN_SUCCESS",
            description: `${user.email} Login Success`,
            ipAddress,
            userAgent,
            metadata: {
                location
            }
        });

        return {
            success: true,
            message: "Login Success",
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    async LoginWithBackupCodes(
        dto: LoginBackupCodesDTO,
        ipAddress?: string,
        userAgent?: string,
    ) {

        const user = await this.userModel.findOne({ email: dto.email })
        const location = getLocationFromIP(ipAddress || "");

        if (!user) {
            throw new NotFoundException("User cannot be found")
        }

        const role = await this.roleModel.findById(user.role)

        if (!role) {
            throw new NotFoundException("Role Cannot be found")
        }

        const backupcodes = await this.backupcodesModel.findOne({ user: user._id })

        if (!backupcodes) {
            throw new ForbiddenException("Cannot be Continue, Contact Admin")
        }


        let matchedIndex = -1;

        for (let i = 0; i < backupcodes.backup_codes.length; i++) {
            const isMatch = await bcrypt.compare(
                dto.backupcode,
                backupcodes.backup_codes[i]
            );

            if (isMatch) {
                matchedIndex = i;
                break;
            }
        }

        if (matchedIndex === -1) {
            throw new ForbiddenException("Invalid backup code");
        }

        backupcodes.backup_codes.splice(matchedIndex, 1);

        await backupcodes.save();

        const accessToken = await this.jwtService.signAsync(
            {
                sub: user._id.toString(),
                email: user.email,
                role: role.role,
                type: "LOGIN_TOKEN",
            },
            {
                secret: this.configService.get<string>(
                    "JWT_SECRET"
                )!,
                expiresIn: "30m",
            }
        );

        const refreshToken = await this.jwtService.signAsync(
            {
                sub: user._id.toString(),
                email: user.email,
                type: "REFRESH_TOKEN",
            },
            {
                secret: this.configService.get<string>(
                    "JWT_REFRESH_SECRET"
                )!,
                expiresIn: "30d",
            }
        );


        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "LOGIN_WITH_BACKUP_CODE",
            description: `${user.email} Login Success with Backup codes`,
            ipAddress,
            userAgent,
            metadata: {
                location
            }
        });

        return {
            success: true,
            access_token: accessToken,
            refresh_token: refreshToken,
            message: "Login Success with Backup code, You Must update the Password After Login to Dashboard"
        }
    }

    async RefreshToken(
        refreshToken: string
    ) {

        const payload =
            await this.jwtService.verifyAsync(
                refreshToken,
                {
                    secret: this.configService.get<string>(
                        "JWT_REFRESH_SECRET"
                    )
                }
            );

        if (payload.type !== "REFRESH_TOKEN") {
            throw new UnauthorizedException(
                "Invalid Refresh Token"
            );
        }

        const tokenRecord =
            await this.authtokenModel.findOne({
                user: new Types.ObjectId(payload.sub),
            }).exec();

        if (!tokenRecord) {
            throw new UnauthorizedException(
                "Refresh Token Not Found"
            );
        }

        const match = await bcrypt.compare(
            refreshToken,
            tokenRecord.refresh_token_hash
        );

        if (!match) {
            throw new UnauthorizedException(
                "Invalid Refresh Token"
            );
        }


        // const allTokens = await this.authtokenModel.find();

        const user = await this.userModel.findOne({ email: payload.email })

        if (!user) {
            throw new NotFoundException("User cannot be found")
        }

        const role = await this.roleModel.findById(user.role)

        if (!role) {
            throw new NotFoundException("Role Cannot be found")
        }

        const newAccessToken =
            await this.jwtService.signAsync(
                {
                    sub: payload.sub,
                    email: payload.email,
                    role: role.role,
                    type: "LOGIN_TOKEN",
                },
                {
                    secret: this.configService.get<string>(
                        "JWT_SECRET"
                    )!,
                    expiresIn: "15m",
                }
            );

        return {
            access_token: newAccessToken
        };
    }

    async Logout(
        token: string,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const location = getLocationFromIP(ipAddress || "");
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        await this.authtokenModel.deleteMany({ user: user._id })

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "USER_REQUEST_OTP",
            description: `${user.email} User Request Password Reset OTP`,
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                location,
            },
        });

        return {
            success: true,
            message: "Logout Success"
        }
    }

    async PasswordReset(
        email: string,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const location = getLocationFromIP(ipAddress || "");
        const user = await this.userModel.findOne({ email: email })

        if (!user) {
            throw new NotFoundException("User Cannot be found in System")
        }

        const existingOTP = await this.otpModel.findOne({
            user: user._id,
            is_used: false,
        });

        if (existingOTP && existingOTP.expire_at > new Date()) {
            throw new ConflictException(
                "A password reset OTP has already been sent. Please wait until it expires before requesting another one.",
            );
        }

        if (existingOTP) {
            await this.otpModel.deleteOne({ _id: existingOTP._id });
        }

        const otp = generateOTP(8);

        const hashOTP = await bcrypt.hash(otp, 10);

        const expireAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.otpModel.create({
            user: user._id,
            otp: hashOTP,
            expire_at: expireAt,
        });

        await this.emailService.sendOTP(
            email,
            otp,
            ipAddress,
            userAgent,
        )

        const passresttoken = await this.jwtService.signAsync(
            {
                sub: user._id.toString(),
                email: user.email,
                type: "PASSWORD_RESET_TOKEN",
            },
            {
                secret: this.configService.get<string>("JWT_SECRET")!,
                expiresIn: "10m",
            },
        );

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "USER_REQUEST_OTP",
            description: `${user.email} User Request Password Reset OTP`,
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                location,
            },
        });

        return {
            success: true,
            message: "The Password Reset OTP has been send to the Email, Check the Emails",
            token: passresttoken
        }
    }


    async VerifyOTP(
        token: string,
        otp: string,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const payload = await this.jwtService.verifyAsync(token, {
            secret: this.configService.get<string>("JWT_SECRET"),
        });

        if (payload.type !== "PASSWORD_RESET_TOKEN") {
            throw new UnauthorizedException("Invalid Token");
        }

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Not Found");
        }

        const otpRecord = await this.otpModel.findOne({
            user: user._id,
            is_used: false,
        });

        if (!otpRecord) {
            throw new UnauthorizedException(
                "OTP Not Found or Already Used",
            );
        }

        if (otpRecord.expire_at < new Date()) {
            throw new UnauthorizedException(
                "OTP Expired",
            );
        }

        const isValidOTP = await bcrypt.compare(
            otp,
            otpRecord.otp,
        );

        if (!isValidOTP) {
            throw new UnauthorizedException(
                "OTP Not Match",
            );
        }

        await this.otpModel.findByIdAndUpdate(
            otpRecord._id,
            {
                $set: {
                    is_used: true,
                },
            },
        );

        const passupdatetoken = await this.jwtService.signAsync(
            {
                sub: user._id.toString(),
                email: user.email,
                type: "PASSWORD_UPDATE_TOKEN",
            },
            {
                secret: this.configService.get<string>("JWT_SECRET")!,
                expiresIn: "10m",
            },
        );

        const location = getLocationFromIP(ipAddress || "");

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "USER_VERIFY_OTP",
            description: `${user.email} Successfully Verified Password Reset OTP`,
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                location,
            },
        });

        return {
            success: true,
            message: "OTP Verify Success",
            token: passupdatetoken
        };
    }


    async UpdatePassword(
        token: string,
        password: string,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const payload = await this.jwtService.verifyAsync(token, {
            secret: this.configService.get<string>("JWT_SECRET"),
        });

        if (payload.type !== "PASSWORD_UPDATE_TOKEN") {
            throw new UnauthorizedException("Invalid Token");
        }

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Not Found");
        }

        const hashNewPass = await bcrypt.hash(password, 10);

        await this.userModel.findOneAndUpdate(
            {
                email: payload.email,
            },
            {
                $set: {
                    password: hashNewPass,
                },
            },
            {
                new: true,
            },
        );

        const location = getLocationFromIP(ipAddress || "");

        await this.otpModel.deleteMany({ user: user._id })

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "PASSWORD_UPDATED",
            description: `${user.email} Successfully Updated Password`,
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                location,
            },
        });

        return {
            success: true,
            message: "Password Updated Successfully",
        };
    }
}