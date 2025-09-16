# @libar/core

> Core types and utilities for Libar libraries

## 📦 Installation

```bash
npm install @libar/core
```

## 🎯 Purpose

This package provides the foundational types and utilities used across all Libar libraries, ensuring consistency and type safety throughout the ecosystem.

## 🔧 Key Features

### Branded Types

Ensure type safety with nominal typing:

```typescript
import { ResourceId, SessionId, asResourceId } from '@libar/core';

const id: ResourceId = asResourceId('res_123');
// Type-safe - prevents mixing different ID types
```

### Result Type

Explicit error handling without exceptions:

```typescript
import { Result } from '@libar/core';

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return Result.err(new Error('Division by zero'));
  }
  return Result.ok(a / b);
}

const result = divide(10, 2);
if (result.ok) {
  console.log('Result:', result.value); // 5
}
```

### Resource Lifecycle

Standard lifecycle states for resources:

```typescript
import { ResourceLifecycle } from '@libar/core';

const states = [
  ResourceLifecycle.EPHEMERAL,
  ResourceLifecycle.PERSISTED,
  ResourceLifecycle.PROCESSING,
  ResourceLifecycle.COMPLETED,
  ResourceLifecycle.FAILED,
];
```

### Database Operations Interface

Adapter pattern for database agnostic operations:

```typescript
import { DatabaseOperations } from '@libar/core';

class MyAdapter<T> implements DatabaseOperations<T> {
  async insert(data: T): Promise<T> { /* ... */ }
  async get(id: ResourceId): Promise<T | null> { /* ... */ }
  async update(id: ResourceId, updates: Partial<T>): Promise<T> { /* ... */ }
  async delete(id: ResourceId): Promise<void> { /* ... */ }
  async query(filter: Partial<T>): Promise<T[]> { /* ... */ }
}
```

## 📊 Type Exports

- **Branded Types**: `ResourceId`, `SessionId`, `CorrelationId`
- **Result Monad**: `Result<T, E>`
- **Lifecycle**: `ResourceLifecycle` enum
- **Metadata**: `ResourceMetadata`, `ExecutionContext`
- **Database**: `DatabaseOperations<T>` interface
- **Events**: `EventEmitter<T>`, `ResourceEvents`
- **Async**: `CancellableOperation<T>`, `AsyncOptions`
- **Helpers**: ID generators and converters

## 🤝 Contributing

This is an internal library for the Libar AI platform. For contributions, please see the main repository guidelines.

## 📄 License

MIT © Libar AI