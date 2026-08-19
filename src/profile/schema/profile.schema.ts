import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ProfileDocument = Profile & Document;

@Schema({ _id: false })
export class Address {

    @Prop()
    address_line_1?: string;

    @Prop()
    address_line_2?: string;

    @Prop()
    city?: string;

    @Prop()
    state?: string;

    @Prop()
    postal_code?: string;

    @Prop()
    country?: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ timestamps: true })
export class Profile {

    @Prop({
        type: Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
    })
    user!: Types.ObjectId;

    @Prop({ trim: true })
    first_name?: string;

    @Prop({ trim: true })
    last_name?: string;

    @Prop({ trim: true })
    mobile?: string;

    @Prop({ type: AddressSchema })
    address?: Address;

    @Prop({ type: AddressSchema })
    billing_address?: Address;

    @Prop()
    dob?: Date;

    @Prop()
    profile_img?: string;

    @Prop()
    bio?: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);