/**
 * Branded types for type-safe IDs
 *
 * These are package-specific branded types that provide type safety
 * for the @libar/core package. They use the unique symbol approach
 * for nominal typing, which is independent from the main codebase.
 */

// Unique symbol-based branding approach for packages
declare const brand: unique symbol;
export type Brand<B> = { [brand]: B };
export type Branded<T, B> = T & Brand<B>;

// Package-specific branded types
export type ResourceId = Branded<string, 'ResourceId'>;
export type EphemeralId = Branded<string, 'EphemeralId'>;

// Helper functions for package-specific types
export const asResourceId = (id: string): ResourceId => id as ResourceId;
export const asEphemeralId = (id: string): EphemeralId => id as EphemeralId;
