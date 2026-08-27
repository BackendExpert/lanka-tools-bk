import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private readonly stripe: Stripe;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.stripe = new Stripe(
            this.configService.get<string>('STRIPE_SECRET_KEY')!,
        );
    }

    get client(): Stripe {
        return this.stripe;
    }
}