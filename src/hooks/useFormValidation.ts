import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

export interface FieldError {
  field: string;
  message: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
  custom?: (value: any) => string | null;
}

export interface FieldRules {
  [field: string]: ValidationRule;
}

export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateField = useCallback((
    fieldName: string,
    value: any,
    rules: ValidationRule,
    fieldLabel?: string
  ): string | null => {
    const label = fieldLabel || fieldName;

    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${label} é obrigatório`;
    }

    if (typeof value === 'string' && value.trim()) {
      if (rules.minLength && value.length < rules.minLength) {
        return `${label} deve ter pelo menos ${rules.minLength} caracteres`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `${label} deve ter no máximo ${rules.maxLength} caracteres`;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        return rules.patternMessage || `${label} está em formato inválido`;
      }
    }

    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) return customError;
    }

    return null;
  }, []);

  const validate = useCallback((
    values: Record<string, any>,
    rules: FieldRules,
    labels?: Record<string, string>
  ): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};
    let firstError: string | null = null;

    for (const [field, rule] of Object.entries(rules)) {
      const error = validateField(field, values[field], rule, labels?.[field]);
      if (error) {
        newErrors[field] = error;
        if (!firstError) firstError = error;
      }
    }

    setErrors(newErrors);

    if (firstError) {
      toast({
        title: 'Erro de validação',
        description: firstError,
        variant: 'destructive',
      });

      // Focus on first error field
      setTimeout(() => {
        const firstErrorField = Object.keys(newErrors)[0];
        const element = document.getElementById(firstErrorField) || 
                       document.querySelector(`[name="${firstErrorField}"]`);
        if (element instanceof HTMLElement) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }

    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  }, [validateField, toast]);

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
    toast({
      title: 'Erro de validação',
      description: message,
      variant: 'destructive',
    });

    // Focus on error field
    setTimeout(() => {
      const element = document.getElementById(field) || 
                     document.querySelector(`[name="${field}"]`);
      if (element instanceof HTMLElement) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, [toast]);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasError = useCallback((field: string) => !!errors[field], [errors]);
  const getError = useCallback((field: string) => errors[field] || '', [errors]);

  return {
    errors,
    validate,
    validateField,
    setFieldError,
    clearError,
    clearAllErrors,
    hasError,
    getError,
  };
}

// Email validation helper
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Common validation rules
export const commonRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'Digite um email válido',
  },
  password: {
    required: true,
    minLength: 6,
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  title: {
    required: true,
    minLength: 1,
    maxLength: 200,
  },
};
