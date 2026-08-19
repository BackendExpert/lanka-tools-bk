import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Role, RoleDocument } from "./schema/role.schema";
import { Model } from "mongoose";

@Injectable()
export class RoleService {
    constructor(
        @InjectModel(Role.name)
        private roleModel: Model<RoleDocument>,
    ) { }

    async GetPermissions(roleName: string): Promise<string[]> {
        const roleDoc = await this.roleModel.findOne({ role: roleName });
        return roleDoc?.permissions || [];
    }
}