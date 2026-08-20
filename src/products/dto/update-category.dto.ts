import { IsArray, IsOptional, IsString } from "class-validator";

export class UpdateCategoryDto {
    @IsString()
    category_desc!: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    sub_category?: string[];
}