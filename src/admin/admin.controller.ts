import { Body, Controller, Get, Headers, Param, Patch, Post, UnauthorizedException, UseGuards, UploadedFile, UseInterceptors } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { PermissionsGuard } from "src/common/guard/permissions.guard";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { ClientInfoDecorator } from "src/common/decorators/client-info.decorator";
import type { ClientInfo } from "src/common/interfaces/client-info.interface";
import { CreatePlatfromUserDTO } from "./dto/create-platfrom-user.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { systemFileUploadOptions } from "src/common/utils/file-upload.util";
import { CreateBranchDto } from "./dto/create-branch.dto";

@Controller('api/admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    @Get('/fetch-users')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admin:fetch-users')
    FetchUsers(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.adminService.FetchallUsers(
            token
        )
    }

    @Get('fetch-user/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admin:fetch-users')
    FetchUserByID(
        @Headers("authorization") authHeader: string,
        @Param('id') id: string
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.adminService.FetchUserByID(
            token,
            id
        )
    }

    @Patch('/update-user-status/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admin:update-user-status')
    UpdateUserStatues(
        @Headers("authorization") authHeader: string,
        @Param('id') id: string,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.adminService.UpdateUserState(
            token,
            id,
            client.ipAddress,
            client.userAgent
        )
    }

    @Post('/create-branch')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admin:create-branch')
    CreateBranch(
        @Headers("authorization") authHeader: string,
        @Body() dto: CreateBranchDto,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.adminService.CreateBranch(
            token,
            dto,
            client.ipAddress,
            client.userAgent
        )
    }

    @Post('/create-platfrom-user')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admin:create-platfrom-user')
    CreatePlatFromUser(
        @Headers("authorization") authHeader: string,
        @Body() dto: CreatePlatfromUserDTO,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.adminService.CreatePlatfromUser(
            token,
            dto,
            client.ipAddress,
            client.userAgent
        )
    }

    @Get('/fetch-auditlogs')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admin:fetch-auditlogs')
    FetchAllAuditLogs(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.adminService.FetchAllAuditLogs(token)
    }

    @Get('/fetch-auditlog/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admin:fetch-auditlog-byid')
    FetchAuditLogbyID(
        @Headers("authorization") authHeader: string,
        @Param('id') id: string
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.adminService.FetchAuditlogbyId(
            token,
            id
        )
    }

    @Post('/upload-system-files')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admin:upload-system-files')
    @UseInterceptors(FileInterceptor("system_file", systemFileUploadOptions))
    UploadSystemFiles(
        @Headers("authorization") authHeader: string,
        @UploadedFile() systemFile: Express.Multer.File,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.adminService.UploadsystemFiles(
            token,
            systemFile,
            client.ipAddress,
            client.userAgent
        )
    }

    @Get('/fetch-system-files')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admin:fetch-system-files')
    FetchFiles(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.adminService.FetchChunkswithFiles(
            token
        )
    }

}