import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class RentelEngine {
    async calculatePrice(
        startDate: string,
        startTime: string,
        endDate: string,
        endTime: string,
        hourlyPrice: number,
        dailyPrice: number,
        weeklyPrice: number
    ) {
        const start = new Date(`${startDate}T${startTime}:00+05:30`);
        const end = new Date(`${endDate}T${endTime}:00+05:30`);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new BadRequestException("Invalid start or end date/time");
        }

        if (end <= start) {
            throw new BadRequestException("End date/time must be after start date/time");
        }

        const durationMilliseconds = end.getTime() - start.getTime();
        const totalHours = durationMilliseconds / (1000 * 60 * 60);
        const totalDays = totalHours / 24;
        const totalWeeks = totalDays / 7;

        let price = 0;

        if (totalWeeks >= 1) {
            const weeks = Math.floor(totalWeeks);
            const remainingDays = Math.floor(totalDays - weeks * 7);
            const remainingHours = Math.ceil(totalHours - weeks * 7 * 24 - remainingDays * 24);

            price = weeks * weeklyPrice;
            price += remainingDays * dailyPrice;
            price += remainingHours * hourlyPrice;
        } else if (totalDays >= 1) {
            const days = Math.floor(totalDays);
            const remainingHours = Math.ceil(totalHours - days * 24);

            price = days * dailyPrice;
            price += remainingHours * hourlyPrice;
        } else {
            price = Math.ceil(totalHours) * hourlyPrice;
        }

        const startYear = Number(startDate.substring(0, 4));
        const endYear = Number(endDate.substring(0, 4));

        const publicHolidays = await this.getPublicHolidays(startYear, endYear);
        const rentalDates = this.getRentalDates(start, end);

        const rentalPublicHolidays = rentalDates.filter((date) => publicHolidays.includes(date));

        return {
            startDate,
            startTime,
            endDate,
            endTime,
            totalHours: Math.ceil(totalHours),
            totalDays: Number(totalDays.toFixed(2)),
            totalWeeks: Number(totalWeeks.toFixed(2)),
            hourlyPrice,
            dailyPrice,
            weeklyPrice,
            totalPrice: price,
            publicHolidays,
            rentalPublicHolidays
        };
    }

    private getRentalDates(start: Date, end: Date): string[] {
        const dates: string[] = [];
        const current = new Date(start);

        while (current <= end) {
            const date = current.toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });

            if (!dates.includes(date)) {
                dates.push(date);
            }

            current.setDate(current.getDate() + 1);
        }

        return dates;
    }

    private async getPublicHolidays(startYear: number, endYear: number): Promise<string[]> {
        const holidays: string[] = [];

        for (let year = startYear; year <= endYear; year++) {
            try {
                const response = await fetch(
                    `https://tallyfy.com/national-holidays/api/LK/${year}.json`
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch holidays for ${year}`);
                }

                const data = await response.json();

                if (Array.isArray(data.holidays)) {
                    for (const holiday of data.holidays) {
                        if (holiday?.date && typeof holiday.date === "string") {
                            holidays.push(holiday.date);
                        }
                    }
                }
            } catch (error) {
                throw new BadRequestException(
                    `Unable to fetch Sri Lanka public holidays for ${year}`
                );
            }
        }

        return [...new Set(holidays)].sort();
    }
}