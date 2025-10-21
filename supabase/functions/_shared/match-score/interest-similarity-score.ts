import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Interest {
  id: number;
  name: string;
  embedding: number[];
}

/**
 * Something we could do is filter to ensure that there is at least one strongly shared interests,
 * and then calculate the average similarity across all interests.
 */

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Calculate similarity score between two lists of interest IDs
 * @param candidateInterests - Array of interest IDs for the candidate
 * @param employerInterests - Array of interest IDs for the employer
 * @param supabase - Supabase client instance
 * @returns A similarity score between 0 and 1
 */
export async function calculateInterestSimilarityScore(
  candidateInterests: string[],
  employerInterests: string[],
  supabase: ReturnType<typeof createClient>
): Promise<number> {
  // Handle edge cases
  if (candidateInterests.length === 0 || employerInterests.length === 0) {
    return 0;
  }

  // Fetch embeddings for candidate interests
  const { data: candidateData, error: candidateError } = await supabase
    .from('interests')
    .select('id, name, embedding')
    .in('id', candidateInterests);

  if (candidateError) {
    console.error('Error fetching candidate interests:', candidateError);
    throw new Error(`Failed to fetch candidate interests: ${candidateError.message}`);
  }

  // Fetch embeddings for employer interests
  const { data: employerData, error: employerError } = await supabase
    .from('interests')
    .select('id, name, embedding')
    .in('id', employerInterests);

  if (employerError) {
    console.error('Error fetching employer interests:', employerError);
    throw new Error(`Failed to fetch employer interests: ${employerError.message}`);
  }

  const candidateInterestsData = (candidateData ?? []) as Interest[];
  const employerInterestsData = (employerData ?? []) as Interest[];

  // Validate that we got embeddings
  if (candidateInterestsData.length === 0 || employerInterestsData.length === 0) {
    return 0;
  }

  // Calculate all pairwise similarities
  const similarities: number[] = [];

  for (const candidateInterest of candidateInterestsData) {
    if (!candidateInterest.embedding || candidateInterest.embedding.length === 0) {
      console.warn(`Interest ${candidateInterest.id} (${candidateInterest.name}) has no embedding`);
      continue;
    }

    for (const employerInterest of employerInterestsData) {
      if (!employerInterest.embedding || employerInterest.embedding.length === 0) {
        console.warn(`Interest ${employerInterest.id} (${employerInterest.name}) has no embedding`);
        continue;
      }

      const similarity = cosineSimilarity(
        candidateInterest.embedding,
        employerInterest.embedding
      );
      similarities.push(similarity);
    }
  }

  if (similarities.length === 0) {
    return 0;
  }

  // Calculate average similarity as the final score
  const averageSimilarity = similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;

  // Normalize to 0-1 range (cosine similarity is already -1 to 1, but typically 0-1 for similar items)
  // Convert to 0-100 scale for easier interpretation
  return Math.max(0, Math.min(1, averageSimilarity));
}

/**
 * Alternative scoring method: Maximum similarity (best match approach)
 * Returns the highest similarity score found between any candidate-employer pair
 */
export async function calculateMaxInterestSimilarityScore(
  candidateInterests: number[],
  employerInterests: number[],
  supabase: ReturnType<typeof createClient>
): Promise<number> {
  if (candidateInterests.length === 0 || employerInterests.length === 0) {
    return 0;
  }

  const { data: candidateData, error: candidateError } = await supabase
    .from('interests')
    .select('id, name, embedding')
    .in('id', candidateInterests);

  if (candidateError) {
    console.error('Error fetching candidate interests:', candidateError);
    throw new Error(`Failed to fetch candidate interests: ${candidateError.message}`);
  }

  const { data: employerData, error: employerError } = await supabase
    .from('interests')
    .select('id, name, embedding')
    .in('id', employerInterests);

  if (employerError) {
    console.error('Error fetching employer interests:', employerError);
    throw new Error(`Failed to fetch employer interests: ${employerError.message}`);
  }

  const candidateInterestsData = (candidateData ?? []) as Interest[];
  const employerInterestsData = (employerData ?? []) as Interest[];

  if (candidateInterestsData.length === 0 || employerInterestsData.length === 0) {
    return 0;
  }

  let maxSimilarity = 0;

  for (const candidateInterest of candidateInterestsData) {
    if (!candidateInterest.embedding || candidateInterest.embedding.length === 0) {
      continue;
    }

    for (const employerInterest of employerInterestsData) {
      if (!employerInterest.embedding || employerInterest.embedding.length === 0) {
        continue;
      }

      const similarity = cosineSimilarity(
        candidateInterest.embedding,
        employerInterest.embedding
      );
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
  }

  return Math.max(0, Math.min(1, maxSimilarity));
}
