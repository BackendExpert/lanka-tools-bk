import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuditLog, AuditLogDocument } from "src/auditlogs/schema/auditlog.schema";
import { Role, RoleDocument } from "src/role/schema/role.schema";
import { User, UserDocument } from "src/user/schema/user.schema";
import { Category, CategoryDocument } from "./schema/category.schema";
import { EmailService } from "src/common/utils/email.util";
import { JwtService } from "@nestjs/jwt";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { getLocationFromIP } from "src/common/utils/location";
import { verifyToken } from "src/common/utils/verify-token";
import { createAuditLog } from "src/common/utils/auditlogs.util";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CreateProductDTO } from "./dto/create-product.dto";
import { Product, ProductDocument } from "./schema/product.schema";
import { UpdateProductDTO } from "./dto/update-product.dto";

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        @InjectModel(AuditLog.name)
        private auditlogModel: Model<AuditLogDocument>,

        @InjectModel(Role.name)
        private roleModel: Model<RoleDocument>,

        @InjectModel(Category.name)
        private categoryModel: Model<CategoryDocument>,

        @InjectModel(Product.name)
        private productModel: Model<ProductDocument>,

        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
    ) { }

    async CreateCategory(
        token: string,
        dto: CreateCategoryDto,
        file: Express.Multer.File,
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

        const category_check = await this.categoryModel.findOne({ category: dto.category })

        if (category_check) {
            throw new ConflictException("The Category Already Added")
        }

        const create_category = await this.categoryModel.create({
            category: dto.category,
            category_desc: dto.category_desc,
            category_stats: true,
            sub_category: dto.sub_category,
            category_img: file.filename,
        })

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "CATEGORY_CREATED",
            description: `${user.email} Create Category ${dto.category}`,
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
            message: "Category Added Success"
        }
    }

    async UpdateCategory(
        token: string,
        dto: UpdateCategoryDto,
        categoryId: string,
        file: Express.Multer.File,
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

        const category_check = await this.categoryModel.findById(
            categoryId
        );

        if (!category_check) {
            throw new NotFoundException("Category Cannot be Found");
        }

        if (dto.category_desc !== undefined) {
            category_check.category_desc = dto.category_desc;
        }

        if (dto.sub_category !== undefined) {
            category_check.sub_category = dto.sub_category;
        }

        if (file) {
            category_check.category_img = file.filename;
        }

        await category_check.save();

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "CATEGORY_UPDATED",
            description: `${user.email} Update Category`,
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
            message: "Category Updated Success",
        };
    }

    async FetchCategories(
        token: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const categories = await this.categoryModel.find()

        return {
            success: true,
            message: "Category Fetched Success",
            result: categories,
        }
    }

    async FetchCategorybyId(
        token: string,
        categoryId: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const category = await this.categoryModel.findById(categoryId)

        if (!category) {
            throw new NotFoundException("Category Cannot be found")
        }

        return {
            success: true,
            message: "Category Fetched Success",
            result: category,
        }
    }

    async DeactiveCategory(
        token: string,
        categoryId: string,
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

        const category = await this.categoryModel.findById(categoryId);

        if (!category) {
            throw new NotFoundException("Category Cannot be Found");
        }

        const update_category_status = await this.categoryModel.findByIdAndUpdate(
            categoryId,
            {
                category_stats: !category.category_stats,
            },
            { new: true }
        );

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "CATEGORY_STATUS_UPDATED",
            description: `${user.email} Update Category Status`,
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
            message: "Category Status Updated Success"
        }
    }

    // --------------------------------------------------

    //  PRODUCTS

    // ---------------------------------------------------


    async CreateProduct(
        token: string,
        dto: CreateProductDTO,
        files: Express.Multer.File[],
        ipAddress?: string,
        userAgent?: string
    ) {
        const location = getLocationFromIP(ipAddress || "");

        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const check_product = await this.productModel.findOne({ product: dto.product })

        if (check_product) {
            throw new ConflictException("The Product Already Added System")
        }

        const create_product = await this.productModel.create({
            product: dto.product,
            description: dto.description,
            category: dto.category,
            sub_category: dto.sub_category,
            product_imgs: files.map((file) => file.filename),
            price: dto.price,
            discount: dto.discount,
            stock: dto.stock,
            tags: dto.tags,
            product_status: true,
        });

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "PRODUCT_CREATED",
            description: `${user.email} Create product ${dto.product}`,
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
            message: "Product Created Success"
        }
    }

    async UpdateProduct(
        token: string,
        dto: UpdateProductDTO,
        productId: string,
        files: Express.Multer.File[],
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

        const product_check = await this.productModel.findById(
            productId
        );

        if (!product_check) {
            throw new NotFoundException("Product Cannot be Found");
        }

        if (dto.description !== undefined) {
            product_check.description = dto.description;
        }

        if (dto.category !== undefined) {
            product_check.category = dto.category;
        }

        if (dto.sub_category !== undefined) {
            product_check.sub_category = dto.sub_category;
        }

        if (dto.price !== undefined) {
            product_check.price = dto.price;
        }

        if (dto.discount !== undefined) {
            product_check.discount = dto.discount;
        }

        if (dto.stock !== undefined) {
            product_check.stock = dto.stock;
        }

        if (dto.tags !== undefined) {
            product_check.tags = dto.tags;
        }

        if (dto.product_status !== undefined) {
            product_check.product_status = dto.product_status;
        }

        if (files && files.length > 0) {
            product_check.product_imgs = files.map(
                (file) => file.filename
            );
        }

        await product_check.save();

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "PRODUCT_UPDATED",
            description: `${user.email} Update Product ${product_check.product}`,
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
            message: "Product Updated Success",
        };
    }

    async UpdateProductStatus(
        token: string,
        productID: string,
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

        const product_check = await this.productModel.findById(
            productID
        );

        if (!product_check) {
            throw new NotFoundException("The Product cannot be found")
        }

        const update_product_status = await this.categoryModel.findByIdAndUpdate(
            productID,
            {
                category_stats: !product_check?.product_status,
            },
            { new: true }
        );

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "PRODUCT_STATUS_UPDATED",
            description: `${user.email} Update ${product_check.product} Product Status`,
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
            message: "Update Status Updated Success"
        }
    }

    async FetchAllProducts(
        token: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const products = await this.productModel.find().populate('category')

        return {
            success: true,
            message: "Products Fetched Success",
            result: products
        }
    }

    async FetchProductByID(
        token: string,
        productID: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const product = await this.productModel.findById(productID).populate('category')

        if(!product) {
            throw new NotFoundException("The Product Cannot be found")
        }

        return {
            success: true,
            message: "Fetched Product Success",
            result: product
        }
    }
}