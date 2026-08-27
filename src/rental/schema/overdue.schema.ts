import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type OverdueDocument = Overdue & Document;

@Schema({ timestamps: true })
export class Overdue {
    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    user!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Product", required: true })
    product!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Rental", required: true })
    rentel!: Types.ObjectId;

    @Prop({ type: Number, required: true, min: 0 })
    override_cost!: number;
    
    @Prop({ type: Boolean, required: true, default: false })
    is_pay_overdue!: boolean
}

export const OverdueSchema = SchemaFactory.createForClass(Overdue);