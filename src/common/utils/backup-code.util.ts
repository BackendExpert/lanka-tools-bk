import { randomBytes } from "crypto";
import * as bcrypt from "bcrypt";

export async function generateBackupCodes() {
    const plainCodes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < 10; i++) {
        const code = randomBytes(4).toString("hex").toUpperCase();

        plainCodes.push(code);
        hashedCodes.push(await bcrypt.hash(code, 10));
    }

    return {
        plainCodes,
        hashedCodes,
    };
}