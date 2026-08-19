import { Injectable } from "@nestjs/common";
import * as fs from 'fs';
import * as path from 'path';
import { pdfToText } from 'pdf-ts';

@Injectable()
export class RagAIService {
    // async extractText(fileName: string): Promise<string> {
    //     const filePath = path.join(process.cwd(), 'uploads', fileName);
    //     const buffer = fs.readFileSync(filePath);

    //     const text = await pdfToText(buffer);
    //     return text;
    // }

    async extractText(filePath: string): Promise<string> {
        const buffer = fs.readFileSync(filePath);

        const text = await pdfToText(buffer);
        return text;
    }

    splitIntoChunks(
        text: string,
        maxLength = 800,
    ): string[] {

        const cleanedText = text
            .replace(/\s+/g, " ")
            .trim();

        const sentences = cleanedText.split(/(?<=\.)\s+/);

        const chunks: string[] = [];
        let currentChunk = "";

        for (const sentence of sentences) {
            if (
                currentChunk.length + sentence.length <= maxLength
            ) {
                currentChunk += sentence + " ";

            } else {
                if (currentChunk.trim()) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = sentence + " ";
            }
        }


        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        return chunks;
    }

    // async processPdf(filename: string) {

    //     const text = await this.extractText(filename);
    //     const chunks = this.splitIntoChunks(text);

    //     return {
    //         totalCharacters: text.length,
    //         totalChunks: chunks.length,
    //         chunks,
    //     };
    // }

    async processPdf(filePath: string) {
        const text = await this.extractText(filePath);
        const chunks = this.splitIntoChunks(text);

        return {
            totalCharacters: text.length,
            totalChunks: chunks.length,
            chunks,
        };
    }
}
