import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type BranchDocument = Branch & Document;

@Schema({ timestamps: true })
export class Branch {
    @Prop({
        type: Types.ObjectId,
        ref: "User",
        required: true
    })
    branch_admin!: Types.ObjectId;

    @Prop({
        required: true,
        trim: true
    })
    branch_name!: string;

    @Prop({
        required: true,
        trim: true
    })
    branch_address!: string;

    @Prop({
        required: true,
        trim: true
    })
    branch_google_location!: string;

    @Prop({
        type: [{ type: Types.ObjectId, ref: "User" }],
        default: []
    })
    staff_members!: Types.ObjectId[];
}

export const BranchSchema = SchemaFactory.createForClass(Branch);