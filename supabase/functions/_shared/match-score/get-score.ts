import { createClient } from "@supabase/supabase-js";
import { JobPostingDTO } from "./DTO";
import { calculateInterestSimilarityScore, cosineSimilarity } from "./interest-similarity-score";

interface Specialty {
    embedding: number[];
}

export async function getScore(
    candidateData: JobPostingDTO,
    employerData: JobPostingDTO,
    supabase: ReturnType<typeof createClient>
): Promise<number> {
    let score: number = 0;

    // Work Type Matching
    const workTypeDifference: number = Math.abs(candidateData.workType.valueOf() - employerData.workType.valueOf());
    score += (2 - workTypeDifference) / 2;

    // Employment Type Matching
    const employmentTypeDifference: number = Math.abs(candidateData.employmentType.valueOf() - employerData.employmentType.valueOf());
    score += (2 - employmentTypeDifference) / 2;

    // Experience Matching
    const experienceDifference: number = employerData.experience - Math.abs(candidateData.experience - employerData.experience);
    score += experienceDifference / employerData.experience;

    score += await calculateInterestSimilarityScore(candidateData.interestIds, employerData.interestIds, supabase);

    // Specialty Similarity
    const { data: candidateSpecialties } = await supabase
        .from('specialties')
        .select('embedding')
        .eq('id', candidateData.specialtyId);

    const { data: employerSpecialties } = await supabase
        .from('specialties')
        .select('embedding')
        .eq('id', employerData.specialtyId);

    if (candidateSpecialties && employerSpecialties) {
        const candidateEmbeddings: number[][] = (candidateSpecialties as Specialty[]).map(s => s.embedding);
        const employerEmbeddings: number[][] = (employerSpecialties as Specialty[]).map(s => s.embedding);
        
        if (candidateEmbeddings.length > 0 && employerEmbeddings.length > 0) {
            const avgCandidateEmbedding: number[] = candidateEmbeddings.reduce((acc: number[], curr: number[]) => 
                acc.map((val: number, i: number) => val + curr[i])
            ).map((val: number) => val / candidateEmbeddings.length);
            
            const avgEmployerEmbedding: number[] = employerEmbeddings.reduce((acc: number[], curr: number[]) => 
                acc.map((val: number, i: number) => val + curr[i])
            ).map((val: number) => val / employerEmbeddings.length);
            
            score += cosineSimilarity(avgCandidateEmbedding, avgEmployerEmbedding);
        }
    }

    score = score / 5; // Normalize to [0,1] range
    return score;
}