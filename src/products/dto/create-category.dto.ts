import { IsArray, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
    @IsString()
    category!: string;

    @IsString()
    category_desc!: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    sub_category?: string[];
}