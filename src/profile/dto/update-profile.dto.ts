import {
    IsDateString,
    IsOptional,
    IsString,
    ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class AddressDTO {

    @IsOptional()
    @IsString()
    address_line_1?: string;

    @IsOptional()
    @IsString()
    address_line_2?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    postal_code?: string;

    @IsOptional()
    @IsString()
    country?: string;
}

export class UpdateProfileDTO {

    @IsOptional()
    @IsString()
    first_name?: string;

    @IsOptional()
    @IsString()
    last_name?: string;

    @IsOptional()
    @IsString()
    mobile?: string;

    @IsOptional()
    @IsDateString()
    dob?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDTO)
    address?: AddressDTO;

    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDTO)
    billing_address?: AddressDTO;

    @IsOptional()
    @IsString()
    bio?: string;
}