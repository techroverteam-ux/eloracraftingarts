import { ValidationError, ValidationRule } from './types';

export class ValidationUtils {
  static validateField(value: any, rules: ValidationRule[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const rule of rules) {
      const error = this.validateRule(value, rule);
      if (error) errors.push(error);
    }

    return errors;
  }

  private static validateRule(value: any, rule: ValidationRule): ValidationError | null {
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return { field: '', message: rule.message, code: 'REQUIRED' };
        }
        break;

      case 'min':
        if (typeof value === 'number' && value < rule.value) {
          return { field: '', message: rule.message, code: 'MIN_VALUE' };
        }
        if (typeof value === 'string' && value.length < rule.value) {
          return { field: '', message: rule.message, code: 'MIN_LENGTH' };
        }
        break;

      case 'max':
        if (typeof value === 'number' && value > rule.value) {
          return { field: '', message: rule.message, code: 'MAX_VALUE' };
        }
        if (typeof value === 'string' && value.length > rule.value) {
          return { field: '', message: rule.message, code: 'MAX_LENGTH' };
        }
        break;

      case 'pattern':
        if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
          return { field: '', message: rule.message, code: 'PATTERN_MISMATCH' };
        }
        break;
    }

    return null;
  }

  static validateExcelStructure(headers: string[], requiredColumns: string[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));

    if (missingColumns.length > 0) {
      errors.push({
        field: 'headers',
        message: `Missing required columns: ${missingColumns.join(', ')}`,
        code: 'MISSING_COLUMNS'
      });
    }

    return errors;
  }

  static validateFileType(file: File, allowedTypes: string[]): ValidationError | null {
    if (!allowedTypes.includes(file.type)) {
      return {
        field: 'file',
        message: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        code: 'INVALID_FILE_TYPE'
      };
    }
    return null;
  }

  static validateFileSize(file: File, maxSizeMB: number): ValidationError | null {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        field: 'file',
        message: `File size exceeds ${maxSizeMB}MB limit`,
        code: 'FILE_TOO_LARGE'
      };
    }
    return null;
  }
}

export const VALIDATION_RULES = {
  email: {
    type: 'pattern' as const,
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  phone: {
    type: 'pattern' as const,
    value: /^\+?[\d\s-()]+$/,
    message: 'Please enter a valid phone number'
  },
  required: {
    type: 'required' as const,
    message: 'This field is required'
  }
};

export const FILE_CONSTRAINTS = {
  images: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeMB: 10
  },
  documents: {
    allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    maxSizeMB: 25
  },
  excel: {
    allowedTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
    maxSizeMB: 50
  }
};