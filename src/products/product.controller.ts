import { Body, Controller, Get, Header, Headers, Param, Patch, Post, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProductService } from "./product.service";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { PermissionsGuard } from "src/common/guard/permissions.guard";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { CategoryImageUploadOptions } from "src/common/utils/file-upload.util";
import { FileInterceptor } from "@nestjs/platform-express";
import { ClientInfoDecorator } from "src/common/decorators/client-info.decorator";
import type { ClientInfo } from "src/common/interfaces/client-info.interface";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";


@Controller('api/product')
export class ProductController {
    constructor(
        private readonly productService: ProductService
    ) { }

    @Post('/create-category')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:create-category')
    @UseInterceptors(FileInterceptor("profile_image", CategoryImageUploadOptions))
    CreateCategory(
        @Headers("authorization") authHeader: string,
        @Body() dto: CreateCategoryDto,
        @UploadedFile() categoryImage: Express.Multer.File,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.productService.CreateCategory(
            token,
            dto,
            categoryImage,
            client.ipAddress,
            client.userAgent
        )
    }

    @Post('/update-category/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:update-category')
    @UseInterceptors(FileInterceptor("profile_image", CategoryImageUploadOptions))
    UpdateCategory(
        @Headers("authorization") authHeader: string,
        @Param('id') id: string,
        @Body() dto: UpdateCategoryDto,
        @UploadedFile() categoryImage: Express.Multer.File,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.productService.UpdateCategory(
            token,
            dto,
            id,
            categoryImage,
            client.ipAddress,
            client.userAgent
        )
    }

    @Patch('/update-category-status/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:update-category-status')
    UpdateCategoryStatus(
        @Headers("authorization") authHeader: string,
        @Param('id') id: string,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.productService.DeactiveCategory(
            token,
            id,
            client.ipAddress,
            client.userAgent
        )
    }

    @Get('/fetch-categories')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:fetch-categories')
    FetchAllCategories(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.productService.FetchCategories(
            token
        )
    }

    @Get('/fetch-category/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:fetch-category')
    FetchCategory(
        @Headers("authorization") authHeader: string,
        @Param('id') id: string
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.productService.FetchCategorybyId(
            token,
            id
        )
    }



}