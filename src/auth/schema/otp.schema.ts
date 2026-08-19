import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type OTPDocument = OTP & Document

@Schema({ timestamps: true })

export class OTP {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user!: Types.ObjectId;

    @Prop({ default: String })
    otp!: string

    @Prop({ required: true, default: false })
    is_used!: boolean

    @Prop({
        required: true,
        default: () => new Date(Date.now() + 10 * 60 * 1000),
        expires: 0,
    })
    expire_at!: Date;
}

export const OTPSchema = SchemaFactory.createForClass(OTP);