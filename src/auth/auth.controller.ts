import { Body, Controller, Headers, Post, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDTO } from "./dto/Register.dto";
import { ClientInfoDecorator } from "src/common/decorators/client-info.decorator";
import type { ClientInfo } from "src/common/interfaces/client-info.interface";
import { LoginDTO } from "./dto/login.dto";
import { LoginBackupCodesDTO } from "./dto/login-backupcodes.dto";

@Controller('api/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @Post('/register')
    Register(
        @Body() dto: RegisterDTO,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        return this.authService.Registation(
            dto,
            client.ipAddress,
            client.userAgent
        )
    }

    @Post('/login')
    Login(
        @Body() dto: LoginDTO,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        return this.authService.Login(
            dto,
            client.ipAddress,
            client.userAgent
        )
    }

    @Post("/refresh")
    RefreshToken(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.authService.RefreshToken(
            token,
        );
    }

    @Post('/logout')
    Logout(
        @Headers("authorization") authHeader: string,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.authService.Logout(
            token,
            client.ipAddress,
            client.userAgent
        )
    }

    @Post('/login-with-backupcodes')
    LoginWithBackUpcodes(
        @Body() dto: LoginBackupCodesDTO,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        return this.authService.LoginWithBackupCodes(
            dto,
            client.ipAddress,
            client.userAgent
        )
    }

    @Post('/request-password-reset')
    RequestPassReset(
        @Body('email') email: string,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        return this.authService.PasswordReset(
            email,
            client.ipAddress,
            client.userAgent
        )
    }

    @Post('/verify-otp')
    VerifyOTP(
        @Body('otp') otp: string,
        @Headers("authorization") authHeader: string,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }

        const token = authHeader.split(" ")[1];

        return this.authService.VerifyOTP(
            token,
            otp,
            client.ipAddress,
            client.userAgent
        )
    }

    @Post('/update-password')
    UpdatePassword(
        @Body('password') password: string,
        @Headers("authorization") authHeader: string,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }

        const token = authHeader.split(" ")[1];

        return this.authService.UpdatePassword(
            token,
            password,
            client.ipAddress,
            client.userAgent
        )
    }
}