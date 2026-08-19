import { Model, Types } from "mongoose";
import { AuditLog, AuditLogDocument } from "../../auditlogs/schema/auditlog.schema";

interface AuditLogParams {
    user?: Types.ObjectId | string;
    action: string;
    description: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
}

export async function createAuditLog(
    auditLogModel: Model<AuditLogDocument>,
    params: AuditLogParams
): Promise<void> {
    try {
        await auditLogModel.create({
            user: params.user,
            action: params.action,
            description: params.description,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            metadata: params.metadata || {},
        });
    } catch (error) {
        console.error("Audit log error:", error);
    }
}