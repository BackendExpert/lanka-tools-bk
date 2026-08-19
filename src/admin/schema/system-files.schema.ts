import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type SystemFilesDocument = SystemFiles & Document;

@Schema({ timestamps: true })
export class SystemFiles {
    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    uploader!: Types.ObjectId;

    @Prop({ required: true })
    original_name!: string;

    @Prop({ required: true, unique: true })
    filename!: string;

    @Prop({ required: true })
    mime_type!: string;

    @Prop({ required: true })
    size!: number;

    @Prop({ required: true })
    path!: string;
}

export const SystemFilesSchema = SchemaFactory.createForClass(SystemFiles);