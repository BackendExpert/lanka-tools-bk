import { Model, Types } from "mongoose";
import { NotificationDocument } from "src/profile/schema/notification.schema";

export const CreateNotification = async (
    notificationModel: Model<NotificationDocument>,
    user: string | Types.ObjectId,
    title: string,
    description: string,
    type: "System" | "Notice" | "Separate"
) => {
    return await notificationModel.create({
        user,
        title,
        description,
        type,
        status: "Unread",
    });
};

export const ReadNotification = async (
    notificationModel: Model<NotificationDocument>,
    id: string | Types.ObjectId
) => {
    return await notificationModel.findByIdAndUpdate(
        id,
        {
            $set: {
                status: "Read",
            },
        },
        {
            new: true,
        }
    );
};