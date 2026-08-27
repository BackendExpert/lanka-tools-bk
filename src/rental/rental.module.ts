import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLog, AuditLogSchema } from "src/auditlogs/schema/auditlog.schema";
import { AuthModule } from "src/auth/auth.module";
import { Product, ProductSchema } from "src/products/schema/product.schema";
import { RoleModule } from "src/role/role.module";
import { Role, RoleSchema } from "src/role/schema/role.schema";
import { User, UserSchema } from "src/user/schema/user.schema";
import { Rental, RentalSchema } from "./schema/rental.schema";
import { RentalController } from "./rental.controller";
import { RentalService } from "./rental.service";
import { EmailService } from "src/common/utils/email.util";
import { RentelEngine } from "src/common/utils/rental-engine";
import { StripeService } from "src/common/utils/payment.util";
import { OverDueEngine } from "src/common/utils/overdue.util";
import { Notification, NotificationSchema } from "src/profile/schema/notification.schema";
import { Overdue, OverdueSchema } from "./schema/overdue.schema";

@Module({
    imports: [
        RoleModule,
        AuthModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: AuditLog.name, schema: AuditLogSchema },
            { name: Product.name, schema: ProductSchema },
            { name: Role.name, schema: RoleSchema },
            { name: Rental.name, schema: RentalSchema },
            { name: Notification.name, schema: NotificationSchema },
            { name: Overdue.name, schema: OverdueSchema },
        ])
    ],
    controllers: [RentalController],
    providers: [RentalService, EmailService, RentelEngine, StripeService, OverDueEngine],
    exports: [RentalService]
})

export class RentalModule { }