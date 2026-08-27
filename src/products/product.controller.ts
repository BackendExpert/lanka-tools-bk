import { Body, Controller, Get, Header, Headers, Param, Patch, Post, UnauthorizedException, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProductService } from "./product.service";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { PermissionsGuard } from "src/common/guard/permissions.guard";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { CategoryImageUploadOptions, ProductImageUploadOptions } from "src/common/utils/file-upload.util";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ClientInfoDecorator } from "src/common/decorators/client-info.decorator";
import type { ClientInfo } from "src/common/interfaces/client-info.interface";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CreateProductDTO } from "./dto/create-product.dto";
import { UpdateProductDTO } from "./dto/update-product.dto";


@Controller('api/product')
export class ProductController {
    constructor(
        private readonly productService: ProductService
    ) { }

    @Post('/create-category')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:create-category')
    @UseInterceptors(FileInterceptor("category_img", CategoryImageUploadOptions))
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

    @Patch('/update-category/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:update-category')
    @UseInterceptors(FileInterceptor("category_img", CategoryImageUploadOptions))
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


    // ---------------------------------

    // Products

    // -------------------------------


    @Post('/create-product')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:create-product')
    @UseInterceptors(FilesInterceptor('files', 10, ProductImageUploadOptions))
    CreateProduct(
        @Headers("authorization") authHeader: string,
        @Body() dto: CreateProductDTO,
        @UploadedFiles() files: Express.Multer.File[],
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.productService.CreateProduct(
            token,
            dto,
            files,
            client.ipAddress,
            client.userAgent
        )
    }

    @Patch('/update-product/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:update-product')
    @UseInterceptors(FilesInterceptor('files', 10, ProductImageUploadOptions))
    UpdateProduct(
        @Headers("authorization") authHeader: string,
        @Body() dto: UpdateProductDTO,
        @Param('id') productId: string,
        @UploadedFiles() files: Express.Multer.File[],
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }

        const token = authHeader.split(" ")[1];

        return this.productService.UpdateProduct(
            token,
            dto,
            productId,
            files,
            client.ipAddress,
            client.userAgent
        );
    }

    @Patch('/update-product-status/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:update-product-status')
    UpdateProductStatus(
        @Headers("authorization") authHeader: string,
        @Param('id') id: string,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }

        const token = authHeader.split(" ")[1];

        return this.productService.UpdateProductStatus(
            token,
            id,
            client.ipAddress,
            client.userAgent
        )
    }

    @Get('/fetch-products')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:fetch-products')
    FetchProducts(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }

        const token = authHeader.split(" ")[1];

        return this.productService.FetchAllProducts(token)
    }

    @Get('/fetch-product/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:fetch-product')
    FetchProductById(
        @Headers("authorization") authHeader: string,
        @Param('id') id: string
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }

        const token = authHeader.split(" ")[1];

        return this.productService.FetchProductByID(token, id)

    }

    @Get('/public-products')
    FetchPublicProducts(
    ) {
        return this.productService.FechShopProducts()
    }

    @Get('/public-product/:id')
    FetchPublicProductByID(
        @Param('id') id: string
    ) {
        return this.productService.FechShopProductsbyID(id)
    }

    // -----------------------------
    // Product Comments
    // -----------------------------

    @Post('/create-comment/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:create-comment')
    CreateComment(
        @Headers('authorization') authHeader: string,
        @Param('id') id: string,
        @Body('comment') comment: string,
        @ClientInfoDecorator() client: ClientInfo,
        @Body('parentCommentId') parentCommentId?: string,
    ) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Invalid or missing token');
        }

        const token = authHeader.split(' ')[1];

        return this.productService.CreateCommets(
            token,
            id,
            comment,
            parentCommentId,
            client.ipAddress,
            client.userAgent
        );
    }


    @Get('/fetch-commets/:id')
    FetchProductCommts(
        @Param('id') id: string
    ) {
        return this.productService.FetchProductComment(id)
    }
}