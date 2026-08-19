import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export class RegisterDTO{
    @IsString()
    first_name!: string

    @IsString()
    last_name!: string

    @IsEmail()
    email!: string

    @IsStrongPassword()
    password!: string    
}