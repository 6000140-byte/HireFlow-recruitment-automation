import { Candidate, ScoringCriterion, CandidateCriterionScore, RecommendationType } from "@/types/candidate";

export function getRecommendationForScore(score: number): RecommendationType {
  if (score >= 80) return "Strongly Recommended";
  if (score >= 65) return "Recommended";
  if (score >= 50) return "Review Required";
  return "Not Recommended";
}

export function calculateCandidateScore(
  criteria: ScoringCriterion[],
  scores: CandidateCriterionScore[]
): {
  totalScore: number;
  recommendation: RecommendationType;
  breakdown: { criterionId: string; name: string; score: number; maxScore: number; weight: number; weightedScore: number }[];
} {
  const enabledCriteria = criteria.filter((c) => c.enabled);
  if (enabledCriteria.length === 0) {
    return {
      totalScore: 0,
      recommendation: "Not Recommended",
      breakdown: [],
    };
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;

  const breakdown = enabledCriteria.map((criterion) => {
    const candidateScore = scores.find((s) => s.criterion_id === criterion.id);
    const rawScore = candidateScore ? candidateScore.score : 0;
    const maxScore = criterion.maximum_score || 100;
    const normalizedScore = Math.min(Math.max((rawScore / maxScore) * 100, 0), 100);
    const weightedContribution = (normalizedScore * criterion.weight) / 100;

    totalWeightedScore += weightedContribution;
    totalWeight += criterion.weight;

    return {
      criterionId: criterion.id,
      name: criterion.name,
      score: rawScore,
      maxScore: maxScore,
      weight: criterion.weight,
      weightedScore: Math.round(weightedContribution * 10) / 10,
    };
  });

  // Normalize if total weights do not add up to 100 exactly
  const finalScore = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0;
  const clampedScore = Math.min(Math.max(finalScore, 0), 100);

  return {
    totalScore: clampedScore,
    recommendation: getRecommendationForScore(clampedScore),
    breakdown,
  };
}

/**
 * Heuristic auto-scorer for newly imported candidate applications
 */
export function autoEvaluateCandidate(
  candidate: Partial<Candidate>,
  criteria: ScoringCriterion[]
): {
  totalScore: number;
  recommendation: RecommendationType;
  criterionScores: { criterion_id: string; score: number; explanation: string }[];
} {
  const scores: { criterion_id: string; score: number; explanation: string }[] = [];

  for (const crit of criteria) {
    if (!crit.enabled) continue;
    const lowerName = crit.name.toLowerCase();
    let score = 50; // baseline
    let explanation = "Automated heuristic evaluation.";

    if (lowerName.includes("experience")) {
      const exp = candidate.experience || 0;
      if (exp >= 7) {
        score = 95;
        explanation = `High experience: ${exp} years exceeds seniority threshold.`;
      } else if (exp >= 4) {
        score = 85;
        explanation = `Solid experience: ${exp} years matches requirements.`;
      } else if (exp >= 2) {
        score = 70;
        explanation = `Moderate experience: ${exp} years.`;
      } else {
        score = 50;
        explanation = `Entry-level experience: ${exp} years.`;
      }
    } else if (lowerName.includes("education")) {
      const edu = (candidate.education || "").toLowerCase();
      if (edu.includes("phd") || edu.includes("doctorate")) {
        score = 100;
        explanation = "Doctoral degree.";
      } else if (edu.includes("master") || edu.includes("m.tech") || edu.includes("ms") || edu.includes("mba")) {
        score = 90;
        explanation = "Master's degree.";
      } else if (edu.includes("bachelor") || edu.includes("b.tech") || edu.includes("bs") || edu.includes("b.e")) {
        score = 80;
        explanation = "Bachelor's degree.";
      } else {
        score = 65;
        explanation = `Education background: ${candidate.education || "Undergraduate"}`;
      }
    } else if (lowerName.includes("skill") || lowerName.includes("technical")) {
      const skillsCount = candidate.skills?.length || 0;
      if (skillsCount >= 6) {
        score = 92;
        explanation = `Diverse skillset: ${skillsCount} verified technical competencies.`;
      } else if (skillsCount >= 3) {
        score = 80;
        explanation = `Good skillset: ${skillsCount} matching skills.`;
      } else {
        score = 60;
        explanation = `Found ${skillsCount} relevant skill keywords.`;
      }
    } else if (lowerName.includes("interview")) {
      score = 75;
      explanation = "Initial technical screen pending or baseline assigned.";
    } else if (lowerName.includes("availability")) {
      const avail = (candidate.availability || "").toLowerCase();
      if (avail.includes("immediate") || avail.includes("15") || avail.includes("1 week")) {
        score = 95;
        explanation = `Available immediately: ${candidate.availability}`;
      } else if (avail.includes("1 month") || avail.includes("30 days")) {
        score = 80;
        explanation = "Standard notice period (30 days).";
      } else {
        score = 70;
        explanation = `Notice period: ${candidate.availability || "Standard notice"}`;
      }
    } else {
      score = 75;
      explanation = "Standard evaluated assessment.";
    }

    scores.push({
      criterion_id: crit.id,
      score: score,
      explanation: explanation,
    });
  }

  const dummyCandidateScores: CandidateCriterionScore[] = scores.map((s) => ({
    id: `temp_${s.criterion_id}`,
    candidate_id: candidate.id || "temp",
    criterion_id: s.criterion_id,
    score: s.score,
    explanation: s.explanation,
    scored_by: "system",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { totalScore, recommendation } = calculateCandidateScore(criteria, dummyCandidateScores);

  return {
    totalScore,
    recommendation,
    criterionScores: scores,
  };
}
