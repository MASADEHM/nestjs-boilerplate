/**
 * Generic utility function to set properties dynamically from data objects
 * Only sets properties that are defined in the target object
 * @param target - The target object to set properties on
 * @param data - The source data object
 * @returns The target object with properties set
 */
export function setPropertiesFromData<T, D extends object>(
  target: T,
  data: D
): T {
  // Get all property names from the target object
  const targetProperties = Object.getOwnPropertyNames(target).filter(
    (key) => key !== 'constructor'
  );

  // Loop through target properties and set them if they exist in source data
  targetProperties.forEach((key) => {
    if (key in data) {
      const value = data[key as keyof D];
      // Set property dynamically with type safety
      (target as Record<string, unknown>)[key] = value;
    }
  });

  return target;
}

/**
 * Generic utility function to create objects from data using the dynamic property setter
 * @param data - The source data object
 * @param targetType - Constructor function for the target type
 * @returns New instance of target type with properties set from data
 */
export function createFromData<T, D extends object>(
  data: D,
  targetType: new () => T
): T {
  const target = new targetType();
  return setPropertiesFromData(target, data);
}

/**
 * Generic utility function to map arrays of data to target objects
 * @param dataArray - Array of source data objects
 * @param targetType - Constructor function for the target type
 * @returns Array of target objects with properties set from data
 */
export function mapFromDataArray<T, D extends object>(
  dataArray: D[],
  targetType: new () => T
): T[] {
  return dataArray.map((item) => createFromData(item, targetType));
}
