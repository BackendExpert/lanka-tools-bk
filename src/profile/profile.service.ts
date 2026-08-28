import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AuditLog, AuditLogDocument } from "src/auditlogs/schema/auditlog.schema";
import { Role, RoleDocument } from "src/role/schema/role.schema";
import { User, UserDocument } from "src/user/schema/user.schema";
import { Model } from "mongoose";
import { EmailService } from "src/common/utils/email.util";
import { JwtService } from "@nestjs/jwt";
import { Profile, ProfileDocument } from "./schema/profile.schema";
import { UpdateProfileDTO } from "./dto/update-profile.dto";
import { getLocationFromIP } from "src/common/utils/location";
import { verifyToken } from "src/common/utils/verify-token";
import { createAuditLog } from "src/common/utils/auditlogs.util";
import * as fs from "fs";
import * as path from "path";
import { UpdatePasswordDTO } from "./dto/update-password.dto";
import bcrypt from 'bcrypt'
import { Notification, NotificationDocument } from "./schema/notification.schema";
import { ReadNotification } from "src/common/utils/notification.util";


@Injectable()
export class ProfileService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        @InjectModel(Role.name)
        private roleModel: Model<RoleDocument>,

        @InjectModel(AuditLog.name)
        private auditlogModel: Model<AuditLogDocument>,

        @InjectModel(Profile.name)
        private profileModel: Model<ProfileDocument>,

        @InjectModel(Notification.name)
        private notificationModel: Model<NotificationDocument>,

        private readonly emailService: EmailService,
        private readonly jwtService: JwtService
    ) { }

    // async UpdateProfile(
    //     token: string,
    //     file: Express.Multer.File,
    //     dto: UpdateProfileDTO,
    //     ipAddress?: string,
    //     userAgent?: string,
    // ) {
    //     const location = getLocationFromIP(ipAddress || "");
    //     const payload = await verifyToken(token, "LOGIN_TOKEN");

    //     const user = await this.userModel.findOne({
    //         email: payload.email,
    //     });

    //     if (!user) {
    //         throw new NotFoundException("User Cannot be Found");
    //     }

    //     const profile = await this.profileModel.findOne({
    //         user: user._id,
    //     });

    //     if (!profile) {
    //         throw new NotFoundException("Profile Cannot be Found");
    //     }

    //     if (dto.first_name !== undefined) {
    //         profile.first_name = dto.first_name;
    //     }

    //     if (dto.last_name !== undefined) {
    //         profile.last_name = dto.last_name;
    //     }

    //     if (dto.mobile !== undefined) {
    //         profile.mobile = dto.mobile;
    //     }

    //     if (dto.address !== undefined) {
    //         profile.address = dto.address;
    //     }

    //     if (dto.dob !== undefined) {
    //         profile.dob = new Date(dto.dob);
    //     }

    //     if (dto.bio !== undefined) {
    //         profile.bio = dto.bio;
    //     }

    //     if (file) {

    //         if (profile.profile_img) {
    //             const oldImagePath = path.join(
    //                 process.cwd(),
    //                 "uploads/profile",
    //                 profile.profile_img
    //             );

    //             if (fs.existsSync(oldImagePath)) {
    //                 fs.unlinkSync(oldImagePath);
    //             }
    //         }

    //         profile.profile_img = file.filename;
    //     }

    //     await profile.save();

    //     await createAuditLog(this.auditlogModel, {
    //         user: user._id,
    //         action: "USER_UPDATED_PROFILE",
    //         description: `${user.email} Has been update their Profile`,
    //         ipAddress,
    //         userAgent,
    //         metadata: {
    //             ipAddress,
    //             userAgent,
    //             location,
    //         },
    //     });

    //     return {
    //         success: true,
    //         message: "Profile Updated Success"
    //     }
    // }

    async UpdateProfile(
        token: string,
        file: Express.Multer.File,
        dto: UpdateProfileDTO,
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

        const profile = await this.profileModel.findOne({
            user: user._id,
        });

        if (!profile) {
            throw new NotFoundException("Profile Cannot be Found");
        }

        if (dto.first_name !== undefined) {
            profile.first_name = dto.first_name;
        }

        if (dto.last_name !== undefined) {
            profile.last_name = dto.last_name;
        }

        if (dto.mobile !== undefined) {
            profile.mobile = dto.mobile;
        }

        if (dto.dob !== undefined) {
            profile.dob = new Date(dto.dob);
        }

        if (dto.address !== undefined) {
            profile.address = {
                ...profile.address,
                ...dto.address,
            };
        }

        if (dto.billing_address !== undefined) {
            profile.billing_address = {
                ...profile.billing_address,
                ...dto.billing_address,
            };
        }

        if (dto.bio !== undefined) {
            profile.bio = dto.bio;
        }

        if (file) {
            if (profile.profile_img) {
                const oldImagePath = path.join(
                    process.cwd(),
                    "uploads/profile",
                    profile.profile_img,
                );

                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            profile.profile_img = file.filename;
        }

        await profile.save();

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "USER_UPDATED_PROFILE",
            description: `${user.email} Has updated their Profile`,
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
            message: "Profile Updated Successfully",
        };
    }

    async FetchProfileData(
        token: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const profile = await this.profileModel.findOne({
            user: user._id,
        });

        if (!profile) {
            throw new NotFoundException("Profile Cannot be Found");
        }

        return {
            success: true,
            message: "Profile Data Fetched",
            result: profile
        }
    }

    async UpdatePassword(
        token: string,
        dto: UpdatePasswordDTO,
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

        const checkcurrentpass = await bcrypt.compare(dto.current_pass, user.password)

        if (!checkcurrentpass) {
            throw new ForbiddenException("The Current Password Not Match")
        }

        const isSamePassword = await bcrypt.compare(
            dto.new_pass,
            user.password,
        );

        if (isSamePassword) {
            throw new BadRequestException(
                "New password must be different from the current password.",
            );
        }

        const hashnewpass = await bcrypt.hash(dto.new_pass, 10)

        const updatepass = await this.userModel.findByIdAndUpdate(
            user._id,
            {
                password: hashnewpass
            },
            { new: true }
        )

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "USER_UPDATED_PASSWORD",
            description: `${user.email} Has been update their Password`,
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
            message: "Password Updated Successfully"
        }
    }

    async FetchNotifications(
        token: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const notifications = await this.notificationModel.find({ user: user._id })

        return {
            success: true,
            message: "All Notifications Fetched Success",
            result: notifications
        }
    }


    async NotificationRead(
        token: string,
        id: string,
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

        const traget_notification = await this.notificationModel.findById(id)

        if (!traget_notification) {
            throw new NotFoundException("The Traget Notification Not found")
        }

        await ReadNotification(
            this.notificationModel,
            id
        )
        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "NOTIFICATION_READ",
            description: `${user.email} Notification ${traget_notification.title} Read success`,
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
            message: "Notification Read success"
        }

    }

    async FetchMyAuditLogs(
        token: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const myaudits = await this.auditlogModel.find({ user: user._id })

        return {
            success: true,
            message: "My Audit Logs Fetched",
            result: myaudits
        }
    }
}