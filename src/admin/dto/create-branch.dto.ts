import { IsString } from "class-validator";

export class CreateBranchDto {
    @IsString()
    admin_email!: string

    @IsString()
    admin_first_name!: string

    @IsString()
    admin_last_name!: string

    @IsString()
    branch_name!: string

    @IsString()
    branch_address!: string

    @IsString()
    branch_google_location!: string
}