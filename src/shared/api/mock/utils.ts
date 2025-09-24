/**
 * Helper functions for generating mock data
 */

/**
 * Generate a random ID
 */
export const generateId = (): number => {
  return Math.floor(Math.random() * 10000);
};

/**
 * Generate a random string of the specified length
 */
export const generateRandomString = (length: number = 10): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate mock data based on a schema
 * @param schema An object with keys and types to generate
 * @example
 * generateMockData({
 *   id: 'id',
 *   name: 'string',
 *   age: 'number',
 *   isActive: 'boolean',
 *   createdAt: 'date'
 * })
 */
export const generateMockData = <T extends Record<string, string>>(
  schema: T
): Record<keyof T, any> => {
  const result: Record<string, any> = {};

  for (const [key, type] of Object.entries(schema)) {
    switch (type) {
      case "id":
        result[key] = generateId();
        break;
      case "string":
        result[key] = generateRandomString(8);
        break;
      case "number":
        result[key] = Math.floor(Math.random() * 100);
        break;
      case "boolean":
        result[key] = Math.random() > 0.5;
        break;
      case "date":
        result[key] = new Date().toISOString();
        break;
      default:
        result[key] = null;
    }
  }

  return result as Record<keyof T, any>;
};

/**
 * Generate an array of mock data items
 */
export const generateMockArray = <T extends Record<string, string>>(
  schema: T,
  count: number = 10
): Record<keyof T, any>[] => {
  return Array.from({ length: count }, () => generateMockData(schema));
};
