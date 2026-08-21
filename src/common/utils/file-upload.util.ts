import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';


export const ProductImageUploadOptions = {
    storage: diskStorage({
        destination: './uploads/product',
        filename: (req, file, callback) => {
            const uniqueSuffix =
                Date.now() + '-' + Math.round(Math.random() * 1e9);
            const fileExt = extname(file.originalname);

            callback(null, `${uniqueSuffix}${fileExt}`);
        },
    }),

    fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
            return callback(
                new BadRequestException(
                    'Only image files are allowed (jpg, jpeg, png, webp)',
                ),
                false,
            );
        }

        callback(null, true);
    },

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10,
    },
};

export const CategoryImageUploadOptions = {

    storage: diskStorage({
        destination: './uploads/category',

        filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const fileExt = extname(file.originalname);
            callback(null, `${uniqueSuffix}${fileExt}`);
        },
    }),

    fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
            return callback(new BadRequestException('Only image files are allowed (jpg, jpeg, png, webp)'), false);
        }
        callback(null, true);
    },

    limits: {
        fileSize: 5 * 1024 * 1024,
    },
};


export const profileImageUploadOptions = {

    storage: diskStorage({
        destination: './uploads/profile',

        filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const fileExt = extname(file.originalname);
            callback(null, `${uniqueSuffix}${fileExt}`);
        },
    }),

    fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
            return callback(new BadRequestException('Only image files are allowed (jpg, jpeg, png, webp)'), false);
        }
        callback(null, true);
    },

    limits: {
        fileSize: 5 * 1024 * 1024,
    },
};

export const systemFileUploadOptions = {
    storage: diskStorage({
        destination: './uploads/system-files',

        filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const fileExt = extname(file.originalname);
            callback(null, `${uniqueSuffix}${fileExt}`);
        },
    }),

    fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
            return callback(
                new BadRequestException('Only PDF files are allowed'),
                false,
            );
        }

        callback(null, true);
    },

    limits: {
        fileSize: 20 * 1024 * 1024,
    },
};

export const userResourceUploadOptions = {
    storage: diskStorage({
        destination: './uploads/resource',

        filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const fileExt = extname(file.originalname);
            callback(null, `${uniqueSuffix}${fileExt}`);
        },
    }),

    fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
            return callback(
                new BadRequestException('Only PDF files are allowed'),
                false,
            );
        }

        callback(null, true);
    },

    limits: {
        fileSize: 20 * 1024 * 1024,
    },
};