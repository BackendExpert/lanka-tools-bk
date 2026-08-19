import { IsString } from "class-validator";

export class UpdatePasswordDTO {
    @IsString()
    current_pass!: string

    @IsString()
    new_pass!: string
}