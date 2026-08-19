import * as crypto from 'crypto';

export class SignatureService {

    private secret = "energy-secret-key";

    createBodyHash(body: any) {

        const json = JSON.stringify(body);

        const hash = crypto
            .createHash('sha256')
            .update(json)
            .digest();

        return hash.toString('base64');
    }

    createSignature(canonical: string) {

        return crypto
            .createHmac('sha256', this.secret)
            .update(canonical)
            .digest('base64');

    }

}