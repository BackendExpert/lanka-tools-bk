import { IsArray, IsBoolean, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateProductDTO {
    @IsString()
    product!: String;

    @IsString()
    description!: String;

    @IsMongoId()
    category!: Types.ObjectId;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    sub_category!: String[];

    @Type(() => Number)
    @IsNumber()
    hourly_price!: Number;

    @Type(() => Number)
    @IsNumber()
    daily_price!: Number;

    @Type(() => Number)
    @IsNumber()
    weekly_price!: Number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    discount!: Number;

    @Type(() => Number)
    @IsNumber()
    stock!: Number;

    @IsArray()
    @IsString({ each: true })
    tags!: String[];

    @IsOptional()
    @IsBoolean()
    product_status!: Boolean;
}