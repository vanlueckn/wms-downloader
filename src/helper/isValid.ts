import { Validator, ValidatorResult, ValidationError } from 'jsonschema';
import { ValidationResult, JsonSchema } from '../types';

const v = new Validator();

/**
 * Validates a json by a json schema.
 * @param instance json object to validate
 * @param schema json schema
 * @returns Is valid: true; Is invalid: Array of Errors
 */
export function isValid(instance: unknown, schema: JsonSchema): ValidationResult {
  if (instance) {
    if (schema) {
      // Validate
      const result: ValidatorResult = v.validate(instance, schema);
      const err: ValidationError[] = result.errors;

      if (err.length === 0) {
        // All ok
        return true;
      } else {
        // Errors
        return err;
      }
    }
  }
  return [];
}

export default isValid;
