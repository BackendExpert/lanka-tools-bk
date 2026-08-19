import { IsString } from "class-validator";

export class LoginBackupCodesDTO {
    @IsString()
    email!: string

    @IsString()
    backupcode!: string
}