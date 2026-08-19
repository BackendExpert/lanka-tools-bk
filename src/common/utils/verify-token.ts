import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import * as dotenv from "dotenv";

dotenv.config();

export interface JwtPayload {
    sub: string;
    email: string;
    role?: string;
    tenant?: string;
    type?: "LOGIN_TOKEN";
}

const configService = new ConfigService();

const jwtService = new JwtService({
    secret: process.env.JWT_SECRET || configService.get<string>("JWT_SECRET"),
});

export async function verifyToken(
    token: string,
    tokenType?: JwtPayload["type"],
): Promise<JwtPayload> {
    try {
        const payload = await jwtService.verifyAsync<JwtPayload>(token);

        if (tokenType && payload.type !== tokenType) {
            throw new UnauthorizedException("Invalid Token Type");
        }

        return payload;
    } catch (err) {
        console.error(err);
        throw new UnauthorizedException("Invalid or Expired Token");
    }
}