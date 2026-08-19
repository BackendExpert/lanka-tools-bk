import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type NotificationDocument = Notification & Document

@Schema({ timestamps: true })

export class Notification {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user!: Types.ObjectId;

    @Prop({ required: true })
    title!: string;

    @Prop({ required: true })
    description!: string;

    @Prop({ required: true, enum: ['Read', 'Unread'], default: 'Unread'})
    status!: string;

    @Prop({ required: true, enum: ['System', 'Notice', 'Separate'], default: 'System'})
    type!: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);