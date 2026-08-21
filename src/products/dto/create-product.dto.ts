import { IsArray, IsBoolean, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
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

    @IsNumber()
    price!: Number;

    @IsOptional()
    @IsNumber()
    discount!: Number;

    @IsNumber()
    stock!: Number;

    @IsArray()
    @IsString({ each: true })
    tags!: String[];

    @IsOptional()
    @IsBoolean()
    product_status!: Boolean;
}