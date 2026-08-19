import { Injectable } from "@nestjs/common";


@Injectable()
export class VectorService {

    cosineSimilarity(
        a: number[],
        b: number[],
    ): number {

        let dot = 0;
        let magA = 0;
        let magB = 0;


        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            magA += a[i] * a[i];
            magB += b[i] * b[i];
        }

        return dot /
            (
                Math.sqrt(magA) *
                Math.sqrt(magB)
            );
    }

    search(
        questionEmbedding: number[],
        chunks: any[],
        limit: number = 5,
    ) {

        const results = chunks.map((chunk) => {

            const score = this.cosineSimilarity(
                questionEmbedding,
                chunk.embedding
            );

            return {
                _id: chunk._id,
                fileId: chunk.fileId,
                chunkIndex: chunk.chunkIndex,
                text: chunk.text,
                score: score
            };

        });


        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

}