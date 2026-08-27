import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductCommentsDocument = ProductComments & Document;

@Schema({ timestamps: true })
export class ProductComments {
    @Prop({
        type: Types.ObjectId,
        ref: 'Product',
        required: true,
    })
    product!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    })
    user!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'ProductComments',
        default: null,
    })
    parent_comment!: Types.ObjectId | null;

    @Prop({
        type: String,
        required: true,
    })
    comment!: string;
}

export const ProductCommentsSchema = SchemaFactory.createForClass(ProductComments);