/**
 * Resource lifecycle management types
 */

import { z } from 'zod';

export enum ResourceLifecycle {
  EPHEMERAL = 'EPHEMERAL', // Temporary, will be cleaned up
  PERSISTED = 'PERSISTED', // Permanently stored
  EXPIRED = 'EXPIRED', // Timed out and cleaned up
  DELETED = 'DELETED', // Explicitly removed
}

// Extended ResourceMetadata for lifecycle-aware resources
export const ExtendedResourceMetadataSchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  version: z.number().default(1),
  expiresAt: z.number().optional(),
  lifecycle: z.nativeEnum(ResourceLifecycle),
  fingerprint: z.string().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  tags: z.record(z.string(), z.string()).optional(),
  labels: z.record(z.string(), z.string()).optional(),
});

export type ExtendedResourceMetadata = z.infer<
  typeof ExtendedResourceMetadataSchema
>;

// Keep the original for backward compatibility
export type ResourceMetadata = ExtendedResourceMetadata;

export const ExecutionContextSchema = z.object({
  requestId: z.string(),
  sessionId: z.string().optional(),
  correlationId: z.string().optional(),
  timestamp: z.number(),
  userId: z.string().optional(),
});

export type ExecutionContext = z.infer<typeof ExecutionContextSchema>;

export const ResourceEventSchema = z.object({
  type: z.enum(['created', 'updated', 'persisted', 'expired', 'deleted']),
  resourceId: z.string(),
  timestamp: z.number(),
  context: ExecutionContextSchema,
  data: z.unknown().optional(),
});

export type ResourceEvent<T = unknown> = z.infer<typeof ResourceEventSchema> & {
  data?: T;
};
