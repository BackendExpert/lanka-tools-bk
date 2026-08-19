import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UserDocument = User & Document

@Schema({ timestamps: true })

export class User {
    @Prop({ unique: true, required: true })
    email!: string

    @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
    role!: Types.ObjectId;

    @Prop({ required: true, type: String })
    password!: String

    @Prop({ default: new Date() })
    last_login!: Date

    @Prop({ type: String })
    login_ip!: string

    @Prop({ required: true, default: true })
    account_stats!: boolean
}

export const UserSchema = SchemaFactory.createForClass(User);