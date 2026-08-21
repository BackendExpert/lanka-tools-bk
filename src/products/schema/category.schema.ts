import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
    @Prop({ required: true, type: String })
    category!: String;

    @Prop({ required: true, type: String })
    category_img!: String;

    @Prop({ required: true, type: String })
    category_desc!: String;

    @Prop({ type: [String] })
    sub_category!: String[];

    @Prop({ required: true, type: Boolean, default: true })
    category_stats!: Boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);