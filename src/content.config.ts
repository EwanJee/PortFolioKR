import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const evidenceId = z.string().regex(/^E-[a-z0-9-]+$/);
const metric = z.object({ label: z.string(), value: z.string(), evidence: evidenceId });

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        summary: z.string(),
        team: z.enum(['global', 'retention', 'purchase']),
        period: z.string(),
        role: z.string(),
        status: z.enum(['done', 'in-progress', 'proposed']),
        stack: z.array(z.string()),
        metrics: z.array(metric).default([]),
        facts: z.array(z.string()).default([]),
        link: z.object({ href: z.url(), label: z.string() }).optional(),
        media: z.discriminatedUnion('kind', [
          z.object({ kind: z.literal('gif'), still: image(), motion: z.string().regex(/^\/media\/.+\.gif$/).optional(), alt: z.string() }),
          z.object({
            kind: z.literal('diagram'),
            diagram: z.enum(['race-condition', 'signal-pipeline', 'privacy-flow', 'alert-flow', 'restore-state-machine', 'gateway-shift']),
            alt: z.string(),
          }),
        ]),
        order: z.number().int(),
      })
      .refine((d) => d.metrics.length + d.facts.length <= 3, { message: '핵심 칸(metrics + facts)은 최대 3개' }),
});

const troubleshooting = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/troubleshooting' }),
  schema: z.object({
    title: z.string(),
    team: z.enum(['global', 'retention', 'purchase']),
    summary: z.string().optional(),
    symptom: z.string().optional(),
    definition: z.string().optional(),
    approach: z.string().optional(),
    cause: z.string().optional(),
    fix: z.string().optional(),
    verification: z.string().optional(),
    prevention: z.string().optional(),
    record: z.string().optional(),
    evidence: z.array(evidenceId).min(1),
    related: z.string().optional(),
    order: z.number().int(),
  }),
});

export const collections = { projects, troubleshooting };
