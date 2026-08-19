import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type BackupCodesDocument = BackupCodes & Document;

@Schema({ timestamps: true })
export class BackupCodes {

    @Prop({
        type: Types.ObjectId,
        ref: "User",
        required: true,
    })
    user!: Types.ObjectId;

    @Prop({
        type: [String],
        required: true,
    })
    backup_codes!: string[];
}

export const BackupCodesSchema = SchemaFactory.createForClass(BackupCodes);