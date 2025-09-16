# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

You are working in the **@libar/core** package, the foundation library of the Libar AI monorepo. This package provides core types, utilities, and patterns that are used across all @libar packages and the parent monorepo.

**Current Context:**
- Package name: `@libar/core`
- Version: `0.1.0`
- Purpose: Foundation types and utilities for type safety and error handling
- Dependencies: Only `zod` (for schema validation)
- Location: `/packages/core/` within the Libar AI monorepo

## Architecture

### Package Structure
```
core/
├── src/
│   ├── index.ts           # Main export barrel - ALL exports go through here
│   ├── types.ts           # Core types (Result, ResourceLifecycle, etc.)
│   ├── validation.ts      # Zod schemas and validation utilities
│   ├── types/
│   │   ├── branded.ts     # Package-specific branded types
│   │   ├── database.ts    # Database adapter interfaces
│   │   ├── lifecycle.ts   # Resource lifecycle types
│   │   └── result.ts      # Result monad implementation
│   └── utils/
│       └── id-generators.ts  # ID generation utilities
├── dist/                  # Compiled output (CommonJS + type definitions)
├── package.json
└── tsconfig.json
```

### Core Exports

**Branded Types:**
- `ResourceId`, `EphemeralId`, `SessionId`, `CorrelationId` - Type-safe IDs
- Helper functions: `asResourceId()`, `asEphemeralId()`, etc.

**Result Pattern:**
- `Result<T, E>` - Explicit error handling without exceptions
- `Result.ok()`, `Result.err()` - Constructors
- `Result.map()`, `Result.mapErr()` - Transformations
- `Result.unwrap()`, `Result.unwrapOr()` - Value extraction

**Resource Lifecycle:**
- `ResourceLifecycle` enum - States for ephemeral pattern
- `ResourceMetadata` - Standard metadata for all resources
- `ExecutionContext` - Operation context with correlation

**Utilities:**
- `generateId()`, `generateEphemeralId()`, etc. - ID generators
- `generateFingerprint()` - Simple data fingerprinting

## Essential Commands

### Building
```bash
# Build the package (generates dist/)
npm run build

# Type check without building
npm run typecheck

# Clean build artifacts
npm run clean
```

### Testing
```bash
# Note: @libar/core currently has no tests
# Tests would be added as:
# npm test (if configured)
```

### Development Workflow
```bash
# 1. Make changes in src/
# 2. Build the package
npm run build

# 3. Test integration with parent
cd ../..
npm run check:fast

# 4. Watch mode for continuous development
npx tsc --watch
```

## Code Patterns

### Adding New Branded Types
```typescript
// In src/types/branded.ts
export type NewTypeId = Branded<string, 'NewTypeId'>;
export const asNewTypeId = (id: string): NewTypeId => id as NewTypeId;

// Re-export from src/types.ts or src/index.ts
export { NewTypeId, asNewTypeId } from './types/branded';
```

### Adding New Utilities
```typescript
// In src/utils/new-utility.ts
export function newUtility(param: string): Result<string, Error> {
  // Implementation using Result pattern
  return Result.ok(processedValue);
}

// Add to src/index.ts
export * from './utils/new-utility';
```

### Using Zod Schemas
```typescript
// In src/validation.ts
import { z } from 'zod';

export const NewSchema = z.object({
  id: z.string(),
  value: z.number()
});

export type NewType = z.infer<typeof NewSchema>;
```

## Integration Points

### Parent Monorepo Usage
The parent monorepo (`../..`) uses this package extensively:
- **17+ files** import `EphemeralId` type
- **Workflow systems** use Result pattern for error handling
- **Processors** use branded types for type safety

### Dependent Packages
- **@libar/ephemeral** - Depends on core types and utilities
- Future packages will depend on core for foundational patterns

### Type Mapping
When the parent codebase uses different branded types, conversion happens at boundaries:
```typescript
// Parent code converting types
import { EphemeralId as CoreEphemeralId } from '@libar/core';
import { EphemeralId as ConvexEphemeralId } from '../types';

// Convert at integration points
const coreId = convexId as string as CoreEphemeralId;
const convexId = coreId as string as ConvexEphemeralId;
```

## Development Rules

### Package Independence
- **NEVER** import from parent directories (`../`)
- **NEVER** depend on parent monorepo types
- Keep all types self-contained within the package
- Maintain zero external dependencies (except zod)

### Type Safety
- All data contracts use Zod schemas
- Use branded types for all IDs
- Never use `any` type
- Maintain strict TypeScript configuration

### API Design
- Export only through `src/index.ts`
- Keep internal implementations private
- Document all exported functions
- Maintain backward compatibility

### Build Requirements
- Always generates `.d.ts` files with source maps
- Compiles to CommonJS for compatibility
- Must build before parent type checking
- Part of incremental build chain

## Common Issues & Solutions

### Issue: Parent can't find types after changes
```bash
# Solution: Rebuild the package
npm run build

# Then from parent directory
cd ../..
npm run check:fast
```

### Issue: Type incompatibility with parent
```typescript
// Solution: Create type converters (don't change package types)
export function toParentType(coreType: CoreType): ParentType {
  return coreType as unknown as ParentType;
}
```

### Issue: Circular dependency detected
```bash
# Check for improper imports
# Packages should NEVER import from parent
grep -r "\.\./" src/  # Should return nothing
```

## Future Enhancements

Planned additions to @libar/core:
- Proper crypto-based fingerprinting
- More sophisticated Result combinators
- Additional branded type helpers
- Async Result type for Promise handling
- Validation utilities beyond Zod schemas

## Publishing Preparation

When ready for npm publishing:
1. Ensure all tests pass (when added)
2. Update version in package.json
3. Build fresh: `npm run clean && npm run build`
4. Test parent integration: `cd ../.. && npm run check:fast`
5. Publish: `npm publish --access public`

## Quality Checklist

Before committing changes:
- [ ] All exports go through index.ts
- [ ] No imports from parent directories
- [ ] TypeScript strict mode passes
- [ ] Build succeeds: `npm run build`
- [ ] Parent integration works: `cd ../.. && npm run check:fast`
- [ ] No external dependencies added (except approved ones)
- [ ] JSDoc comments on all exported functions
- [ ] Branded types have helper functions