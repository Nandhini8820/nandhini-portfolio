import type { ContactRequest } from '../types/portfolio';

/** Mirrors the server rules in backend/src/Portfolio.Api/Models/ContactRequest.cs. */
export const contactLimits = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  company: { max: 120 },
  message: { min: 20, max: 4000 },
} as const;

export type ContactField = 'name' | 'email' | 'company' | 'message';
export type ContactErrors = Partial<Record<ContactField, string>>;

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function checkText(label: string, value: string, min: number, max: number, required: boolean): string | undefined {
  const text = value.trim();
  if (text.length === 0) return required ? `Enter your ${label.toLowerCase()}.` : undefined;
  if (text.length < min) return `${label} must be at least ${min} characters.`;
  if (text.length > max) return `${label} must be ${max} characters or fewer.`;
  return undefined;
}

export function validateField(field: ContactField, value: string): string | undefined {
  switch (field) {
    case 'name':
      return checkText('Name', value, contactLimits.name.min, contactLimits.name.max, true);
    case 'company':
      return checkText('Company', value, 0, contactLimits.company.max, false);
    case 'message':
      return checkText('Message', value, contactLimits.message.min, contactLimits.message.max, true);
    case 'email': {
      const text = value.trim();
      if (text.length === 0) return 'Enter your email address.';
      if (text.length > contactLimits.email.max || !emailPattern.test(text)) {
        return 'Enter a valid email address, like name@example.com.';
      }
      return undefined;
    }
  }
}

export function validateContact(form: Pick<ContactRequest, ContactField>): ContactErrors {
  const errors: ContactErrors = {};
  (['name', 'email', 'company', 'message'] as const).forEach((field) => {
    const error = validateField(field, form[field]);
    if (error) errors[field] = error;
  });
  return errors;
}
