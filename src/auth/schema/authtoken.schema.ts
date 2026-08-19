import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type AuthTokenDocument = AuthToken & Document;

@Schema({ timestamps: true })
export class AuthToken {

    @Prop({
        type: Types.ObjectId,
        ref: "User",
        required: true,
    })
    user!: Types.ObjectId;

    @Prop({
        required: true,
    })
    refresh_token_hash!: string;

    @Prop({
        required: true,
    })
    expire_at!: Date;

    @Prop()
    device_id?: string;

    @Prop()
    ip_address?: string;

    @Prop()
    user_agent?: string;
}

export const AuthTokenSchema = SchemaFactory.createForClass(AuthToken);