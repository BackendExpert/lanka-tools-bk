import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type RentalDocument = Rental & Document;

@Schema({ timestamps: true })
export class Rental {
    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    user!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Product", required: true })
    product!: Types.ObjectId;

    @Prop({ type: Number, required: true, min: 0 })
    hourlyPrice!: number;

    @Prop({ type: Number, required: true, min: 0 })
    dailyPrice!: number;

    @Prop({ type: Number, required: true, min: 0 })
    weeklyPrice!: number;

    @Prop({ type: Date, required: true })
    startDateTime!: Date;

    @Prop({ type: Date, required: true })
    endDateTime!: Date;

    @Prop({ type: Number, required: true, min: 0 })
    totalHours!: number;

    @Prop({ type: Number, required: true, min: 0 })
    totalDays!: number;

    @Prop({ type: Number, required: true, min: 0 })
    totalWeeks!: number;

    @Prop({ type: Number, required: true, min: 0 })
    subtotal!: number;

    @Prop({ type: Number, required: true, min: 0 })
    vatRate!: number;

    @Prop({ type: Number, required: true, min: 0 })
    vatAmount!: number;

    @Prop({ type: Number, required: true, min: 0 })
    totalAmount!: number;

    @Prop({ type: Boolean, required: true, default: false })
    is_returned!: boolean
}

export const RentalSchema = SchemaFactory.createForClass(Rental);