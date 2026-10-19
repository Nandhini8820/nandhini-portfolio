import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ApiError } from '../../services/apiClient';
import { contactService as defaultContactService } from '../../services/contactService';
import { contactLimits, validateContact, validateField, type ContactErrors, type ContactField } from '../../lib/validation';
import type { ContactRequest } from '../../types/portfolio';
import { Icon } from '../ui/Icon';

export interface ContactDraft {
  message: string;
  /** Changes on every request so the same project can be asked about twice. */
  key: number;
}

interface ContactFormProps {
  email: string;
  draft?: ContactDraft | null;
  service?: Pick<typeof defaultContactService, 'send'>;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

const emptyForm: ContactRequest = { name: '', email: '', company: '', message: '', website: '' };
const fieldOrder: ContactField[] = ['name', 'email', 'company', 'message'];

export function ContactForm({ email, draft, service = defaultContactService }: ContactFormProps) {
  const [form, setForm] = useState<ContactRequest>(emptyForm);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('');
  const fieldRefs = useRef<Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const statusRef = useRef<HTMLDivElement>(null);

  // A project's "Ask about" button pre-fills the message and moves focus to it.
  useEffect(() => {
    if (!draft) return;
    setStatus('idle');
    setForm((current) => ({ ...current, message: draft.message }));
    setErrors((current) => ({ ...current, message: undefined }));
    fieldRefs.current.message?.focus({ preventScroll: true });
  }, [draft]);

  const update = (field: keyof ContactRequest) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    // Once a field has shown an error, re-check it as the person fixes it.
    if (field !== 'website' && errors[field]) {
      setErrors((current) => ({ ...current, [field]: validateField(field, value) }));
    }
  };

  // Check a field when the person leaves it, but don't flag empty fields until they submit.
  const onBlur = (field: ContactField) => () => {
    if (form[field].trim().length === 0) return;
    setErrors((current) => ({ ...current, [field]: validateField(field, form[field]) }));
  };

  const focusFirstError = (found: ContactErrors) => {
    const first = fieldOrder.find((field) => found[field]);
    if (first) fieldRefs.current[first]?.focus();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'submitting') return;

    const found = validateContact(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus('idle');
      setFeedback('');
      focusFirstError(found);
      return;
    }

    setStatus('submitting');
    setFeedback('');
    try {
      const response = await service.send({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        message: form.message.trim(),
      });
      setStatus('success');
      setFeedback(response.message);
      setForm(emptyForm);
      setErrors({});
      requestAnimationFrame(() => statusRef.current?.focus());
    } catch (error) {
      setStatus('error');
      if (error instanceof ApiError && error.kind === 'validation') {
        const serverErrors = error.fieldErrors as ContactErrors;
        setErrors(serverErrors);
        setFeedback('Some fields need attention. Check the messages below each field.');
        focusFirstError(serverErrors);
        return;
      }
      if (error instanceof ApiError && error.kind === 'rateLimited') {
        setFeedback(error.message);
      } else if (error instanceof ApiError && (error.kind === 'network' || error.kind === 'timeout')) {
        setFeedback(`${error.message} You can also email me directly at ${email}.`);
      } else {
        setFeedback(`Your message couldn’t be sent. Please try again, or email me directly at ${email}.`);
      }
      requestAnimationFrame(() => statusRef.current?.focus());
    }
  };

  const describedBy = (field: ContactField, extra?: string) =>
    [errors[field] ? `contact-${field}-error` : null, extra].filter(Boolean).join(' ') || undefined;

  if (status === 'success') {
    return (
      <div className="form-status form-status--success" role="status" tabIndex={-1} ref={statusRef}>
        <Icon name="check" size={28} />
        <div>
          <p className="form-status__title">Message sent</p>
          <p>{feedback}</p>
          <button type="button" className="button button--secondary button--small" onClick={() => setStatus('idle')}>
            Send another message
          </button>
        </div>
      </div>
    );
  }

  const submitting = status === 'submitting';
  const remaining = contactLimits.message.max - form.message.length;

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate aria-describedby="contact-form-note">
      <p id="contact-form-note" className="contact-form__note">
        All fields except company are required.
      </p>

      {status === 'error' && feedback ? (
        <div className="form-status form-status--error" role="alert" tabIndex={-1} ref={statusRef}>
          <Icon name="alert" size={22} />
          <p>{feedback}</p>
        </div>
      ) : null}

      <div className="contact-form__row">
        <div className={`field ${errors.name ? 'field--invalid' : ''}`}>
          <label htmlFor="contact-name">Name</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={update('name')}
            onBlur={onBlur('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy('name')}
            maxLength={contactLimits.name.max}
            ref={(element) => {
              fieldRefs.current.name = element;
            }}
          />
          {errors.name ? (
            <p id="contact-name-error" className="field__error">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className={`field ${errors.email ? 'field--invalid' : ''}`}>
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={form.email}
            onChange={update('email')}
            onBlur={onBlur('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy('email')}
            maxLength={contactLimits.email.max}
            ref={(element) => {
              fieldRefs.current.email = element;
            }}
          />
          {errors.email ? (
            <p id="contact-email-error" className="field__error">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className={`field ${errors.company ? 'field--invalid' : ''}`}>
        <label htmlFor="contact-company">
          Company <span className="field__optional">(optional)</span>
        </label>
        <input
          id="contact-company"
          name="company"
          type="text"
          autoComplete="organization"
          value={form.company}
          onChange={update('company')}
          onBlur={onBlur('company')}
          aria-invalid={Boolean(errors.company)}
          aria-describedby={describedBy('company')}
          maxLength={contactLimits.company.max}
          ref={(element) => {
            fieldRefs.current.company = element;
          }}
        />
        {errors.company ? (
          <p id="contact-company-error" className="field__error">
            {errors.company}
          </p>
        ) : null}
      </div>

      <div className={`field ${errors.message ? 'field--invalid' : ''}`}>
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          value={form.message}
          onChange={update('message')}
          onBlur={onBlur('message')}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy('message', 'contact-message-count')}
          maxLength={contactLimits.message.max}
          ref={(element) => {
            fieldRefs.current.message = element;
          }}
        />
        <div className="field__footer">
          {errors.message ? (
            <p id="contact-message-error" className="field__error">
              {errors.message}
            </p>
          ) : (
            <span />
          )}
          <p id="contact-message-count" className="field__count">
            {remaining} characters left
          </p>
        </div>
      </div>

      {/* Honeypot: hidden from people and assistive technology; bots often fill it in. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} />
      </div>

      <button type="submit" className="button button--primary contact-form__submit" disabled={submitting} aria-disabled={submitting}>
        {submitting ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Sending…
          </>
        ) : (
          'Send message'
        )}
      </button>
      <p className="visually-hidden" role="status" aria-live="polite">
        {submitting ? 'Sending your message' : ''}
      </p>
    </form>
  );
}
