/**
 * ID generation utilities
 */

export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

export function generateSessionId(): string {
  return generateId('session');
}

export function generateCorrelationId(): string {
  return generateId('corr');
}

export function generateResourceId(): string {
  return generateId('res');
}

export function generateEphemeralId(): string {
  return generateId('eph');
}

export function generateWorkflowId(): string {
  return generateId('wf');
}

export function generateFingerprint(data: unknown): string {
  // Simple fingerprinting for now - in production would use proper hashing
  const dataObj = data as Record<string, unknown>;
  const str = JSON.stringify(
    data,
    dataObj && typeof dataObj === 'object'
      ? Object.keys(dataObj).sort()
      : undefined
  );
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
