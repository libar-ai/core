/**
 * Database adapter interfaces for platform-agnostic storage
 *
 * NOTE: These interfaces define behavioral contracts for adapters
 * and cannot be converted to Zod as they contain function types
 * and generic parameters. They remain as TypeScript interfaces.
 *
 * @architectural-directive: adapter-contract
 * This is a behavioral interface for database adapters, not a data contract.
 * Behavioral interfaces with methods cannot be represented in Zod schemas.
 */

// eslint-disable-next-line local-rules/prevent-unsafe-patterns
export interface DatabaseAdapter<T = unknown> {
  insert(table: string, data: T): Promise<string>;
  get(id: string): Promise<T | null>;
  patch(id: string, updates: Partial<T>): Promise<void>;
  replace(id: string, data: T): Promise<void>;
  delete(id: string): Promise<void>;
  query(table: string): QueryBuilder<T>;
}

export interface QueryBuilder<T> {
  filter(predicate: (item: T) => boolean): QueryBuilder<T>;
  limit(n: number): QueryBuilder<T>;
  collect(): Promise<T[]>;
  first(): Promise<T | null>;
}

export interface StorageAdapter {
  get(key: string): Promise<Buffer | null>;
  put(key: string, data: Buffer): Promise<void>;
  delete(key: string): Promise<void>;
  generateUploadUrl(): Promise<string>;
}
