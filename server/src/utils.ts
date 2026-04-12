import { randomUUID } from 'crypto';

/** Generate a short unique ID (UUID v4) */
export function uid(): string {
  return randomUUID();
}
