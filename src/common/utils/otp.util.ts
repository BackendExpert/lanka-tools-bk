import crypto from "crypto";

export const generateOTP = (length: number = 8): string => {
    let otp = "";

    while (otp.length < length) {
        otp += crypto
            .randomBytes(length)
            .toString("base64")
            .replace(/[^a-zA-Z0-9]/g, "");
    }

    return otp.slice(0, length);
};