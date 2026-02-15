import {
    symptomDictionary,
    lowRiskDiseaseDictionary,
    Symptom
} from './data';
export type { Symptom };

export interface PatientData {
    age?: number;
    medications?: string;
    history?: string;
    additional?: string;
    severity?: number; // 1-10
}

export interface AssessmentResult {
    risk: 'low' | 'moderate' | 'high';
    diseases: Array<{ name: string; likelihood: string; score?: number }>;
    guidance: { dos: string[]; donts: string[]; remedies: string[] };
    confidence: number; // 0-100
}

export interface DiseaseMatch {
    disease: typeof lowRiskDiseaseDictionary[0];
    matchScore: number; // 0..1
    matchedSymptoms: string[];
}

// Simple Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
    for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[str2.length][str1.length];
}

export function extractSymptomsFromText(text: string): string[] {
    if (!text || !text.trim()) return [];

    const lowercaseText = text.toLowerCase();
    const found = new Set<string>();

    symptomDictionary.forEach(s => {
        const name = s.name.toLowerCase();
        // Check if symptom name or any synonym is mentioned in the text
        if (lowercaseText.includes(name)) {
            found.add(s.name);
        } else {
            for (const syn of s.synonyms) {
                if (lowercaseText.includes(syn.toLowerCase())) {
                    found.add(s.name);
                    break;
                }
            }
        }
    });

    return Array.from(found);
}

export function searchSymptoms(query: string): Symptom[] {
    if (!query.trim()) return [];
    const lowercaseQuery = query.toLowerCase().trim();
    const results: Symptom[] = [];
    const seen = new Set<string>();

    symptomDictionary.forEach((symptom) => {
        if (seen.has(symptom.name)) return;
        if (symptom.name.toLowerCase().includes(lowercaseQuery) || lowercaseQuery.includes(symptom.name.toLowerCase())) {
            results.push(symptom);
            seen.add(symptom.name);
        }
    });

    symptomDictionary.forEach((symptom) => {
        if (seen.has(symptom.name)) return;
        if (symptom.synonyms.some((synonym) => synonym.toLowerCase().includes(lowercaseQuery) || lowercaseQuery.includes(synonym.toLowerCase()))) {
            results.push(symptom);
            seen.add(symptom.name);
        }
    });

    return results;
}

export function determineRiskLevel(symptoms: string[]): 'low' | 'moderate' | 'high' {
    const riskLevels = symptoms
        .map((s) => symptomDictionary.find((d) => d.name.toLowerCase() === s.toLowerCase()))
        .filter(Boolean)
        .map((s) => s!.riskLevel);

    if (riskLevels.includes('high')) return 'high';
    if (riskLevels.includes('moderate')) return 'moderate';
    return 'low';
}

export function matchDiseasesToSymptoms(userSymptomsList: string[]): DiseaseMatch[] {
    if (!userSymptomsList || userSymptomsList.length === 0) return [];
    const matches: DiseaseMatch[] = [];

    lowRiskDiseaseDictionary.forEach((disease) => {
        let totalScore = 0;
        const matchedSymptoms: string[] = [];

        disease.symptoms.forEach((diseaseSymptom) => {
            const ds = diseaseSymptom.toLowerCase();
            let best = 0;
            userSymptomsList.forEach((u) => {
                const us = u.toLowerCase();
                if (ds === us) best = Math.max(best, 1);
                else if (ds.includes(us) || us.includes(ds)) best = Math.max(best, 0.8);
                else {
                    const dist = levenshteinDistance(us, ds);
                    const maxLen = Math.max(us.length, ds.length);
                    const sim = Math.max(0, 1 - dist / maxLen);
                    if (sim > 0.6) best = Math.max(best, sim);
                }
            });
            if (best > 0) {
                matchedSymptoms.push(diseaseSymptom);
                totalScore += best;
            }
        });

        const score = disease.symptoms.length > 0 ? totalScore / disease.symptoms.length : 0;
        if (score > 0.2 && matchedSymptoms.length > 0) {
            matches.push({ disease, matchScore: Math.min(1, score), matchedSymptoms });
        }
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore);
}

export function localAssess(symptomText: string, patient?: PatientData): AssessmentResult {
    const parsed = extractSymptomsFromText(symptomText || '');
    const riskLevel = determineRiskLevel(parsed);
    const matches = matchDiseasesToSymptoms(parsed);

    const diseases = matches.slice(0, 5).map((m) => ({
        name: m.disease.name,
        likelihood: m.matchScore >= 0.7 ? 'High' : m.matchScore >= 0.4 ? 'Moderate' : 'Low',
        score: Math.round(m.matchScore * 100),
    }));

    const first = matches[0];
    const guidance = first
        ? { dos: first.disease.dos || [], donts: first.disease.donts || [], remedies: (first.disease as any).remedies || [] }
        : {
            dos: ['Stay hydrated', 'Rest', 'Monitor symptoms'],
            donts: ['Avoid self-medication with antibiotics', 'Avoid strenuous activity'],
            remedies: [],
        };

    const base = 50;
    const matchBoost = matches.length > 0 ? Math.min(30, Math.round(matches[0].matchScore * 30)) : 0;
    const confidence = Math.min(99, base + matchBoost + (riskLevel === 'high' ? -10 : 0));

    return {
        risk: riskLevel,
        diseases: diseases.length > 0 ? diseases : [{ name: 'Unclear - no strong local match', likelihood: 'Low' }],
        guidance,
        confidence,
    };
}
