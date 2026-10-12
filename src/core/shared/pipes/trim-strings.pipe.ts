import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimStringsPipe implements PipeTransform {
  public transform(value: unknown): unknown {
    const visited = new WeakSet<object>();
    return this.trimRecursive(value, visited);
  }

  private trimRecursive(value: unknown, visited: WeakSet<object>): unknown {
    // Handle primitives
    if (typeof value === 'string') {
      return value.trim();
    }

    if (value === null || value === undefined || typeof value !== 'object') {
      return value;
    }

    // Prevent circular references
    if (visited.has(value)) {
      return value;
    }
    visited.add(value);

    try {
      // Handle arrays
      if (Array.isArray(value)) {
        return value.map((item: unknown) => this.trimRecursive(item, visited));
      }

      // Handle Date objects (don't modify them)
      if (value instanceof Date) {
        return value;
      }

      // Handle plain objects
      if (this.isPlainObject(value)) {
        const trimmedObject: Record<string, unknown> = {};
        for (const key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            trimmedObject[key] = this.trimRecursive(value[key], visited);
          }
        }
        return trimmedObject;
      }

      // Return other object types as-is (class instances, etc.)
      return value;
    } finally {
      visited.delete(value);
    }
  }

  private isPlainObject(value: object): value is Record<string, unknown> {
    return value.constructor === Object;
  }
}
