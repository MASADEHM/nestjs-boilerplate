import { setPropertiesFromData } from './object.helper';

/**
 * Generic function to create a response transformer from data - used for transforming list items
 * @param data - The source data object
 * @param responseClass - The response class constructor
 * @returns New instance of response type with properties set from data
 */
export function createResponseFromData<TResponse, TData extends object>(
  data: TData,
  responseClass: new () => TResponse
): TResponse {
  const response = new responseClass();
  return setPropertiesFromData(response, data);
}

/**
 * Generic function to create multiple response objects from data array - used for transforming lists
 * @param data - Array of source data objects
 * @param responseClass - The response class constructor
 * @returns Array of response objects with properties set from data
 */
export function createResponseArrayFromData<TResponse, TData extends object>(
  data: TData[],
  responseClass: new () => TResponse
): TResponse[] {
  return data.map((item) => createResponseFromData(item, responseClass));
}

/**
 * Creates default static methods for response classes
 * Use this when you don't need custom transformation logic
 */
export function createDefaultFrom<TResponse, TData extends object>(
  responseClass: new () => TResponse
) {
  return (data: TData): TResponse => {
    return createResponseFromData(data, responseClass);
  };
}

/**
 * Creates default static fromMany method for response classes
 * Use this when you don't need custom transformation logic
 */
export function createDefaultFromMany<TResponse, TData extends object>(
  responseClass: new () => TResponse
) {
  return (data: TData[]): TResponse[] => {
    return createResponseArrayFromData(data, responseClass);
  };
}

/**
 * Base response transformer class that provides default transformation methods
 * Note: Due to TypeScript limitations with static methods and inheritance,
 * this class is provided as a reference. For simple cases, use the helper functions above.
 * Note: Using abstract class with static methods for inheritance pattern (used by LoginResponse)
 */
export abstract class BaseResponseTransformer {
  /**
   * Creates a single response object from data - used for transforming list items
   * Override this method if you need custom transformation logic
   */
  public static from<TResponse, TData extends object>(
    this: new () => TResponse,
    data: TData
  ): TResponse {
    return createResponseFromData(data, this);
  }

  /**
   * Creates multiple response objects from data array - used for transforming lists
   * Override this method if you need custom transformation logic
   */
  public static fromMany<TResponse, TData extends object>(
    this: new () => TResponse,
    data: TData[]
  ): TResponse[] {
    return createResponseArrayFromData(data, this);
  }
}
