import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateProductDTO {
    @IsOptional()
    @IsString()
    description?: String;

    @IsOptional()
    @IsMongoId()
    category?: Types.ObjectId;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    sub_category?: String[];

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    hourly_price?: Number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    daily_price?: Number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    weekly_price?: Number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    discount?: Number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    stock?: Number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: String[];

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    product_status?: Boolean;
}