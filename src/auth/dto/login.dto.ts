import { IsBoolean, IsOptional, IsString } from "class-validator";

export class LoginDTO{
    @IsString()
    email!: string

    @IsString()
    password!: string
    
    @IsOptional()
    @IsBoolean()
    tenant_id!: string
}