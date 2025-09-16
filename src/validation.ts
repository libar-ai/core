/**
 * Validation utilities for @libar/core
 *
 * Provides Zod schemas and validation helpers for type-safe operations
 */

import { z } from 'zod';
import type { ExecutionContext } from './types';
import {
  ResourceMetadataSchema,
  ExecutionContextSchema,
  ResourceEventsSchema,
  AsyncOptionsSchema,
  ResourceLifecycle,
} from './types';

// Re-export core schemas for convenience
export {
  ResourceMetadataSchema,
  ExecutionContextSchema,
  ResourceEventsSchema,
  AsyncOptionsSchema,
};

// Re-export lifecycle enum for validation
export { ResourceLifecycle };

/**
 * Validates data against a schema and returns a Result type
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { ok: true; value: T } | { ok: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { ok: true, value: result.data };
  } else {
    return { ok: false, error: result.error };
  }
}

/**
 * Generic string ID validator
 * Validates that a value is a non-empty string suitable for use as an ID
 */
export const IdSchema = z
  .string()
  .min(1, 'ID cannot be empty')
  .refine(
    val => typeof val === 'string' && val.trim().length > 0,
    'ID must be a non-empty string'
  );

/**
 * Simplified ID validation for package use
 * (Full zid implementation remains in the main convex codebase)
 */
export const validateId = (id: string): boolean => {
  return IdSchema.safeParse(id).success;
};

/**
 * Resource ID schema for branded ResourceId type
 */
export const ResourceIdSchema = z
  .string()
  .min(1)
  .refine(val => val.startsWith('res_'), 'ResourceId must start with "res_"');

/**
 * Ephemeral ID schema for branded EphemeralId type
 */
export const EphemeralIdSchema = z
  .string()
  .min(1)
  .refine(val => val.startsWith('eph_'), 'EphemeralId must start with "eph_"');

/**
 * Validation helper for runtime type checking
 */
export function isValidResourceMetadata(data: unknown): data is {
  createdAt: number;
  updatedAt: number;
  version: number;
  createdBy?: string;
  updatedBy?: string;
  tags?: Record<string, string>;
  labels?: Record<string, string>;
} {
  return ResourceMetadataSchema.safeParse(data).success;
}

/**
 * Validation helper for execution context
 */
export function isValidExecutionContext(
  data: unknown
): data is ExecutionContext {
  return ExecutionContextSchema.safeParse(data).success;
}

/**
 * Parse and validate unknown data with schema
 */
export function parseWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Validation failed: ${result.error.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', ')}`
    );
  }
  return result.data;
}
