import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuditLog, AuditLogDocument } from "src/auditlogs/schema/auditlog.schema";
import { EmailService } from "src/common/utils/email.util";
import { RentelEngine } from "src/common/utils/rental-engine";
import { Product, ProductDocument } from "src/products/schema/product.schema";
import { Role, RoleDocument } from "src/role/schema/role.schema";
import { User, UserDocument } from "src/user/schema/user.schema";
import { Rental, RentalDocument } from "./schema/rental.schema";
import { getLocationFromIP } from "src/common/utils/location";
import { verifyToken } from "src/common/utils/verify-token";
import { RentalCreateDTO } from "./dto/rental-create.dto";
import { StripeService } from "src/common/utils/payment.util";
import { OverDueEngine } from "src/common/utils/overdue.util";
import { CreateNotification } from "src/common/utils/notification.util";
import { Notification, NotificationDocument } from "src/profile/schema/notification.schema";
import { Cron } from "@nestjs/schedule";
import { Overdue, OverdueDocument } from "./schema/overdue.schema";
import { createAuditLog } from "src/common/utils/auditlogs.util";

@Injectable()
export class RentalService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        @InjectModel(AuditLog.name)
        private auditlogModel: Model<AuditLogDocument>,

        @InjectModel(Product.name)
        private productModel: Model<ProductDocument>,

        @InjectModel(Role.name)
        private roleModel: Model<RoleDocument>,

        @InjectModel(Rental.name)
        private rentalModel: Model<RentalDocument>,

        @InjectModel(Notification.name)
        private notificationModel: Model<NotificationDocument>,

        @InjectModel(Overdue.name)
        private overdueModel: Model<OverdueDocument>,

        private rentalEngine: RentelEngine,
        private jwtService: JwtService,
        private emailService: EmailService,
        private stripeService: StripeService,
        private overdueEngine: OverDueEngine,
    ) { }

    async CalculateRentalCost(
        token: string,
        productid: string,
        dto: RentalCreateDTO,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const product = await this.productModel.findById(productid);

        if (!product) {
            throw new NotFoundException("Product Cannot be found");
        }

        const rentaldata = await this.rentalEngine.calculatePrice(
            dto.startDate,
            dto.startTime,
            dto.endDate,
            dto.endTime,
            Number(product.hourly_price),
            Number(product.daily_price),
            Number(product.weekly_price),
        );

        const vatRate = 18;

        const subtotal = Number(rentaldata.totalPrice);

        const vatAmount = Number(((subtotal * vatRate) / 100).toFixed(2));

        const totalAmount = Number((subtotal + vatAmount).toFixed(2));

        return {
            success: true,
            message: "Rental Cost Calculate Success",
            result: {
                ...rentaldata,
                subtotal,
                vatRate,
                vatAmount,
                totalAmount,
            },
        };
    }

    async RentTool(
        token: string,
        productid: string,
        dto: RentalCreateDTO,
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

        const unpaidOverdue = await this.overdueModel.findOne({
            user: user._id,
            is_pay_overdue: false,
        });

        if (unpaidOverdue) {
            throw new NotFoundException(
                "You have unpaid overdue fees. Please pay all overdue fees before renting another product."
            );
        }

        const product = await this.productModel.findById(productid);

        if (!product) {
            throw new NotFoundException("Product Cannot be found");
        }

        if (Number(product.stock || 0) <= 0) {
            throw new NotFoundException("Product is out of stock");
        }

        const existingRental = await this.rentalModel.findOne({
            user: user._id,
            product: product._id,
            endDateTime: { $gt: new Date() },
        });

        if (existingRental) {
            throw new NotFoundException(
                "You have already rented this product. Please return it before renting it again."
            );
        }

        const rentaldata = await this.rentalEngine.calculatePrice(
            dto.startDate,
            dto.startTime,
            dto.endDate,
            dto.endTime,
            Number(product.hourly_price),
            Number(product.daily_price),
            Number(product.weekly_price),
        );

        const vatRate = 18;
        const subtotal = Number(rentaldata.totalPrice);
        const vatAmount = Number(((subtotal * vatRate) / 100).toFixed(2));
        const totalAmount = Number((subtotal + vatAmount).toFixed(2));

        const paymentIntent = await this.stripeService.client.paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency: "usd",
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never",
            },
        });

        const startDateTime = new Date(`${dto.startDate}T${dto.startTime}:00`);
        const endDateTime = new Date(`${dto.endDate}T${dto.endTime}:00`);

        const rental = await this.rentalModel.create({
            user: user._id,
            product: product._id,
            hourlyPrice: Number(product.hourly_price),
            dailyPrice: Number(product.daily_price),
            weeklyPrice: Number(product.weekly_price),
            startDateTime,
            endDateTime,
            totalHours: Number(rentaldata.totalHours),
            totalDays: Number(rentaldata.totalDays),
            totalWeeks: Number(rentaldata.totalWeeks),
            subtotal,
            vatRate,
            vatAmount,
            totalAmount,
        });

        await this.productModel.findOneAndUpdate(
            { _id: product._id, stock: { $gt: 0 } },
            { $inc: { stock: -1 } },
        );

        await this.emailService.RentalPaymentSuccessEmail(
            user.email,
            String(product.product),
            startDateTime,
            endDateTime,
            Number(product.hourly_price),
            Number(product.daily_price),
            Number(product.weekly_price),
            Number(rentaldata.totalHours),
            Number(rentaldata.totalDays),
            Number(rentaldata.totalWeeks),
            subtotal,
            vatRate,
            vatAmount,
            totalAmount,
            paymentIntent.id,
            ipAddress,
            userAgent,
        );

        await CreateNotification(
            this.notificationModel,
            user._id,
            "Rental Created Successfully",
            `Your rental request for ${String(product.product)} has been created successfully.`,
            "Notice"
        );

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "RENT_A_TOOL",
            description: `${user.email} Rent Tool ${product._id}`,
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
            message: "Rental Create Success",
            result: {
                ...rentaldata,
                subtotal,
                vatRate,
                vatAmount,
                totalAmount,
            },
            rental,
            payment: {
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
                status: paymentIntent.status,
            },
        };
    }

    async RentalList(
        token: string,
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const rentelist = await this.rentalModel.find().populate('user').populate('product')

        return {
            success: true,
            message: "Rentel List fetched Success",
            result: rentelist
        }
    }

    async RentReocde(
        token: string,
        rentId: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const rentrecode = await this.rentalModel.findById(rentId).populate('user').populate('product')

        if (!rentrecode) {
            throw new NotFoundException("Rental Recode Not found")
        }

        return {
            success: true,
            message: "Rental Recode Fetched Success",
            result: rentrecode
        }
    }

    @Cron("0 0 * * *")
    async sendOverDueEmail() {
        const rentals = await this.rentalModel.find({
            endDateTime: { $lt: new Date() },
        }).populate("user").populate("product");

        for (const rental of rentals) {
            const user = rental.user as any;
            const product = rental.product as any;

            if (!user?.email || !product) {
                continue;
            }

            const overdue = this.overdueEngine.CreateOverDue(
                String(user._id),
                String(product._id),
                String(rental._id),
                new Date(rental.endDateTime).toISOString().split("T")[0],
                new Date(rental.endDateTime).toTimeString().slice(0, 5),
                Number(rental.totalAmount),
            );

            if (!overdue.isOverdue) {
                continue;
            }

            await this.emailService.RentalOverDueEmail(
                user.email,
                String(product.product),
                overdue.overdueDays,
                overdue.overduePercentage,
                overdue.overdueCost,
                overdue.totalCost,
            );
        }
    }

    async ReturnTool(
        token: string,
        rentalID: string,
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

        const rentalrecode = await this.rentalModel.findById(rentalID).populate("user").populate("product");

        if (!rentalrecode) {
            throw new NotFoundException("Rental Record cannot be found");
        }

        if (rentalrecode.is_returned) {
            throw new NotFoundException("This rental has already been returned");
        }

        const rentalUser = rentalrecode.user as any;
        const product = rentalrecode.product as any;

        if (!rentalUser) {
            throw new NotFoundException("Rental User Cannot be found");
        }

        if (!product) {
            throw new NotFoundException("Product Cannot be found");
        }

        const returnDate = new Date(rentalrecode.endDateTime).toISOString().split("T")[0];
        const returnTime = new Date(rentalrecode.endDateTime).toTimeString().slice(0, 5);

        const overdueData = this.overdueEngine.CreateOverDue(
            String(rentalUser._id),
            String(product._id),
            String(rentalrecode._id),
            returnDate,
            returnTime,
            Number(rentalrecode.totalAmount),
        );

        if (overdueData.isOverdue) {
            await this.overdueModel.create({
                user: rentalUser._id,
                product: product._id,
                rentel: rentalrecode._id,
                override_cost: overdueData.overdueCost,
                is_pay_overdue: false,
            });
        }

        await this.productModel.findByIdAndUpdate(
            product._id,
            {
                $inc: {
                    stock: 1,
                },
            },
            {
                new: true,
            }
        );

        await this.rentalModel.findByIdAndUpdate(
            rentalrecode._id,
            {
                $set: {
                    is_returned: true,
                },
            },
            {
                new: true,
            }
        );

        if (overdueData.isOverdue) {
            await CreateNotification(
                this.notificationModel,
                rentalUser._id,
                "Tool Returned With Overdue Cost",
                `Your rental tool ${product.product} was returned successfully with an overdue cost of $${Number(overdueData.overdueCost).toFixed(2)}.`,
                "System"
            );
        } else {
            await CreateNotification(
                this.notificationModel,
                rentalUser._id,
                "Tool Returned Successfully",
                `Your rental tool ${product.product} was returned successfully.`,
                "System"
            );
        }

        await createAuditLog(this.auditlogModel, {
            user: rentalUser._id,
            action: "RENTAL_RETURNED",
            description: `${rentalUser.email} returned rental for ${product.product}`,
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                rentalID,
                productID: String(product._id),
                userID: String(rentalUser._id),
                isOverdue: overdueData.isOverdue,
                overdueDays: overdueData.overdueDays,
                overdueCost: overdueData.overdueCost,
                totalCost: overdueData.totalCost,
            },
        });

        return {
            success: true,
            message: overdueData.isOverdue
                ? "Tool returned successfully with overdue charges"
                : "Tool returned successfully",
            result: {
                rental: rentalrecode,
                overdue: overdueData,
            },
        };
    }

    async FetchLateFees(
        token: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const latefees = await this.overdueModel.find()
            .populate('user')
            .populate('product')
            .populate('rentel')

        return {
            success: true,
            message: "Fetch Late Fees success",
            result: latefees
        }
    }

    async FetchLateFee(
        token: string,
        overdevID: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const latefee = await this.overdueModel.findById(overdevID)
            .populate('user')
            .populate('product')
            .populate('rentel')

        if (!latefee) {
            throw new NotFoundException("The Reocde cannot be found")
        }

        return {
            success: true,
            message: "Fetch Late Fees success",
            result: latefee
        }
    }

    async RequesttoPayOverDue(
        token: string,
        overdueID: string,
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

        const latefee = await this.overdueModel.findById(overdueID)
            .populate("user")
            .populate("product")
            .populate("rentel");

        if (!latefee) {
            throw new NotFoundException("The Reocde cannot be found");
        }

        const rentalUser = latefee.user as any;
        const product = latefee.product as any;
        const rental = latefee.rentel as any;

        if (!rentalUser) {
            throw new NotFoundException("Rental User Cannot be found");
        }

        if (!product) {
            throw new NotFoundException("Product Cannot be found");
        }

        if (!rental) {
            throw new NotFoundException("Rental Record Cannot be found");
        }

        if (latefee.is_pay_overdue) {
            throw new NotFoundException("This overdue fee has already been paid");
        }

        const renter_email = rentalUser.email;
        const renter_id = rentalUser._id;

        const overdueMilliseconds = new Date().getTime() - new Date(rental.endDateTime).getTime();

        const overdueDays = Math.max(
            0,
            Math.ceil(overdueMilliseconds / (1000 * 60 * 60 * 24))
        );

        await this.emailService.RentalOverduePaymentRequestEmail(
            renter_email,
            String(product.product),
            overdueDays,
            Number(latefee.override_cost),
            Number(latefee.override_cost),
        );

        await CreateNotification(
            this.notificationModel,
            renter_id,
            "Overdue Payment Request",
            `Your rental for ${String(product.product)} has an overdue charge of $${Number(latefee.override_cost).toFixed(2)}. Please complete the overdue payment.`,
            "Notice"
        );

        await createAuditLog(this.auditlogModel, {
            user: renter_id,
            action: "REQUEST_TO_PAY_OVERDUE",
            description: `${user.email} requested ${renter_email} to pay the overdue fee`,
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                location,
                overdueID,
                renterID: String(renter_id),
                productID: String(product._id),
                rentalID: String(rental._id),
                overdueDays,
                overdueCost: Number(latefee.override_cost),
            },
        });

        return {
            success: true,
            message: "Request Sent Successfully",
        };
    }

    async FetchMyRenttools(
        token: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const rentaltools = await this.rentalModel
            .find({ user: user._id })
            .populate('product');

        const result = await Promise.all(
            rentaltools.map(async (rental) => {
                const overdue = await this.overdueModel.findOne({
                    rentel: rental._id
                });

                return {
                    ...rental.toObject(),
                    overdue: overdue || null
                };
            })
        );

        return {
            success: true,
            message: "All rental Tools are fetched success",
            result
        };
    }

    async MyLateFees(
        token: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const mylatefees = await this.overdueModel.find({ user: user._id })
            .populate('product')
            .populate('rentel')

        return {
            success: true,
            message: "Late fees Fetched Success",
            result: mylatefees
        }

    }

    async ClearLateFees(
        token: string,
        cost: string,
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

        const latefees = await this.overdueModel.find({
            user: user._id,
            is_pay_overdue: false,
        });

        if (!latefees.length) {
            throw new NotFoundException("No unpaid overdue fees found");
        }

        const totalOverdue = Number(
            latefees.reduce(
                (total, item) => total + Number(item.override_cost || 0),
                0
            ).toFixed(2)
        );

        const requestedCost = Number(cost);

        if (!Number.isFinite(requestedCost)) {
            throw new NotFoundException("Invalid payment amount");
        }

        if (requestedCost !== totalOverdue) {
            throw new NotFoundException(
                `Full overdue payment required. Total amount is $${totalOverdue.toFixed(2)}`
            );
        }

        await this.overdueModel.updateMany(
            {
                user: user._id,
                is_pay_overdue: false,
            },
            {
                $set: {
                    is_pay_overdue: true,
                },
            }
        );

        await CreateNotification(
            this.notificationModel,
            user._id,
            "Overdue Payment Completed",
            `Your full overdue payment of $${totalOverdue.toFixed(2)} has been completed successfully.`,
            "Notice"
        );

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "CLEAR_OVERDUE_FEES",
            description: `${user.email} paid all overdue fees totaling $${totalOverdue.toFixed(2)}`,
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                location,
                totalOverdue,
                overdueCount: latefees.length,
            },
        });

        return {
            success: true,
            message: "All Overdue Fees Cleared Successfully",
            result: {
                totalPaid: totalOverdue,
                overdueCount: latefees.length,
            },
        };
    }

}