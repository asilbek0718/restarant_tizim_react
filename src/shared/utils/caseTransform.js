/**
 * Enterprise Case Transformation Layer
 * Converts between Supabase snake_case and Frontend camelCase.
 * Used by all services and realtime handlers.
 */

/**
 * Converts a snake_case string to camelCase
 */
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts a camelCase string to snake_case  
 */
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Recursively transforms all keys in an object from snake_case to camelCase.
 * Handles nested objects and arrays.
 * Used after SELECT / Realtime payloads from Supabase.
 */
export function toFrontend(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toFrontend);
  if (typeof obj !== 'object') return obj;

  const result = {};
  for (const key of Object.keys(obj)) {
    const camelKey = snakeToCamel(key);
    const value = obj[key];
    result[camelKey] = (value !== null && typeof value === 'object') ? toFrontend(value) : value;
  }

  // Normalize table_number / tableNumber / number for frontend compatibility
  if ('tableNumber' in result || 'table_number' in obj) {
    const num = obj.table_number !== undefined && obj.table_number !== null ? obj.table_number : obj.number;
    if (num !== undefined && num !== null) {
      result.number = num;
      result.tableNumber = num;
    }
  }

  return result;
}

/**
 * Recursively transforms all keys in an object from camelCase to snake_case.
 * Handles nested objects and arrays.
 * Used before INSERT / UPDATE / UPSERT to Supabase.
 */
export function toDatabase(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toDatabase);
  if (typeof obj !== 'object') return obj;

  const result = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = camelToSnake(key);
    const value = obj[key];
    result[snakeKey] = (value !== null && typeof value === 'object' && !Array.isArray(value)) ? toDatabase(value) : value;
  }

  // Normalize number / tableNumber / table_number for Supabase compatibility
  if ('number' in obj) {
    result.table_number = obj.number;
    result.number = obj.number;
  }
  if ('tableNumber' in obj) {
    result.table_number = obj.tableNumber;
    result.number = obj.tableNumber;
  }

  return result;
}
