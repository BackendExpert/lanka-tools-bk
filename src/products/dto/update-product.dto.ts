import { IsArray, IsBoolean, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateProductDTO {
    @IsOptional()
    @IsString()
    description?: String;

    @IsOptional()
    @IsMongoId()
    category!: Types.ObjectId;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    sub_category?: String[];

    @IsOptional()
    @IsNumber()
    price?: Number;

    @IsOptional()
    @IsNumber()
    discount?: Number;

    @IsOptional()
    @IsNumber()
    stock?: Number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: String[];

    @IsOptional()
    @IsBoolean()
    product_status?: Boolean;
}