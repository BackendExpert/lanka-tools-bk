import { IsString } from "class-validator";

export class CreatePlatfromUserDTO {
    @IsString()
    email!: string

    @IsString()
    role!: string
}