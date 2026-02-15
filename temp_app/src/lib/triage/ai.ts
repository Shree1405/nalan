import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
let client: OpenAI | null = null;
if (apiKey) {
    client = new OpenAI({ apiKey });
}

export async function performAdvancedAssessment(payload: { symptoms: string; patient?: any }) {
    if (!client) {
        return {
            error: 'OPENAI_API_KEY not configured. Add OPENAI_API_KEY to .env to enable advanced assessment.',
            result: null,
        };
    }

    const prompt = `You are a medical triage assistant. 
  If the symptoms indicate high risk or complex conditions, provide a detailed analysis.
  
  JSON Response Format:
  {
    "risk": "low" | "moderate" | "high",
    "symptom_analysis": [
      { "symptom": "Symptom Name", "risk": "Low"|"Moderate"|"High", "severity": 1-10, "priority": "Low"|"Medium"|"High" }
    ],
    "disease_probability": { "name": "Condition Name", "probability": "Percentage (e.g. 85%)", "description": "Detailed description of the condition and why it matches." },
    "possible_conditions": [ { "name": "Other Condition", "confidence": "Low"|"Moderate"|"High" } ],
    "guidance": { 
      "dos": ["..."], 
      "donts": ["..."], 
      "remedies": ["Home remedy 1", "Home remedy 2"] 
    },
    "urgency": "string",
    "notes": "string"
  }

  Input symptoms: ${payload.symptoms}
  Patient data: ${JSON.stringify(payload.patient || {})}
  `;

    try {
        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 800,
            response_format: { type: 'json_object' }
        });

        const text = response.choices?.[0]?.message?.content || '{}';
        const parsed = JSON.parse(text);

        return { error: null, result: parsed };
    } catch (apiError: any) {
        console.error('OpenAI API Error:', apiError);
        return {
            error: `OpenAI API Error: ${apiError.message || 'Unknown error'}`,
            result: null,
        };
    }
}
