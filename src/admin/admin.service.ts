import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuditLog, AuditLogDocument } from "src/auditlogs/schema/auditlog.schema";
import { createAuditLog } from "src/common/utils/auditlogs.util";
import { EmailService } from "src/common/utils/email.util";
import { getLocationFromIP } from "src/common/utils/location";
import { verifyToken } from "src/common/utils/verify-token";
import { Profile, ProfileDocument } from "src/profile/schema/profile.schema";
import { Role, RoleDocument } from "src/role/schema/role.schema";
import { User, UserDocument } from "src/user/schema/user.schema";
import { generateOTP } from "src/common/utils/otp.util";
import bcrypt from 'bcrypt'
import { CreatePlatfromUserDTO } from "./dto/create-platfrom-user.dto";
import { CreateNotification } from "src/common/utils/notification.util";
import { Notification, NotificationDocument } from "src/profile/schema/notification.schema";
import { SystemFiles, SystemFilesDocument } from "./schema/system-files.schema";
import { DocumentChunk, DocumentChunkDocument } from "./schema/chunk.schema";
import { RagAIService } from "src/ragAi/ragai.service";
import { OllamaService } from "src/ragAi/ollama.service";
import * as fs from "fs";
import * as path from "path";
import { Branch, BranchDocument } from "./schema/branch.schema";
import { CreateBranchDto } from "./dto/create-branch.dto";

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        @InjectModel(Role.name)
        private roleModel: Model<RoleDocument>,

        @InjectModel(AuditLog.name)
        private auditlogModel: Model<AuditLogDocument>,

        @InjectModel(Profile.name)
        private profileModel: Model<ProfileDocument>,

        @InjectModel(Notification.name)
        private notificationModel: Model<NotificationDocument>,

        @InjectModel(SystemFiles.name)
        private systemfilesModel: Model<SystemFilesDocument>,

        @InjectModel(DocumentChunk.name)
        private documentchunkModel: Model<DocumentChunkDocument>,

        @InjectModel(Branch.name)
        private branchModel: Model<BranchDocument>,

        private readonly ragaiService: RagAIService,
        private readonly ollamaService: OllamaService,

        private readonly emailService: EmailService,
        private readonly jwtService: JwtService
    ) { }

    async FetchallUsers(
        token: string
    ) {

        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const users = await this.userModel.find().populate('role')

        return {
            success: true,
            message: "All Users Fetched Success",
            result: users
        }
    }

    async FetchUserByID(
        token: string,
        id: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const tragetuser = await this.userModel.findById(id).populate('role')

        if (!tragetuser) {
            throw new NotFoundException("Target User Not found")
        }

        const getprofile = await this.profileModel.findOne({ user: tragetuser._id })

        if (!getprofile) {
            throw new NotFoundException("Profile Cannot be found")
        }

        return {
            success: true,
            message: "Target User Fetched",
            result: { tragetuser, getprofile }
        }
    }

    async UpdateUserState(
        token: string,
        id: string,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const location = getLocationFromIP(ipAddress || "");

        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const tragetuser = await this.userModel.findById(id).populate('role')

        if (!tragetuser) {
            throw new NotFoundException("Target User Not found")
        }

        const updateuser = await this.userModel.findByIdAndUpdate(
            id,
            {
                account_stats: !tragetuser.account_stats
            },
            { new: true }
        )

        if (!updateuser) {
            throw new ConflictException("Uknown Error")
        }

        await CreateNotification(
            this.notificationModel,
            tragetuser._id,
            "Account Activated Success",
            "Your Student Account Has been Activated Now...",
            "Separate"
        )

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "UPDATE_USER_STATUS",
            description: `${user.email} Update the ${tragetuser.email} user's user Account Status`,
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                location,
            },
        });

        return {
            success: true,
            message: "Update Account Status Success"
        }
    }


    async CreateBranch(
        token: string,
        dto: CreateBranchDto,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const location = getLocationFromIP(ipAddress || "");

        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const bracnh = await this.branchModel.findOne({ branch_name: dto.branch_name })

        if (bracnh) {
            throw new ConflictException("Branch Already Created")
        }

        const badmin = await this.userModel.findOne({ email: dto.admin_email })

        if (badmin) {
            throw new ConflictException("User Already Created")
        }

        const badmin_role = await this.roleModel.findOne({ role: 'branch_admin' })

        if (!badmin_role) {
            throw new NotFoundException("Branch Admin Cannot found")
        }

        const temp_pass = generateOTP(8);
        const hashtemppass = await bcrypt.hash(temp_pass, 10)

        const create_branch_admin = await this.userModel.create({
            email: dto.admin_email,
            password: hashtemppass,
            role: badmin_role._id,
            account_stats: true
        })

        const createprofile = await this.profileModel.create({
            user: create_branch_admin._id,
            first_name: dto.admin_first_name,
            last_name: dto.admin_last_name
        })

        const create_branch = await this.branchModel.create({
            branch_admin: create_branch_admin._id,
            branch_name: dto.branch_name,
            branch_address: dto.branch_address,
            branch_google_location: dto.branch_google_location,
            staff_members: []
        });

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "BRANCH_CREATED",
            description: `${user.email} Create Branch - ${dto.branch_name} and Branch Admin - ${dto.admin_email} `,
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                location,
            },
        });

        await this.emailService.AccountCreateEmail(
            dto.admin_email,
            temp_pass,
            ipAddress,
            userAgent,
        )

        return {
            success: true,
            message: "Branch and Branch Admin Created"
        }
    }

    async FetchAllBranches(
        token: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const branches = await this.branchModel.find().populate('branch_admin').populate('staff_members')

        return {
            success: true,
            message: "All branches Fetched Success",
            result: branches
        }
    }

    async AssignStaffToBranch(
        token: string,
        branchId: string,
        staffId: string,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const location = getLocationFromIP(ipAddress || "");

        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const staff = await this.userModel.findById(staffId)

        if (!staff) {
            throw new NotFoundException("Staff Cannot be found")
        }

        const branch = await this.branchModel.findById(branchId)

        if (!branch) {
            throw new NotFoundException("Branch Cannot be found")
        }

        const alreadyAssigned = branch.staff_members?.some(
            (id) => id.toString() === staffId
        )

        if (alreadyAssigned) {
            throw new BadRequestException(
                "Staff is already assigned to this branch"
            )
        }

        await this.branchModel.findByIdAndUpdate(
            branchId,
            {
                $addToSet: {
                    staff_members: staffId
                }
            },
            { new: true }
        )

        await this.emailService.NotificationEmail(
            staff.email,
            `You Assign to ${branch.branch_name} at ${new Date()}`,
            ipAddress,
            userAgent,
        )

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "STAFF_ASSIGN_BRANCH",
            description: `${user.email} Assign staff ${staff.email} to ${branch.branch_name}`,
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                location,
            },
        });

        return {
            success: true,
            message: "Staff Assign to Branch Success"
        }
    }


    async RemoveStaffFromBranch(
        token: string,
        branchId: string,
        staffId: string,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const location = getLocationFromIP(ipAddress || "");

        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const staff = await this.userModel.findById(staffId)

        if (!staff) {
            throw new NotFoundException("Staff Cannot be found")
        }

        const branch = await this.branchModel.findById(branchId)

        if (!branch) {
            throw new NotFoundException("Branch Cannot be found")
        }

        const isAssigned = branch.staff_members?.some(
            (id) => id.toString() === staffId
        )

        if (!isAssigned) {
            throw new BadRequestException(
                "Staff is not assigned to this branch"
            )
        }

        await this.branchModel.findByIdAndUpdate(
            branchId,
            {
                $pull: {
                    staff_members: staffId
                }
            },
            { new: true }
        )

        await this.emailService.NotificationEmail(
            staff.email,
            `You Removed from ${branch.branch_name} at ${new Date()}`,
            ipAddress,
            userAgent,
        )

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "STAFF_REMOVE_BRANCH",
            description: `${user.email} Removed staff ${staff.email} from ${branch.branch_name}`,
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                location,
            },
        });

        return {
            success: true,
            message: "Staff Removed from Branch Success"
        }
    }


    async CreatePlatfromUser(
        token: string,
        dto: CreatePlatfromUserDTO,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const location = getLocationFromIP(ipAddress || "");

        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const tragetuser = await this.userModel.findOne({ email: dto.email })

        if (tragetuser) {
            throw new ConflictException("User Already Registerd in the System")
        }

        const role = await this.roleModel.findOne({ role: dto.role })

        if (!role) {
            throw new NotFoundException("Role Cannot be Found")
        }

        const temp_pass = generateOTP(8);

        const hashtemppass = await bcrypt.hash(temp_pass, 10)

        const createuser = await this.userModel.create({
            email: dto.email,
            role: role._id,
            password: hashtemppass,
        })

        const createprofile = await this.profileModel.create({
            user: createuser._id
        })

        await this.emailService.AccountCreateEmail(
            dto.email,
            temp_pass,
            ipAddress,
            userAgent,
        )

        await createAuditLog(this.auditlogModel, {
            user: user._id,
            action: "ACCOUT_CREATED",
            description: `${user.email} Account Create for ${createuser.email}`,
            ipAddress,
            userAgent,
            metadata: {
                ipAddress,
                userAgent,
                location,
            },
        });

        return {
            success: true,
            message: "Platfrom User Created Success"
        }
    }

    async FetchAllAuditLogs(
        token: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const auditlogs = await this.auditlogModel.find().populate('user')

        return {
            success: true,
            message: "Audit Logs Fetch Success",
            result: auditlogs,
        }
    }

    async FetchAuditlogbyId(
        token: string,
        id: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const auditlog = await this.auditlogModel.findById(id).populate('user')

        if (!auditlog) {
            throw new NotFoundException("Auditlog Cannot be found")
        }

        return {
            success: true,
            message: "Fetch Audit Log Success",
            result: auditlog
        }
    }

    async UploadsystemFiles(
        token: string,
        file: Express.Multer.File,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const location = getLocationFromIP(ipAddress || "");

        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const oldPath = file.path;
        const newPath = path.join(
            path.dirname(oldPath),
            file.originalname,
        );
        fs.renameSync(oldPath, newPath);
        file.filename = file.originalname;
        file.path = newPath;

        const filecheck = await this.systemfilesModel.findOne({
            original_name: file.originalname
        })

        if (filecheck) {
            throw new ConflictException("The File Already Uploaded to System")
        }

        const createFile = await this.systemfilesModel.create({
            uploader: user._id,
            original_name: file.originalname,
            filename: file.filename,
            mime_type: file.mimetype,
            size: file.size,
            path: file.path,
        })
        // const extractTest = await this.ragaiService.processPdf(file.originalname)
        const extractTest = await this.ragaiService.processPdf(file.path);

        for (let i = 0; i < extractTest.chunks.length; i++) {

            const chunkText = extractTest.chunks[i];


            const embedding = await this.ollamaService.createEmbedding(chunkText);

            await this.documentchunkModel.create({
                fileId: createFile._id,
                chunkIndex: i,
                text: chunkText,
                embedding: embedding,
            });
        }
        return {
            success: true,
            message: "File Uploaded Success",
            result: extractTest,
        }
    }

    async FetchChunkswithFiles(
        token: string
    ) {
        const payload = await verifyToken(token, "LOGIN_TOKEN");

        const user = await this.userModel.findOne({
            email: payload.email,
        });

        if (!user) {
            throw new NotFoundException("User Cannot be Found");
        }

        const systemChunks = await this.documentchunkModel.find().populate('fileId')

        return {
            success: true,
            message: "All System Files Fetched Success",
            result: systemChunks
        }
    }


}