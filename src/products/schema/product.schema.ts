import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
    @Prop({ required: true, type: String })
    product!: String;

    @Prop({ required: true, type: String })
    description!: String;

    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    category!: Types.ObjectId;

    @Prop({ type: [String] })
    sub_category!: String[];

    @Prop({ required: true, type: [String] })
    product_imgs!: String[];

    @Prop({ required: true, type: Number })
    price!: Number;

    @Prop({ type: Number, default: 0 })
    discount!: Number;

    @Prop({ required: true, type: Number })
    stock!: Number;

    @Prop({ required: true, type: [String] })
    tags!: String[];

    @Prop({ required: true, type: Boolean, default: true })
    product_status!: Boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);