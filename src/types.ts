/**
 * Core types for @libar libraries
 *
 * These types form the foundation for all Libar patterns and utilities.
 * They are designed to be platform-agnostic while enabling type-safe
 * implementations across different environments.
 */

import { z } from 'zod';

// Define branded types locally to avoid cross-dependencies
export type SessionId = string & { readonly __brand: 'SessionId' };
export type CorrelationId = string & { readonly __brand: 'CorrelationId' };

// Helper functions for branded types
export const asSessionId = (id: string): SessionId => id as SessionId;
export const asCorrelationId = (id: string): CorrelationId =>
  id as CorrelationId;

// ============================================================================
// Branded Types for Type Safety
// ============================================================================

/**
 * Branded type helper for creating nominal types
 */
export type Brand<K, T> = K & { __brand: T };

/**
 * Unique resource identifier
 */
export type ResourceId = Brand<string, 'ResourceId'>;

// SessionId and CorrelationId are imported from convex/toolkit/types.ts to avoid duplication

// ============================================================================
// Result Type for Error Handling
// ============================================================================

/**
 * Result type for explicit error handling without exceptions
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const Result = {
  ok: <T>(value: T): Result<T> => ({ ok: true, value }),
  err: <E = Error>(error: E): Result<never, E> => ({ ok: false, error }),

  isOk: <T, E>(result: Result<T, E>): result is { ok: true; value: T } =>
    result.ok,
  isErr: <T, E>(result: Result<T, E>): result is { ok: false; error: E } =>
    !result.ok,

  map: <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> => {
    if (result.ok) {
      return { ok: true, value: fn(result.value) };
    } else {
      return { ok: false, error: (result as { ok: false; error: E }).error };
    }
  },

  mapErr: <T, E, F>(
    result: Result<T, E>,
    fn: (error: E) => F
  ): Result<T, F> => {
    if (result.ok) {
      return { ok: true, value: result.value };
    } else {
      return {
        ok: false,
        error: fn((result as { ok: false; error: E }).error),
      };
    }
  },

  unwrap: <T, E>(result: Result<T, E>): T => {
    if (result.ok) {
      return result.value;
    } else {
      throw (result as { ok: false; error: E }).error;
    }
  },

  unwrapOr: <T, E>(result: Result<T, E>, defaultValue: T): T =>
    result.ok ? result.value : defaultValue,
};

// Export helper functions for easier access
export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const err = <E = Error>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

// ============================================================================
// Resource Lifecycle States
// ============================================================================

/**
 * Lifecycle states for resources in the ephemeral pattern
 */
export enum ResourceLifecycle {
  /** Resource is ephemeral and may be cleaned up */
  EPHEMERAL = 'EPHEMERAL',

  /** Resource has been persisted and is permanent */
  PERSISTED = 'PERSISTED',

  /** Resource is being processed */
  PROCESSING = 'PROCESSING',

  /** Resource completed successfully */
  COMPLETED = 'COMPLETED',

  /** Resource processing failed */
  FAILED = 'FAILED',

  /** Resource timed out and was cleaned up */
  EXPIRED = 'EXPIRED',

  /** Resource was deleted/rolled back */
  DELETED = 'DELETED',
}

// ============================================================================
// Metadata and Context
// ============================================================================

/**
 * Standard metadata for all resources
 * Extended to support lifecycle and ephemeral pattern requirements
 */
export const ResourceMetadataSchema = z.object({
  createdAt: z.number(),
  updatedAt: z.number(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  version: z.number(),
  tags: z.record(z.string(), z.string()).optional(),
  labels: z.record(z.string(), z.string()).optional(),
  // Fields needed for ephemeral pattern
  id: z.string().optional(),
  lifecycle: z.nativeEnum(ResourceLifecycle).optional(),
  fingerprint: z.string().optional(),
  expiresAt: z.number().optional(),
});

export type ResourceMetadata = z.infer<typeof ResourceMetadataSchema>;

/**
 * Execution context for operations
 */
export const ExecutionContextSchema = z.object({
  requestId: z.string(),
  sessionId: z.string().optional(), // Will be typed as SessionId when cast
  correlationId: z.string().optional(), // Will be typed as CorrelationId when cast
  userId: z.string().optional(),
  workflowId: z.string().optional(),
  timestamp: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ExecutionContext = z.infer<typeof ExecutionContextSchema>;

// ============================================================================
// Database Operations Interface
// ============================================================================

/**
 * Generic database operations interface for adapter pattern
 * NOTE: This interface defines the contract for database adapters
 * and cannot be converted to Zod as it's a behavioral interface
 *
 * @architectural-directive: adapter-contract
 * This is a behavioral interface for database adapters, not a data contract.
 * Behavioral interfaces with methods cannot be represented in Zod schemas.
 */
// eslint-disable-next-line local-rules/prevent-unsafe-patterns
export interface DatabaseOperations<T> {
  insert(data: T): Promise<T>;
  get(id: ResourceId): Promise<T | null>;
  update(id: ResourceId, updates: Partial<T>): Promise<T>;
  delete(id: ResourceId): Promise<void>;
  query(filter: Partial<T>): Promise<T[]>;
  transaction<R>(fn: (tx: DatabaseOperations<T>) => Promise<R>): Promise<R>;
}

// ============================================================================
// Event System
// ============================================================================

/**
 * Resource event types
 */
export const ResourceEventsSchema = z.object({
  created: z.object({
    resourceId: z.string(), // Will be typed as ResourceId when cast
    timestamp: z.number(),
  }),
  updated: z.object({
    resourceId: z.string(), // Will be typed as ResourceId when cast
    changes: z.record(z.string(), z.unknown()),
    timestamp: z.number(),
  }),
  deleted: z.object({
    resourceId: z.string(), // Will be typed as ResourceId when cast
    reason: z.string().optional(),
    timestamp: z.number(),
  }),
  stateChanged: z.object({
    resourceId: z.string(), // Will be typed as ResourceId when cast
    from: z.nativeEnum(ResourceLifecycle),
    to: z.nativeEnum(ResourceLifecycle),
    timestamp: z.number(),
  }),
});

export type ResourceEvents = z.infer<typeof ResourceEventsSchema>;

/**
 * Event emitter interface
 */
export interface EventEmitter<T extends Record<string, unknown>> {
  emit<K extends keyof T>(event: K, data: T[K]): void;
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
  off<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
}

// ============================================================================
// Async Operation Support
// ============================================================================

/**
 * Cancellable operation with abort support
 */
export interface CancellableOperation<T> {
  promise: Promise<T>;
  cancel: () => void;
}

/**
 * Options for async operations
 */
export const AsyncOptionsSchema = z.object({
  signal: z.instanceof(AbortSignal).optional(),
  timeout: z.number().optional(),
  retries: z.number().optional(),
  retryDelay: z.number().optional(),
});

export type AsyncOptions = z.infer<typeof AsyncOptionsSchema>;

// ============================================================================
// Pattern Configuration
// ============================================================================

/**
 * Base configuration for all patterns
 * NOTE: This interface defines logger and metrics contracts
 * and cannot be converted to Zod as it contains function types
 */
export interface PatternConfig {
  logger?: {
    info: (message: string, data?: unknown) => void;
    warn: (message: string, data?: unknown) => void;
    error: (message: string, error?: unknown) => void;
    debug: (message: string, data?: unknown) => void;
  };
  metrics?: {
    increment: (metric: string, tags?: Record<string, string>) => void;
    gauge: (
      metric: string,
      value: number,
      tags?: Record<string, string>
    ) => void;
    timing: (
      metric: string,
      duration: number,
      tags?: Record<string, string>
    ) => void;
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a branded ResourceId
 */
export const asResourceId = (id: string): ResourceId => id as ResourceId;

// asSessionId and asCorrelationId are imported from convex/toolkit/types.ts to avoid duplication

// Note: ID generation functions moved to utils/id-generators.ts to avoid duplication

// Export EphemeralId type
export type EphemeralId = string & { readonly __brand: 'EphemeralId' };
export const asEphemeralId = (id: string): EphemeralId => id as EphemeralId;
