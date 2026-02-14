import { z } from 'zod';
import { insertPatientSchema, patients, assessments } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  triage: {
    assess: {
      method: 'POST' as const,
      path: '/api/triage/assess' as const,
      input: insertPatientSchema,
      responses: {
        201: z.object({
          patientId: z.number(),
          riskLevel: z.string(),
          confidenceScore: z.number(),
          recommendedDepartment: z.string(),
          explanation: z.array(z.string())
        }),
        400: errorSchemas.validation,
      },
    },
    emergency: {
      method: 'POST' as const,
      path: '/api/triage/emergency' as const,
      input: z.object({}), // Empty body for simple override, or could take patient ID if existing
      responses: {
        201: z.object({
          message: z.string(),
          department: z.string()
        })
      }
    }
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats' as const,
      responses: {
        200: z.object({
          totalPatients: z.number(),
          riskDistribution: z.array(z.object({ risk: z.string(), count: z.number() })),
          avgConfidence: z.number(),
          recentAssessments: z.array(z.any()) // Complex joined type, using any for schema simplicity
        })
      }
    }
  },
  patients: {
    list: {
      method: 'GET' as const,
      path: '/api/patients' as const,
      responses: {
        200: z.array(z.custom<typeof patients.$inferSelect>())
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
