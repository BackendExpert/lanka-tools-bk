import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type DocumentChunkDocument = DocumentChunk & Document;

@Schema({ timestamps: true })
export class DocumentChunk {

    @Prop({
        type: Types.ObjectId,
        ref: "SystemFiles",
        required: true,
    })
    fileId!: Types.ObjectId;


    @Prop({
        required: true,
    })
    chunkIndex!: number;


    @Prop({
        required: true,
    })
    text!: string;


    @Prop({
        type: [Number],
        default: [],
    })
    embedding!: number[];
}


export const DocumentChunkSchema = SchemaFactory.createForClass(DocumentChunk);