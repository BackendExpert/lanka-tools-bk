import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
    sub: string;
    email: string;
    role?: string;
    type?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload) {
        if (!payload?.email) {
            throw new UnauthorizedException('JWT missing email');
        }

        if (payload.type && payload.type !== 'LOGIN_TOKEN') {
            throw new UnauthorizedException('Invalid token type');
        }

        return {
            userId: payload.sub,
            email: payload.email.toLowerCase(),
            role: payload.role,
        };
    }
}