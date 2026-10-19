import { validateContact, validateField } from './validation';

const valid = {
  name: 'Priya Raman',
  email: 'priya@example.com',
  company: '',
  message: 'Hi Nandhini, I would like to talk about a role.',
};

describe('contact validation (mirrors the server rules)', () => {
  it('accepts a complete form', () => {
    expect(validateContact(valid)).toEqual({});
  });

  it('reports every missing required field at once', () => {
    expect(validateContact({ name: '', email: '', company: '', message: '' })).toEqual({
      name: 'Enter your name.',
      email: 'Enter your email address.',
      message: 'Enter your message.',
    });
  });

  it.each([
    ['name', 'A', 'Name must be at least 2 characters.'],
    ['email', 'not-an-email', 'Enter a valid email address, like name@example.com.'],
    ['email', 'name@domain', 'Enter a valid email address, like name@example.com.'],
    ['message', 'Too short', 'Message must be at least 20 characters.'],
    ['company', 'x'.repeat(121), 'Company must be 120 characters or fewer.'],
  ] as const)('rejects %s = %p', (field, value, expected) => {
    expect(validateField(field, value)).toBe(expected);
  });

  it('ignores surrounding whitespace', () => {
    expect(validateField('name', '   ')).toBe('Enter your name.');
    expect(validateField('email', '  priya@example.com  ')).toBeUndefined();
  });
});
