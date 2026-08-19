import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user!: Types.ObjectId;

    @Prop({ required: true })
    action!: string;

    @Prop({ required: true })
    description!: string;

    @Prop()
    ipAddress!: string;

    @Prop()
    userAgent!: string;

    @Prop({ type: Object })
    metadata!: {
        ipAddress?: string;
        userAgent?: string;
        [key: string]: any;
    };
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);