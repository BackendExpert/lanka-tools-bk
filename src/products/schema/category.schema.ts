import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
    @Prop({
        required: true,
        unique: true,
        type: String,
        trim: true,
    })
    category!: string;

    @Prop({
        required: true,
        type: String,
        trim: true,
    })
    category_img!: string;

    @Prop({
        required: true,
        type: String,
        trim: true,
    })
    category_desc!: string;

    @Prop({
        type: [String],
    })
    sub_category!: string[];

    @Prop({
        required: true,
        default: true,
        type: Boolean,
    })
    category_stats!: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);