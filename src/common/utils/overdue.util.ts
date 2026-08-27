import { Injectable } from "@nestjs/common";

@Injectable()
export class OverDueEngine {
    CreateOverDue(
        userID: string,
        productID: string,
        rentalID: string,
        returnDate: string,
        returnTime: string,
        rentalCost: number,
    ) {
        const returnDateTime = new Date(`${returnDate}T${returnTime}:00+05:30`);
        const today = new Date()
        const overduePercentage = 10

        const isOverdue = today > returnDateTime;

        if (today <= returnDateTime) {
            return {
                userID,
                productID,
                rentalID,
                isOverdue: false,
                overdueDays: 0,
                overduePercentage,
                overdueCost: 0,
                totalCost: rentalCost,
            };
        }

        const overdueMilliseconds = today.getTime() - returnDateTime.getTime();
        const overdueDays = Math.ceil(overdueMilliseconds / (1000 * 60 * 60 * 24));

        const dailyOverdueCost = Number(((rentalCost * overduePercentage) / 100).toFixed(2));
        const overdueCost = Number((dailyOverdueCost * overdueDays).toFixed(2));
        const totalCost = Number((rentalCost + overdueCost).toFixed(2));

        return {
            userID,
            productID,
            rentalID,
            isOverdue: true,
            overdueDays,
            overduePercentage,
            dailyOverdueCost,
            overdueCost,
            rentalCost,
            totalCost,
        };
    }
}