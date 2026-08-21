import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLog, AuditLogSchema } from "src/auditlogs/schema/auditlog.schema";
import { AuthModule } from "src/auth/auth.module";
import { RoleModule } from "src/role/role.module";
import { Role, RoleSchema } from "src/role/schema/role.schema";
import { User, UserSchema } from "src/user/schema/user.schema";
import { Category, CategorySchema } from "./schema/category.schema";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { EmailService } from "src/common/utils/email.util";
import { Product, ProductSchema } from "./schema/product.schema";

@Module({
    imports: [
        RoleModule,
        AuthModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
            { name: AuditLog.name, schema: AuditLogSchema },
            { name: Category.name, schema: CategorySchema },
            { name: Product.name, schema: ProductSchema },
        ])
    ],
    controllers: [ProductController],
    providers: [ProductService, EmailService],
    exports: [ProductService]
})

export class ProductModule { }