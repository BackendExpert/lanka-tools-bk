import { Body, Controller, Get, Headers, Param, Patch, Post, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { PermissionsGuard } from "src/common/guard/permissions.guard";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { UpdateProfileDTO } from "./dto/update-profile.dto";
import { ClientInfoDecorator } from "src/common/decorators/client-info.decorator";
import type { ClientInfo } from "src/common/interfaces/client-info.interface";
import { profileImageUploadOptions } from "src/common/utils/file-upload.util";
import { FileInterceptor } from "@nestjs/platform-express";
import { UpdatePasswordDTO } from "./dto/update-password.dto";


@Controller('api/profile')
export class ProfileController {
    constructor(
        private readonly profileService: ProfileService
    ) { }

    @Patch('/update-profile')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('profile:update')
    @UseInterceptors(FileInterceptor("profile_image", profileImageUploadOptions))
    UpdateProfile(
        @Headers("authorization") authHeader: string,
        @Body() dto: UpdateProfileDTO,
        @UploadedFile() profileImage: Express.Multer.File,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.profileService.UpdateProfile(
            token,
            profileImage,
            dto,
            client.ipAddress,
            client.userAgent
        )
    }

    @Get('/profile-data')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('profile:fetch-profile')
    FetchProfileData(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.profileService.FetchProfileData(token)
    }

    @Patch('/update-password')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('password:update')
    UpdatePassword(
        @Headers("authorization") authHeader: string,
        @Body() dto: UpdatePasswordDTO,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.profileService.UpdatePassword(
            token,
            dto,
            client.ipAddress,
            client.userAgent
        )
    }

    @Get('/fetch-notifications')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('notification:fetch-all')
    FetchAllNotifications(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.profileService.FetchNotifications(
            token
        )
    }

    @Patch('/read-notification/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('notification:read')
    ReadNotification(
        @Headers("authorization") authHeader: string,
        @Param('id') id: string,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.profileService.NotificationRead(
            token,
            id,
            client.ipAddress,
            client.userAgent
        )
    }

}