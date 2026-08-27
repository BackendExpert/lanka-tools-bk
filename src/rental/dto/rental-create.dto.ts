import { IsNumber, IsString } from "class-validator";

export class RentalCreateDTO {
    @IsString()
    startDate!: string;

    @IsString()
    startTime!: string;

    @IsString()
    endDate!: string;

    @IsString()
    endTime!: string;
}